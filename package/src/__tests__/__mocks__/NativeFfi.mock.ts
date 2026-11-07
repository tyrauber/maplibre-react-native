import { createElement } from "react";
import { View, type ViewProps } from "react-native";

/**
 * A fake of the `@maplibre/native-ffi-react-native` package. The package is not
 * installed, so Jest serves this as a virtual module. Every call that matters
 * to the lifecycle appends to `calls` in order.
 *
 * Asynchronous native work settles at once, unless a test holds it by name with
 * `hold()` : then it stays pending until the test calls `settle()` or `fail()`
 *  .
 *
 * The fake checks the rules that keep a surface alive while a session renders
 * to it, and records each break in `violations` :
 *
 * - A surface is released while a live session still uses its layer.
 * - A surface is acquired while it is already acquired. Upstream keeps one flag
 *   per surface, so a second acquire is undone by the first release.
 * - A session uses a layer whose surface is not acquired.
 * - Two live sessions use one layer.
 */

const RuntimeEventType = {
  mapStyleLoaded: 4,
  mapLoadingFailed: 7,
  mapRenderError: 9,
  mapSourceChanged: 16,
} as const;

/** The message of the error that every call throws once the host cleaned up. */
export const REALM_CLOSED = "the addon realm is closed";

type Pending = {
  name: string;
  settle: () => void;
  fail: (error: unknown) => void;
};

/**
 * Work that settles now, or when the test settles it. `ok` and `err` update the
 * fake's state at the moment the work settles.
 */
function work<T>(
  name: string,
  value: () => T,
  effects: { ok?: () => void; err?: () => void } = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const pending: Pending = {
      name,
      settle: () => {
        effects.ok?.();
        mockNativeFfi.calls.push(`${name}:settled`);
        resolve(value());
      },
      fail: (error) => {
        effects.err?.();
        mockNativeFfi.calls.push(`${name}:failed`);
        reject(error);
      },
    };
    if (mockNativeFfi.closed) {
      reject(new Error(REALM_CLOSED));
    } else if (mockNativeFfi.holding.has(name)) {
      mockNativeFfi.pending.push(pending);
    } else {
      pending.settle();
    }
  });
}

function throwIfClosed() {
  if (mockNativeFfi.closed) throw new Error(REALM_CLOSED);
}

function surfaceOf(layer: bigint): number {
  return Number(layer) - 1000;
}

function checkUse(session: FakeSession, layer: bigint) {
  const surface = surfaceOf(layer);
  if (!mockNativeFfi.acquired.has(surface)) {
    mockNativeFfi.violations.push(`uses unacquired surface ${surface}`);
  }
  for (const other of mockNativeFfi.sessions) {
    if (other !== session && other.inUse.has(layer)) {
      mockNativeFfi.violations.push(`two sessions use surface ${surface}`);
    }
  }
}

class FakeSession {
  /** The layers the session may render to now. */
  inUse = new Set<bigint>();
  readonly ready: Promise<void>;
  readonly discarding = {
    resize: jest.fn((size: { width: number; height: number }) => {
      mockNativeFfi.calls.push(`session.resize:${size.width}x${size.height}`);
      throwIfClosed();
    }),
  };
  demandFrame = jest.fn(() => throwIfClosed());
  drainFrameResults = jest.fn((): { disposition: number }[] => []);

  constructor(layer: bigint) {
    checkUse(this, layer);
    this.inUse.add(layer);
    this.ready = work("session.ready", () => undefined);
  }

  release = jest.fn(() => {
    mockNativeFfi.calls.push("session.release");
    return work("session.release", () => undefined, {
      ok: () => this.inUse.clear(),
    });
  });

  releaseTarget = jest.fn(() => {
    mockNativeFfi.calls.push("session.releaseTarget");
    return work("session.releaseTarget", () => undefined, {
      ok: () => this.inUse.clear(),
    });
  });

  setMetalSurfaceTarget = jest.fn(({ layer }: { layer: bigint }) => {
    mockNativeFfi.calls.push(`session.setTarget:${layer}`);
    checkUse(this, layer);
    // The session may use either layer until the switch settles.
    this.inUse.add(layer);
    return work("session.setTarget", () => undefined, {
      ok: () => {
        this.inUse = new Set([layer]);
      },
    });
  });

  setAndroidSurfaceTarget = jest.fn();
}

class FakeMap {
  readonly id: bigint;
  readonly ready = work("map.ready", () => undefined);
  readonly discarding = {
    setStyleUrl: jest.fn((url: string) => {
      mockNativeFfi.calls.push(`map.setStyleUrl:${url}`);
      throwIfClosed();
    }),
    setStyleJson: jest.fn((json: unknown) => {
      mockNativeFfi.calls.push(`map.setStyleJson:${typeof json}`);
      throwIfClosed();
    }),
    applyCameraDelta: jest.fn((delta: unknown) => {
      mockNativeFfi.cameraCommands.push(["applyCameraDelta", delta]);
      throwIfClosed();
    }),
  };
  updateCamera = jest.fn((update: unknown) => {
    mockNativeFfi.cameraCommands.push(["updateCamera", update]);
    return work("map.updateCamera", () => ({}));
  });
  fitCameraToLatLngBounds = jest.fn((bounds: unknown, update: unknown) => {
    mockNativeFfi.cameraCommands.push([
      "fitCameraToLatLngBounds",
      bounds,
      update,
    ]);
    return work("map.fitCameraToLatLngBounds", () => ({}));
  });
  setBounds = jest.fn((options: unknown) => {
    mockNativeFfi.cameraCommands.push(["setBounds", options]);
    return work("map.setBounds", () => ({}));
  });
  listStyleSources = jest.fn(() => {
    mockNativeFfi.calls.push("map.listStyleSources");
    return work("map.listStyleSources", () => mockNativeFfi.sources);
  });
  attachMetalSurface = jest.fn(({ layer }: { layer: bigint }) => {
    mockNativeFfi.calls.push(`map.attach:${layer}`);
    const error = mockNativeFfi.attachError;
    if (error) {
      mockNativeFfi.attachError = undefined;
      throw error;
    }
    const session = new FakeSession(layer);
    mockNativeFfi.sessions.push(session);
    return session;
  });
  attachAndroidSurface = jest.fn();
  dispose = jest.fn(() => {
    mockNativeFfi.calls.push("map.dispose");
    if (mockNativeFfi.closed) throw new Error(REALM_CLOSED);
    if (mockNativeFfi.mapDisposeError) throw mockNativeFfi.mapDisposeError;
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
    if (mockNativeFfi.closed) throw new Error(REALM_CLOSED);
  });
}

function take(name: string): Pending {
  const index = mockNativeFfi.pending.findIndex(
    (pending) => pending.name === name,
  );
  if (index < 0) throw new Error(`no pending ${name}`);
  return mockNativeFfi.pending.splice(index, 1)[0]!;
}

/** The layer that the fake surface registry hands out for a surface. */
export function layerOf(surface: number): bigint {
  return BigInt(1000 + surface);
}

export const mockNativeFfi = {
  calls: [] as string[],
  /** Camera commands, with their arguments, in the order they were sent. */
  cameraCommands: [] as unknown[][],
  violations: [] as string[],
  runtimes: [] as FakeRuntime[],
  maps: [] as FakeMap[],
  sessions: [] as FakeSession[],
  sources: [] as { id: string; attribution: string }[],
  /** Surfaces that JavaScript holds, as upstream's flag per surface. */
  acquired: new Set<number>(),
  /** Surfaces that the view withdrew before JavaScript acquired them. */
  withdrawn: new Set<number>(),
  holding: new Set<string>(),
  pending: [] as Pending[],
  /** Set by `cleanUp()`, as after the host cleaned the binding up. */
  closed: false,
  mapDisposeError: undefined as Error | undefined,
  /** Thrown by the next attach, once. */
  attachError: undefined as Error | undefined,

  reset() {
    this.calls = [];
    this.cameraCommands = [];
    this.violations = [];
    this.runtimes = [];
    this.maps = [];
    this.sessions = [];
    this.sources = [];
    this.acquired = new Set();
    this.withdrawn = new Set();
    this.holding = new Set();
    this.pending = [];
    this.closed = false;
    this.mapDisposeError = undefined;
    this.attachError = undefined;
  },

  /** Keeps work of this name pending until the test settles it. */
  hold(...names: string[]) {
    names.forEach((name) => this.holding.add(name));
  },

  isPending(name: string) {
    return this.pending.some((pending) => pending.name === name);
  },

  /** Settles the oldest pending work of this name. */
  settle(name: string) {
    take(name).settle();
  },

  fail(name: string, error: unknown) {
    take(name).fail(error);
  },

  /**
   * As the host's cleanup on a reload: it ends every session, lets go of every
   * surface, and closes the realm, so later calls throw.
   */
  cleanUp() {
    this.closed = true;
    this.sessions.forEach((session) => session.inUse.clear());
    this.acquired.clear();
    this.pending.splice(0).forEach((pending) => {
      pending.fail(new Error(REALM_CLOSED));
    });
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
      create: jest.fn(() =>
        work("runtime.create", () => {
          const runtime = new FakeRuntime();
          mockNativeFfi.runtimes.push(runtime);
          return runtime;
        }),
      ),
    },
    MaplibreSurfaceView: (props: ViewProps) => createElement(View, props),
    surfaces: {
      acquire: jest.fn(
        (surface: number): { kind: "metal"; layer: bigint } | undefined => {
          mockNativeFfi.calls.push(`surfaces.acquire:${surface}`);
          if (mockNativeFfi.withdrawn.has(surface)) return undefined;
          if (mockNativeFfi.acquired.has(surface)) {
            mockNativeFfi.violations.push(
              `double acquire of surface ${surface}`,
            );
          }
          mockNativeFfi.acquired.add(surface);
          return { kind: "metal", layer: layerOf(surface) };
        },
      ),
      release: jest.fn((surface: number) => {
        mockNativeFfi.calls.push(`surfaces.release:${surface}`);
        for (const session of mockNativeFfi.sessions) {
          if (session.inUse.has(layerOf(surface))) {
            mockNativeFfi.violations.push(
              `released surface ${surface} under a live session`,
            );
          }
        }
        mockNativeFfi.acquired.delete(surface);
      }),
    },
    MapMode: { continuous: 0 },
    CameraUpdateMode: { jump: 0, ease: 1, fly: 2 },
    GesturePhase: { none: 0, begin: 1, update: 2, end: 3, cancel: 4 },
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
