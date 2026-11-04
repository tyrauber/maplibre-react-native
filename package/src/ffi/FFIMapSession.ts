// The runtime, map, session and surface lifecycle is adapted from
// maplibre/maplibre-native-ffi examples/react-native/src/MapController.ts at
// 616f9175. BSD-2-Clause: see LICENSE-maplibre-native-ffi in this folder.

import { PixelRatio } from "react-native";

import { collectAttributions } from "./attribution";
import {
  type LogicalSize,
  type MapHandle,
  nativeFfi,
  type RenderSessionAttachOptions,
  type RenderSessionHandle,
  type RuntimeHandle,
  type SurfaceHandles,
} from "./nativeFfi";
import type { MapController } from "../components/map/engine/MapController";

type Style = { url: string } | { json: unknown };

/**
 * Reads a `mapStyle` string as a style document when it starts with a brace,
 * otherwise as a URL. The binding serializes a JSON value itself, so a document
 * is parsed here and passed as an object.
 */
function readStyle(mapStyle: string): Style {
  return mapStyle.trimStart().startsWith("{")
    ? { json: JSON.parse(mapStyle) }
    : { url: mapStyle };
}

/**
 * One map drawn through the MapLibre Native C API on the package's surface
 * view. The view lends its surface when the platform provides one; the session
 * attaches a render session to it, or gives an attached session the new
 * surface.
 *
 * `start()` and `dispose()` follow the view's effect. Strict Mode and Fast
 * Refresh dispose and start the same object again, so work that a start began
 * drops what it made once a later dispose has run.
 */
export class FFIMapSession {
  readonly #onAttributions: (attributions: string[]) => void;
  #active = false;
  #failed = false;
  #epoch = 0;

  #controller: MapController | undefined;
  #style: Style | undefined;
  #mapReady = false;
  #styleLoaded = false;
  #attributionsKey = "";
  #attributionsRequest = 0;

  #runtime: RuntimeHandle | undefined;
  #map: MapHandle | undefined;
  #session: RenderSessionHandle | undefined;

  // The view's latest size, its latest surface, and the surface that the
  // session renders to.
  #size: LogicalSize | undefined;
  #surface: number | undefined;
  #target: number | undefined;
  // Target changes run one at a time, in the order the view reports them.
  #targets: Promise<void> = Promise.resolve();

  constructor(onAttributions: (attributions: string[]) => void) {
    this.#onAttributions = onAttributions;
  }

  start(): void {
    if (this.#active) return;
    this.#active = true;
    this.#failed = false;
    this.#start(++this.#epoch).catch((error: unknown) => this.#fail(error));
  }

  /** Releases everything this session holds. A second call does nothing. */
  dispose(): void {
    if (!this.#active) return;
    this.#active = false;
    this.#epoch++;
    this.#mapReady = false;
    this.#styleLoaded = false;
    const session = this.#session;
    const map = this.#map;
    const runtime = this.#runtime;
    const target = this.#target;
    this.#session = undefined;
    this.#map = undefined;
    this.#runtime = undefined;
    this.#target = undefined;
    // After any target change in flight, release the session while its wakes
    // still service it, and only then let go of the surface it used.
    this.#targets = this.#targets.then(async () => {
      try {
        await session?.release();
        map?.dispose();
        runtime?.dispose();
      } catch (error) {
        // On a reload, React Native has the host clean the binding up before
        // React unmounts the app, and that cleanup already ended these objects.
        console.log(
          "[MapLibre FFI] The binding was already cleaned up:",
          error,
        );
      }
      if (target !== undefined) nativeFfi.surfaces.release(target);
    });
  }

  /**
   * The controller to mark ready once the style has loaded. Strict Mode and Fast
   * Refresh give the view a new controller for the same mount.
   */
  setController(controller: MapController): void {
    this.#controller = controller;
    if (this.#styleLoaded) controller.setReady();
  }

  /** Loads `mapStyle`, a URL or a style document. */
  setStyle(mapStyle: string): void {
    try {
      this.#style = readStyle(mapStyle);
    } catch (error) {
      this.#fail(error);
      return;
    }
    this.#applyStyle();
  }

  setSize(size: LogicalSize): void {
    this.#size = size;
    if (this.#session !== undefined) {
      this.#session.discarding.resize(size);
    } else {
      this.#retarget();
    }
  }

  surfaceAvailable(surface: number): void {
    this.#surface = surface;
    this.#retarget();
  }

  // The platform has taken the surface away, as when the app goes to the
  // background. Release it from the session, and keep the session and its
  // tiles for the next surface.
  surfaceLost(surface: number): void {
    if (this.#surface === surface) this.#surface = undefined;
    this.#enqueue(async () => {
      if (this.#target === surface) {
        this.#target = undefined;
        await this.#session?.releaseTarget();
      }
      nativeFfi.surfaces.release(surface);
    });
  }

  async #start(epoch: number): Promise<void> {
    const { RuntimeEventFlag, RuntimeEventType } = nativeFfi;
    const runtime = await nativeFfi.RuntimeHandle.create();
    if (epoch !== this.#epoch) return runtime.dispose();
    this.#runtime = runtime;

    const map = runtime.createMap({
      initialExtent: {
        width: 1,
        height: 1,
        ...this.#size,
        scaleFactor: PixelRatio.get(),
      },
      mapMode: nativeFfi.MapMode.continuous,
      eventMask:
        RuntimeEventFlag.mapStyleLoaded |
        RuntimeEventFlag.mapSourceChanged |
        RuntimeEventFlag.mapLoadingFailed |
        RuntimeEventFlag.mapRenderError,
    });
    this.#map = map;
    runtime.discarding.setEventHandler({
      callback: (events) => {
        if (epoch !== this.#epoch) return;
        for (const event of events) {
          if (event.source !== map.id) continue;
          switch (event.type) {
            case RuntimeEventType.mapStyleLoaded:
              this.#styleLoaded = true;
              this.#controller?.setReady();
              this.#refreshAttributions(map, epoch);
              break;
            case RuntimeEventType.mapSourceChanged:
              this.#refreshAttributions(map, epoch);
              break;
            case RuntimeEventType.mapLoadingFailed:
            case RuntimeEventType.mapRenderError:
              this.#fail(new Error(event.message));
              break;
          }
        }
      },
    });
    await map.ready;
    if (epoch !== this.#epoch) return;
    this.#mapReady = true;
    this.#applyStyle();
    this.#retarget();
  }

  #applyStyle(): void {
    const map = this.#map;
    const style = this.#style;
    if (!this.#mapReady || map === undefined || style === undefined) return;
    if ("url" in style) {
      map.discarding.setStyleUrl(style.url);
    } else {
      map.discarding.setStyleJson(style.json);
    }
    this.#demandFrame();
  }

  // Reads the attributions of the style's sources. Only the latest read
  // reports, and only when the attributions changed.
  #refreshAttributions(map: MapHandle, epoch: number): void {
    const request = ++this.#attributionsRequest;
    map.listStyleSources().then(
      (sources) => {
        if (epoch !== this.#epoch || request !== this.#attributionsRequest) {
          return;
        }
        const attributions = collectAttributions(sources);
        const key = attributions.join("\n");
        if (key === this.#attributionsKey) return;
        this.#attributionsKey = key;
        this.#onAttributions(attributions);
      },
      (error: unknown) => {
        if (epoch === this.#epoch) this.#fail(error);
      },
    );
  }

  // Gives the session the view's latest surface, attaching the session first
  // if there is none.
  #retarget(): void {
    this.#enqueue(async () => {
      const epoch = this.#epoch;
      // The view can report its surface before the map is ready to take a
      // session.
      await this.#map?.ready;
      const map = this.#map;
      const size = this.#size;
      const surface = this.#surface;
      if (
        epoch !== this.#epoch ||
        map === undefined ||
        size === undefined ||
        surface === undefined ||
        surface === this.#target
      ) {
        return;
      }
      const handles = nativeFfi.surfaces.acquire(surface);
      // The view withdrew the surface before the session got to it.
      if (handles === undefined) return;
      const previous = this.#target;
      this.#target = surface;
      if (this.#session === undefined) {
        const session = attach(map, size, handles, {
          driver: nativeFfi.RenderDriverKind.coreWorker,
          frameWake: { callback: () => this.#drainFrameResults() },
        });
        this.#session = session;
        await session.ready;
      } else {
        await setTarget(this.#session, size, handles);
      }
      if (previous !== undefined) nativeFfi.surfaces.release(previous);
      this.#demandFrame();
    });
  }

  #enqueue(change: () => Promise<void>): void {
    this.#targets = this.#targets
      .then(() => (this.#active ? change() : undefined))
      .catch((error: unknown) => this.#fail(error));
  }

  #demandFrame = (): void => {
    if (this.#target === undefined) return;
    this.#session?.demandFrame({
      flags: nativeFfi.FrameDemandFlag.waitForUpdate,
    });
  };

  #drainFrameResults(): void {
    const results = this.#session?.drainFrameResults() ?? [];
    if (results.length === 0) return;
    if (
      results.some(
        ({ disposition }) => disposition === nativeFfi.RenderResult.failed,
      )
    ) {
      this.#fail(new Error("The map failed to render a frame."));
    } else {
      requestAnimationFrame(this.#demandFrame);
    }
  }

  // Reports the first failure of a start; later ones follow from it.
  #fail(error: unknown): void {
    if (!this.#active || this.#failed) return;
    this.#failed = true;
    console.error("[MapLibre FFI]", error);
  }
}

// Both sessions render on a library thread. On Android, the library also makes
// the graphics context for the window.
function attach(
  map: MapHandle,
  logicalSize: LogicalSize,
  handles: SurfaceHandles,
  options: RenderSessionAttachOptions,
): RenderSessionHandle {
  switch (handles.kind) {
    case "metal":
      return map.attachMetalSurface(
        { logicalSize, layer: handles.layer },
        options,
      );
    case "android":
      return map.attachAndroidSurface(
        { logicalSize, window: handles.window },
        undefined,
        options,
      );
  }
}

function setTarget(
  session: RenderSessionHandle,
  logicalSize: LogicalSize,
  handles: SurfaceHandles,
): Promise<void> {
  switch (handles.kind) {
    case "metal":
      return session.setMetalSurfaceTarget({
        logicalSize,
        layer: handles.layer,
      });
    case "android":
      return session.setAndroidSurfaceTarget({
        logicalSize,
        window: handles.window,
      });
  }
}
