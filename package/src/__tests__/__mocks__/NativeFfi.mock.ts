import { createElement } from "react";
import { View, type ViewProps } from "react-native";

/**
 * A fake of the `@maplibre/native-ffi-react-native` package. The package is not
 * installed, so Jest serves this as a virtual module. Every call that matters
 * to the lifecycle appends to `calls` in order.
 */

const RuntimeEventType = {
  mapStyleLoaded: 4,
  mapLoadingFailed: 7,
  mapRenderError: 9,
  mapSourceChanged: 16,
} as const;

class FakeSession {
  readonly ready = Promise.resolve();
  readonly discarding = {
    resize: jest.fn((size: { width: number; height: number }) => {
      mockNativeFfi.calls.push(`session.resize:${size.width}x${size.height}`);
    }),
  };
  demandFrame = jest.fn();
  drainFrameResults = jest.fn(() => []);
  release = jest.fn(async () => {
    mockNativeFfi.calls.push("session.release");
    if (mockNativeFfi.cleanedUp) {
      throw new Error("RenderSessionHandle is closed");
    }
  });
  releaseTarget = jest.fn(async () => {
    mockNativeFfi.calls.push("session.releaseTarget");
  });
  setMetalSurfaceTarget = jest.fn(async ({ layer }: { layer: bigint }) => {
    mockNativeFfi.calls.push(`session.setTarget:${layer}`);
  });
  setAndroidSurfaceTarget = jest.fn();
}

class FakeMap {
  readonly id: bigint;
  readonly ready = Promise.resolve();
  readonly discarding = {
    setStyleUrl: jest.fn((url: string) => {
      mockNativeFfi.calls.push(`map.setStyleUrl:${url}`);
    }),
    setStyleJson: jest.fn((json: unknown) => {
      mockNativeFfi.calls.push(`map.setStyleJson:${typeof json}`);
    }),
  };
  listStyleSources = jest.fn(async () => mockNativeFfi.sources);
  attachMetalSurface = jest.fn(({ layer }: { layer: bigint }) => {
    mockNativeFfi.calls.push(`map.attach:${layer}`);
    const session = new FakeSession();
    mockNativeFfi.sessions.push(session);
    return session;
  });
  attachAndroidSurface = jest.fn();
  dispose = jest.fn(() => {
    mockNativeFfi.calls.push("map.dispose");
  });

  constructor(id: bigint) {
    this.id = id;
  }
}

class FakeRuntime {
  handler: { callback: (events: readonly unknown[]) => void } | undefined;
  readonly discarding = {
    setEventHandler: jest.fn((handler: FakeRuntime["handler"]) => {
      this.handler = handler;
    }),
  };
  createMap = jest.fn(() => {
    const map = new FakeMap(BigInt(mockNativeFfi.maps.length + 1));
    mockNativeFfi.maps.push(map);
    return map;
  });
  dispose = jest.fn(() => {
    mockNativeFfi.calls.push("runtime.dispose");
  });
}

/** The layer that the fake surface registry hands out for a surface. */
export function layerOf(surface: number): bigint {
  return BigInt(1000 + surface);
}

export const mockNativeFfi = {
  calls: [] as string[],
  runtimes: [] as FakeRuntime[],
  maps: [] as FakeMap[],
  sessions: [] as FakeSession[],
  sources: [] as { id: string; attribution: string }[],
  /** As after the host cleaned the binding up on a reload. */
  cleanedUp: false,

  reset() {
    this.calls = [];
    this.runtimes = [];
    this.maps = [];
    this.sessions = [];
    this.sources = [];
    this.cleanedUp = false;
  },

  /** Sends an event of the latest map through the latest runtime. */
  emit(type: keyof typeof RuntimeEventType, message = "") {
    const runtime = this.runtimes[this.runtimes.length - 1];
    const map = this.maps[this.maps.length - 1];
    runtime?.handler?.callback([
      { type: RuntimeEventType[type], source: map?.id, message },
    ]);
  },

  module: {
    RuntimeHandle: {
      create: jest.fn(async () => {
        const runtime = new FakeRuntime();
        mockNativeFfi.runtimes.push(runtime);
        return runtime;
      }),
    },
    MaplibreSurfaceView: (props: ViewProps) => createElement(View, props),
    surfaces: {
      acquire: jest.fn((surface: number) => {
        mockNativeFfi.calls.push(`surfaces.acquire:${surface}`);
        return { kind: "metal", layer: layerOf(surface) };
      }),
      release: jest.fn((surface: number) => {
        mockNativeFfi.calls.push(`surfaces.release:${surface}`);
      }),
    },
    MapMode: { continuous: 0 },
    RenderDriverKind: { coreWorker: 1 },
    FrameDemandFlag: { waitForUpdate: 2 },
    RenderResult: { failed: 4 },
    RuntimeEventFlag: {
      mapStyleLoaded: 16n,
      mapLoadingFailed: 128n,
      mapRenderError: 512n,
      mapSourceChanged: 65536n,
    },
    RuntimeEventType,
  },
};

jest.mock("@maplibre/native-ffi-react-native", () => mockNativeFfi.module, {
  virtual: true,
});
