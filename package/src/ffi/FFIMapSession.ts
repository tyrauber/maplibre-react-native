// The runtime, map, session and surface lifecycle is adapted from
// maplibre/maplibre-native-ffi examples/react-native/src/MapController.ts at
// 616f9175. BSD-2-Clause: see LICENSE-maplibre-native-ffi in this folder.

import { PixelRatio } from "react-native";

import { collectAttributions } from "./attribution";
import {
  type CameraDelta,
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

/** The error every binding call throws once the host has cleaned it up. */
const REALM_CLOSED = "the addon realm is closed";

function isRealmClosed(error: unknown): boolean {
  return error instanceof Error && error.message === REALM_CLOSED;
}

/**
 * Makes a synchronous binding call from an event or frame callback. After a
 * reload the host has cleaned the binding up, so there is nothing left to do;
 * any other error still throws.
 */
function unlessRealmClosed(call: () => void): void {
  try {
    call();
  } catch (error) {
    if (!isRealmClosed(error)) throw error;
  }
}

/** Disposes one native object, and reports a failure other than cleanup. */
function disposeQuietly(dispose: () => void): void {
  try {
    dispose();
  } catch (error) {
    if (!isRealmClosed(error)) console.error("[MapLibre FFI]", error);
  }
}

/**
 * What one `start()` made. A later `dispose()` tears down exactly these
 * objects, even when the same session starts again before the teardown runs.
 */
interface Run {
  runtime?: RuntimeHandle;
  map?: MapHandle;
  mapReady: boolean;
  styleLoaded: boolean;
  session?: RenderSessionHandle;
  /** The surface the session renders to, once it has switched to it. */
  target?: number;
  /** The surfaces this run acquired and still holds. */
  readonly held: Map<number, SurfaceHandles>;
  attributions: "idle" | "busy" | "again";
}

/**
 * One map drawn through the MapLibre Native C API on the package's surface
 * view. The view lends its surface when the platform provides one; the session
 * attaches a render session to it, or gives an attached session the new
 * surface.
 *
 * `start()` and `dispose()` follow the view's effect. Strict Mode and Fast
 * Refresh dispose and start the same object again. Each start is a run: work
 * queued by a run runs only while that run is current, and its teardown
 * releases what that run holds.
 */
export class FFIMapSession {
  readonly #onAttributions: (attributions: string[]) => void;
  #run: Run | undefined;
  #failed = false;

  #controller: MapController | undefined;
  #style: Style | undefined;
  #attributionsKey = "";

  // The view's latest size and surface.
  #size: LogicalSize | undefined;
  #surface: number | undefined;
  // Surface changes and teardowns run one at a time, in the order they came.
  #queue: Promise<void> = Promise.resolve();

  constructor(onAttributions: (attributions: string[]) => void) {
    this.#onAttributions = onAttributions;
  }

  start(): void {
    if (this.#run) return;
    const run: Run = {
      mapReady: false,
      styleLoaded: false,
      held: new Map(),
      attributions: "idle",
    };
    this.#run = run;
    this.#failed = false;
    this.#start(run).catch((error: unknown) => this.#fail(run, error));
  }

  /** Releases everything this session holds. A second call does nothing. */
  dispose(): void {
    const run = this.#run;
    if (!run) return;
    this.#run = undefined;
    // After the change in flight, release the session while its wakes still
    // service it, and only then let go of the surfaces it used.
    this.#queue = this.#queue
      .then(() => this.#teardown(run))
      .catch((error: unknown) => console.error("[MapLibre FFI]", error));
  }

  /**
   * The controller to mark ready once the style has loaded. Strict Mode and Fast
   * Refresh give the view a new controller for the same mount.
   */
  setController(controller: MapController): void {
    this.#controller = controller;
    if (this.#run?.styleLoaded) controller.setReady();
  }

  /** Loads `mapStyle`, a URL or a style document. */
  setStyle(mapStyle: string): void {
    const run = this.#run;
    try {
      this.#style = readStyle(mapStyle);
    } catch (error) {
      if (run) this.#fail(run, error);
      return;
    }
    if (run) this.#applyStyle(run);
  }

  /**
   * Calls `action` with the current map. Throws while no map is ready.
   *
   * A command sent through the map's controller waits until the style has loaded,
   * so it does not see this, with one exception. When Fast Refresh updates only
   * the `FFIMapView` component, the session disposes and starts again, but the
   * `<Map>` keeps its controller, which stays ready. A command sent before the
   * new run's map is ready rejects with this error.
   */
  withMap<T>(action: (map: MapHandle) => T): T {
    const run = this.#run;
    if (!run?.mapReady || run.map === undefined) {
      throw new Error("[MapLibre FFI] The map is not ready.");
    }
    return action(run.map);
  }

  /**
   * Moves the camera by a gesture's delta, at once. Does nothing unless the map
   * is ready (its style has loaded) and renders to a surface, so a gesture before
   * then, after the surface is lost, or after a dispose has no effect.
   */
  applyCameraDelta(delta: CameraDelta): void {
    const run = this.#run;
    const map = run?.map;
    if (!run?.styleLoaded || map === undefined || run.target === undefined) {
      return;
    }
    unlessRealmClosed(() => map.discarding.applyCameraDelta(delta));
  }

  setSize(size: LogicalSize): void {
    this.#size = size;
    const run = this.#run;
    if (!run) return;
    const session = run.session;
    if (session !== undefined) {
      unlessRealmClosed(() => session.discarding.resize(size));
    } else {
      this.#retarget(run);
    }
  }

  surfaceAvailable(surface: number): void {
    this.#surface = surface;
    if (this.#run) this.#retarget(this.#run);
  }

  // The platform has taken the surface away, as when the app goes to the
  // background. Release it from the session, and keep the session and its
  // tiles for the next surface.
  surfaceLost(surface: number): void {
    if (this.#surface === surface) this.#surface = undefined;
    const run = this.#run;
    if (!run) return;
    this.#enqueue(run, async () => {
      // A surface the session does not render to, such as one a failed switch
      // left, stays held until the teardown.
      if (run.target !== surface || run.session === undefined) return;
      await run.session.releaseTarget();
      run.target = undefined;
      run.held.delete(surface);
      nativeFfi.surfaces.release(surface);
    });
  }

  async #start(run: Run): Promise<void> {
    const { RuntimeEventFlag, RuntimeEventType } = nativeFfi;
    const runtime = await nativeFfi.RuntimeHandle.create();
    if (this.#run !== run) {
      disposeQuietly(() => runtime.dispose());
      return;
    }
    run.runtime = runtime;

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
    run.map = map;
    runtime.discarding.setEventHandler({
      callback: (events) => {
        if (this.#run !== run) return;
        for (const event of events) {
          if (event.source !== map.id) continue;
          switch (event.type) {
            case RuntimeEventType.mapStyleLoaded:
              run.styleLoaded = true;
              this.#controller?.setReady();
              this.#refreshAttributions(run);
              break;
            case RuntimeEventType.mapSourceChanged:
              this.#refreshAttributions(run);
              break;
            case RuntimeEventType.mapLoadingFailed:
            case RuntimeEventType.mapRenderError:
              this.#fail(run, new Error(event.message));
              break;
          }
        }
      },
    });
    await map.ready;
    if (this.#run !== run) return;
    run.mapReady = true;
    this.#applyStyle(run);
    this.#retarget(run);
  }

  // Releases the session, then disposes the map and the runtime, then lets go
  // of the surfaces. A surface stays held when the session may still render to
  // it: a leak is better than drawing into a freed layer.
  async #teardown(run: Run): Promise<void> {
    let sessionEnded = true;
    if (run.session !== undefined) {
      try {
        await run.session.release();
      } catch (error) {
        if (isRealmClosed(error)) {
          // On a reload, React Native has the host clean the binding up before
          // React unmounts the app. That cleanup ended the session and let go
          // of its surfaces.
          console.log("[MapLibre FFI] The binding was already cleaned up.");
        } else {
          sessionEnded = false;
          console.error(
            "[MapLibre FFI] The render session did not release, so its surfaces stay held:",
            error,
          );
        }
      }
    }
    const { map, runtime } = run;
    if (map) disposeQuietly(() => map.dispose());
    if (runtime) disposeQuietly(() => runtime.dispose());
    if (!sessionEnded) return;
    for (const surface of run.held.keys()) nativeFfi.surfaces.release(surface);
    run.held.clear();
  }

  #applyStyle(run: Run): void {
    const map = run.map;
    const style = this.#style;
    if (!run.mapReady || map === undefined || style === undefined) return;
    unlessRealmClosed(() => {
      if ("url" in style) {
        map.discarding.setStyleUrl(style.url);
      } else {
        map.discarding.setStyleJson(style.json);
      }
    });
    this.#demandFrame(run);
  }

  // Reads the attributions of the style's sources: at most one read at a time,
  // and one more after it when a source changed meanwhile. Reports only a
  // change.
  #refreshAttributions(run: Run): void {
    const map = run.map;
    if (map === undefined) return;
    if (run.attributions !== "idle") {
      run.attributions = "again";
      return;
    }
    run.attributions = "busy";
    map
      .listStyleSources()
      .then(
        (sources) => {
          if (this.#run !== run) return;
          const attributions = collectAttributions(sources);
          const key = attributions.join("\n");
          if (key === this.#attributionsKey) return;
          this.#attributionsKey = key;
          this.#onAttributions(attributions);
        },
        (error: unknown) => this.#fail(run, error),
      )
      .finally(() => {
        const again = run.attributions === "again";
        run.attributions = "idle";
        if (again && this.#run === run) this.#refreshAttributions(run);
      });
  }

  // Gives the session the view's latest surface, attaching the session first
  // if there is none. Before the map is ready this does nothing: the start
  // retargets once it is.
  #retarget(run: Run): void {
    this.#enqueue(run, async () => {
      const map = run.map;
      const size = this.#size;
      const surface = this.#surface;
      if (
        !run.mapReady ||
        map === undefined ||
        size === undefined ||
        surface === undefined ||
        surface === run.target
      ) {
        return;
      }
      let handles = run.held.get(surface);
      if (handles === undefined) {
        handles = nativeFfi.surfaces.acquire(surface);
        // The view withdrew the surface before the session got to it.
        if (handles === undefined) return;
        run.held.set(surface, handles);
      }
      const previous = run.target;
      if (run.session === undefined) {
        const session: RenderSessionHandle = attach(map, size, handles, {
          driver: nativeFfi.RenderDriverKind.coreWorker,
          frameWake: {
            callback: () => this.#drainFrameResults(run, session),
          },
        });
        run.session = session;
        await session.ready;
      } else {
        await setTarget(run.session, size, handles);
      }
      // The session renders to the new surface only once the switch settles.
      // If it fails, both surfaces stay held until the teardown.
      run.target = surface;
      if (previous !== undefined) {
        run.held.delete(previous);
        nativeFfi.surfaces.release(previous);
      }
      this.#demandFrame(run);
    });
  }

  // Runs a change after the ones before it, only while its run is current.
  // A teardown is queued directly, so this check never skips one.
  #enqueue(run: Run, change: () => Promise<void>): void {
    this.#queue = this.#queue
      .then(() => (this.#run === run ? change() : undefined))
      .catch((error: unknown) => this.#fail(run, error));
  }

  #demandFrame(run: Run): void {
    if (this.#run !== run || run.target === undefined) return;
    const session = run.session;
    if (session === undefined) return;
    unlessRealmClosed(() =>
      session.demandFrame({ flags: nativeFfi.FrameDemandFlag.waitForUpdate }),
    );
  }

  #drainFrameResults(run: Run, session: RenderSessionHandle): void {
    if (this.#run !== run) return;
    const results = session.drainFrameResults();
    if (results.length === 0) return;
    if (
      results.some(
        ({ disposition }) => disposition === nativeFfi.RenderResult.failed,
      )
    ) {
      this.#fail(run, new Error("The map failed to render a frame."));
    } else {
      requestAnimationFrame(() => this.#demandFrame(run));
    }
  }

  // Reports the first failure of a run; later ones follow from it.
  #fail(run: Run, error: unknown): void {
    if (this.#run !== run || this.#failed) return;
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
