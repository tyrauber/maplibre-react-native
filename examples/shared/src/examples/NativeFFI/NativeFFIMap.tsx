import {
  type MetalLayerLease,
  NativeFFIManager,
  NativeFFISurface,
  type NativeFFISurfaceLayerEvent,
} from "@maplibre/maplibre-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { MAPLIBRE_DEMO_STYLE } from "@/constants/MAPLIBRE_DEMO_STYLE";

// The calls this example makes. The package is not a dependency here: Metro
// resolves it to a local checkout (see metro.shared.js).
interface Size {
  width: number;
  height: number;
}

// The C API takes whole logical pixels, and a view's size in points is often
// fractional, such as under a navigation header.
function logicalSize({ width, height }: Size): Size {
  return { width: Math.round(width), height: Math.round(height) };
}

interface RenderSession {
  close(): Promise<void>;
  demandFrame(demand: { flags: number }): void;
  drainFrameResults(): readonly { disposition: number }[];
  discarding: { resize(size: Size): void };
}

interface MapHandle {
  close(): Promise<void>;
  setStyleUrl(url: string): Promise<unknown>;
  attachMetalSurface(
    descriptor: { layer: bigint; logicalSize: Size },
    options: { driver: number; frameWake: () => void },
  ): { session: RenderSession; ready: Promise<void> };
}

interface RuntimeHandle {
  close(): Promise<void>;
  createMap(options: {
    initialExtent: Size & { scaleFactor: number };
    mapMode: number;
  }): { map: MapHandle; ready: Promise<void> };
}

interface NativeFFI {
  RuntimeHandle: { create(): Promise<RuntimeHandle> };
  FrameDemandFlag: { waitForUpdate: number };
  MapMode: { continuous: number };
  RenderDriverKind: { coreWorker: number };
  RenderResult: { rendered: number; failed: number };
}

type Log = (line: string) => void;

// One map, drawn to one surface's layer, from creation to close.
class SurfaceMap {
  private stopped = false;
  private runtime: RuntimeHandle | undefined;
  private map: MapHandle | undefined;
  private session: RenderSession | undefined;
  private size: Size;
  private frames = 0;
  private readonly running: Promise<void>;

  constructor(
    private readonly ffi: NativeFFI,
    private readonly lease: MetalLayerLease<RenderSession>,
    event: NativeFFISurfaceLayerEvent,
    private readonly log: Log,
  ) {
    this.size = logicalSize(event);
    this.running = this.run(event.scale);
    this.running.catch((error: unknown) => {
      if (!this.stopped) {
        log(`map failed: ${String(error)}`);
      }
    });
  }

  private async run(scaleFactor: number): Promise<void> {
    const { ffi } = this;
    this.runtime = await ffi.RuntimeHandle.create();
    if (this.stopped) {
      return;
    }

    const created = this.runtime.createMap({
      initialExtent: { ...this.size, scaleFactor },
      mapMode: ffi.MapMode.continuous,
    });
    this.map = created.map;
    await created.ready;
    if (this.stopped) {
      return;
    }

    const map = created.map;
    let attached!: Promise<void>;
    this.session = this.lease.attach((layer) => {
      const attachment = map.attachMetalSurface(
        { layer, logicalSize: this.size },
        {
          driver: ffi.RenderDriverKind.coreWorker,
          // The binding calls it on the JavaScript thread.
          frameWake: () => this.drainFrameResults(),
        },
      );
      attached = attachment.ready;
      return attachment.session;
    });
    // A demand may start as soon as the attach returns.
    this.demandFrame();
    await attached;
    if (this.stopped) {
      return;
    }
    this.log(`attached ${this.size.width}x${this.size.height}@${scaleFactor}`);

    await map.setStyleUrl(MAPLIBRE_DEMO_STYLE);
    this.log(`style ${MAPLIBRE_DEMO_STYLE}`);
  }

  private demandFrame(): void {
    if (this.stopped || !this.session) {
      return;
    }
    try {
      this.session.demandFrame({
        flags: this.ffi.FrameDemandFlag.waitForUpdate,
      });
    } catch (error) {
      this.log(`frame demand failed: ${String(error)}`);
    }
  }

  private drainFrameResults(): void {
    if (this.stopped || !this.session) {
      return;
    }
    const results = this.session.drainFrameResults();
    if (results.length === 0) {
      return;
    }
    const { RenderResult } = this.ffi;
    if (
      results.some(({ disposition }) => disposition === RenderResult.failed)
    ) {
      // A real host closes the session and attaches a new one.
      this.log("frame failed: the session stopped rendering");
      return;
    }
    const rendered = results.filter(
      ({ disposition }) => disposition === RenderResult.rendered,
    ).length;
    if (rendered > 0) {
      if (this.frames === 0) {
        this.log("first frame rendered");
      }
      this.frames += rendered;
    }
    requestAnimationFrame(() => this.demandFrame());
  }

  resize(size: Size): void {
    this.size = logicalSize(size);
    if (!this.stopped) {
      this.session?.discarding.resize(this.size);
    }
  }

  // Stops the frame loop, closes the session, and releases the layer once the
  // close settles. Only then closes the map and the runtime.
  async stop(): Promise<void> {
    this.stopped = true;
    const ending = this.lease.end();
    await this.running.catch(() => {});
    try {
      await ending;
    } catch (error) {
      console.warn(`[NativeFFI] session close failed: ${String(error)}`);
    }
    console.log(
      `[NativeFFI] lease ${this.lease.token} on layer ${this.lease.layer} released after ${this.frames} frames`,
    );
    await this.map
      ?.close()
      .catch((error: unknown) =>
        console.warn(`[NativeFFI] map close failed: ${String(error)}`),
      );
    await this.runtime
      ?.close()
      .catch((error: unknown) =>
        console.warn(`[NativeFFI] runtime close failed: ${String(error)}`),
      );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  overlay: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  line: { fontFamily: "Menlo", fontSize: 12 },
});

function firstLine(installed: boolean): string {
  return installed
    ? `implementation ${NativeFFIManager.implementation()}`
    : "not installed: link the MapLibreReactNativeFFI pod (MLRN_FFI=1)";
}

export function NativeFFIMap() {
  const [installed] = useState(() => NativeFFIManager.install());
  const [lines, setLines] = useState(() => [firstLine(installed)]);
  const surfaceMap = useRef<SurfaceMap | undefined>(undefined);

  const log = useCallback((line: string) => {
    console.log(`[NativeFFI] ${line}`);
    setLines((previous) => [...previous, line]);
  }, []);

  useEffect(() => {
    console.log(`[NativeFFI] ${firstLine(installed)}`);

    return () => {
      const stopping = surfaceMap.current?.stop();
      surfaceMap.current = undefined;
      stopping?.catch((error: unknown) =>
        console.warn(`[NativeFFI] stop failed: ${String(error)}`),
      );
    };
  }, [installed]);

  const onLayer = useCallback(
    (event: NativeFFISurfaceLayerEvent) => {
      if (surfaceMap.current) {
        surfaceMap.current.resize(event);
        return;
      }
      const lease = NativeFFIManager.leaseLayer<RenderSession>(event);
      if (!lease) {
        log(`surface ${event.surface} is gone: nothing to draw`);
        return;
      }
      log(`lease ${lease.token} on surface ${event.surface}`);
      // Loads only after install(): the module reads the bindings when it loads.
      const ffi: NativeFFI = require("@maplibre/native-ffi/hermes");
      surfaceMap.current = new SurfaceMap(ffi, lease, event, log);
    },
    [log],
  );

  return (
    <View style={styles.container}>
      {installed && (
        <NativeFFISurface style={StyleSheet.absoluteFill} onLayer={onLayer} />
      )}
      <View style={styles.overlay} pointerEvents="none">
        {lines.map((line, index) => (
          <Text key={index} style={styles.line}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}
