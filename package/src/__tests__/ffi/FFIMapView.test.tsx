import { Map } from "@maplibre/maplibre-react-native";
import {
  act,
  fireEvent,
  render,
  type RenderResult,
} from "@testing-library/react-native";
import { StrictMode } from "react";

import { layerOf, mockNativeFfi } from "../__mocks__/NativeFfi.mock";

import {
  createMapController,
  type MapController,
} from "@/components/map/engine/MapController";
import {
  defineMapEngine,
  getMapEngineImplementation,
} from "@/components/map/engine/MapEngine";
import { ffiEngine } from "@/ffi";
import { FFIMapSession } from "@/ffi/FFIMapSession";
import { FFIMapView } from "@/ffi/FFIMapView";

const URL_STYLE = "https://demotiles.maplibre.org/style.json";
const OBJECT_STYLE = {
  version: 8,
  sources: {},
  layers: [{ id: "background", type: "background" }],
};

/** Lets every pending promise of the session settle. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function view(controller: MapController, mapStyle: unknown = URL_STYLE) {
  return (
    <FFIMapView
      props={{ mapStyle: mapStyle as string, testID: "map" }}
      controller={controller}
      mapRef={undefined}
    />
  );
}

async function layout(result: RenderResult, width = 320.4, height = 480.6) {
  await fireEvent(result.getByTestId("map-ffi-surface"), "layout", {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  });
}

async function surface(
  result: RenderResult,
  event: "surfaceAvailable" | "surfaceLost",
  id: number,
) {
  await fireEvent(result.getByTestId("map-ffi-surface"), event, {
    nativeEvent: { surface: id },
  });
}

/** Renders a map whose session renders to surface 1. */
async function renderAttached(controller = createMapController()) {
  const result = await render(view(controller));
  await layout(result);
  await surface(result, "surfaceAvailable", 1);
  await settle();
  return result;
}

/** The calls that hold or let go of native objects, in order. */
function lifecycle() {
  return mockNativeFfi.calls.filter((call) =>
    /^(session\.(ready|release|releaseTarget|setTarget)|map\.(attach|dispose)|runtime\.dispose|surfaces\.)/.test(
      call,
    ),
  );
}

beforeEach(() => {
  mockNativeFfi.reset();
});

afterEach(() => {
  expect(mockNativeFfi.violations).toEqual([]);
});

describe("FFI engine", () => {
  test("the controller reports the mapStyle capability", () => {
    const controller = getMapEngineImplementation(ffiEngine).createController();

    expect(controller.capabilities.has("mapStyle")).toBe(true);
  });

  describe("readiness", () => {
    test("becomes ready once the style loads, then runs queued commands", async () => {
      const controller = createMapController();
      const command = jest.fn(() => "done");
      const result = controller.run(command);

      await renderAttached(controller);

      expect(mockNativeFfi.calls).toContain(`map.attach:${layerOf(1)}`);
      expect(controller.isReady).toBe(false);
      expect(command).not.toHaveBeenCalled();

      await act(async () => mockNativeFfi.emit("mapStyleLoaded"));

      expect(controller.isReady).toBe(true);
      expect(command).toHaveBeenCalledTimes(1);
      await expect(result).resolves.toBe("done");
    });

    test("an event of another map does not make it ready", async () => {
      const controller = createMapController();
      await renderAttached(controller);

      await act(async () =>
        mockNativeFfi.runtimes[0]!.handler!.callback([
          { type: 4, source: 999n, message: "" },
        ]),
      );

      expect(controller.isReady).toBe(false);
    });

    test("in Strict Mode, the live map makes the current controller ready", async () => {
      const created: MapController[] = [];
      const engine = defineMapEngine({
        name: "ffi-test",
        MapView: FFIMapView,
        createController: () => {
          const controller = createMapController();
          created.push(controller);
          return controller;
        },
      });
      const result = await render(
        <StrictMode>
          <Map mapStyle={URL_STYLE} testID="map" engine={engine} />
        </StrictMode>,
      );
      await layout(result);
      await surface(result, "surfaceAvailable", 1);
      await settle();

      // Strict Mode started, disposed and started the session again, and
      // <Map> replaced its disposed controller.
      expect(mockNativeFfi.runtimes).toHaveLength(2);
      expect(mockNativeFfi.runtimes[0]!.dispose).toHaveBeenCalledTimes(1);
      expect(mockNativeFfi.sessions).toHaveLength(1);
      const current = created[created.length - 1]!;
      expect(current.isDisposed).toBe(false);
      expect(created[0]!.isDisposed).toBe(true);

      await act(async () => mockNativeFfi.emit("mapStyleLoaded"));

      expect(current.isReady).toBe(true);
    });
  });

  describe("mapStyle", () => {
    test("a URL calls the URL setter", async () => {
      await renderAttached();

      const map = mockNativeFfi.maps[0]!;
      expect(map.discarding.setStyleUrl).toHaveBeenCalledWith(URL_STYLE);
      expect(map.discarding.setStyleJson).not.toHaveBeenCalled();
    });

    test("an object calls the JSON setter with the style", async () => {
      await render(view(createMapController(), OBJECT_STYLE));
      await settle();

      const map = mockNativeFfi.maps[0]!;
      expect(map.discarding.setStyleJson).toHaveBeenCalledWith(OBJECT_STYLE);
      expect(map.discarding.setStyleUrl).not.toHaveBeenCalled();
    });

    test("a JSON string calls the JSON setter with the parsed style", async () => {
      await render(view(createMapController(), JSON.stringify(OBJECT_STYLE)));
      await settle();

      const map = mockNativeFfi.maps[0]!;
      expect(map.discarding.setStyleJson).toHaveBeenCalledWith(OBJECT_STYLE);
      expect(map.discarding.setStyleUrl).not.toHaveBeenCalled();
    });

    test("an equal object does not reload; a new URL does", async () => {
      const controller = createMapController();
      const result = await render(view(controller, OBJECT_STYLE));
      await settle();
      await result.rerender(view(controller, { ...OBJECT_STYLE }));
      await settle();

      const map = mockNativeFfi.maps[0]!;
      expect(map.discarding.setStyleJson).toHaveBeenCalledTimes(1);

      await result.rerender(view(controller, URL_STYLE));
      await settle();

      expect(map.discarding.setStyleUrl).toHaveBeenCalledWith(URL_STYLE);
    });
  });

  describe("attribution", () => {
    test("shows the distinct, non-empty attributions as plain text", async () => {
      mockNativeFfi.sources = [
        {
          id: "openmaptiles",
          attribution:
            '<a href="https://openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a>',
        },
        { id: "empty", attribution: "" },
        { id: "blank", attribution: "  " },
        {
          id: "copy",
          attribution:
            '<a href="https://openmaptiles.org/">&copy; OpenMapTiles</a>  <a href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a>',
        },
        { id: "naturalearth", attribution: "Natural Earth" },
      ];
      const result = await renderAttached();

      expect(result.queryByText(/OpenMapTiles/)).toBeNull();

      await act(async () => mockNativeFfi.emit("mapStyleLoaded"));
      await settle();

      expect(
        result.getByText(
          "© OpenMapTiles © OpenStreetMap contributors | Natural Earth",
        ),
      ).toBeDefined();
    });

    test("reads the attributions again when a source changes", async () => {
      mockNativeFfi.sources = [{ id: "a", attribution: "A" }];
      const result = await renderAttached();
      await act(async () => mockNativeFfi.emit("mapStyleLoaded"));
      await settle();
      expect(result.getByText("A")).toBeDefined();

      mockNativeFfi.sources = [
        { id: "a", attribution: "A" },
        { id: "b", attribution: "B" },
      ];
      await act(async () => mockNativeFfi.emit("mapSourceChanged"));
      await settle();

      expect(result.getByText("A | B")).toBeDefined();
    });
  });

  describe("lifecycle", () => {
    test("resizes the session in whole logical pixels", async () => {
      const result = await renderAttached();

      expect(mockNativeFfi.maps[0]!.attachMetalSurface).toHaveBeenCalledWith(
        { logicalSize: { width: 320, height: 481 }, layer: layerOf(1) },
        expect.anything(),
      );

      await layout(result, 200.5, 0.2);

      expect(mockNativeFfi.calls).toContain("session.resize:201x1");
    });

    test("on unmount, releases the surface only after the session's release settles", async () => {
      mockNativeFfi.hold("session.release");
      const result = await renderAttached();
      mockNativeFfi.calls = [];

      await result.unmount();
      await settle();

      expect(lifecycle()).toEqual(["session.release"]);

      mockNativeFfi.settle("session.release");
      await settle();

      expect(lifecycle()).toEqual([
        "session.release",
        "session.release:settled",
        "map.dispose",
        "runtime.dispose",
        "surfaces.release:1",
      ]);
    });

    test("a second dispose does nothing", async () => {
      const session = new FFIMapSession(() => {});
      session.start();
      session.setSize({ width: 10, height: 10 });
      session.surfaceAvailable(1);
      await settle();
      mockNativeFfi.calls = [];

      session.dispose();
      session.dispose();
      await settle();

      expect(lifecycle()).toEqual([
        "session.release",
        "session.release:settled",
        "map.dispose",
        "runtime.dispose",
        "surfaces.release:1",
      ]);
    });

    test("after the host cleaned the binding up, releases the surface once", async () => {
      const result = await renderAttached();
      mockNativeFfi.calls = [];
      mockNativeFfi.cleanUp();
      const log = jest.spyOn(console, "log").mockImplementation(() => {});
      const error = jest.spyOn(console, "error");

      await result.unmount();
      await settle();

      expect(lifecycle()).toEqual([
        "session.release",
        "map.dispose",
        "runtime.dispose",
        "surfaces.release:1",
      ]);
      expect(log).toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
      log.mockRestore();
      error.mockRestore();
    });

    test("when the session fails to release, keeps the surface held and still disposes", async () => {
      mockNativeFfi.hold("session.release");
      const result = await renderAttached();
      mockNativeFfi.calls = [];
      const error = jest.spyOn(console, "error").mockImplementation(() => {});

      await result.unmount();
      await settle();
      mockNativeFfi.fail("session.release", new Error("busy"));
      await settle();

      expect(lifecycle()).toEqual([
        "session.release",
        "session.release:failed",
        "map.dispose",
        "runtime.dispose",
      ]);
      expect(mockNativeFfi.acquired.has(1)).toBe(true);
      expect(error).toHaveBeenCalled();
      error.mockRestore();
    });

    test("a map that fails to dispose does not stop the runtime's dispose", async () => {
      const result = await renderAttached();
      mockNativeFfi.calls = [];
      mockNativeFfi.mapDisposeError = new Error("stale");
      const error = jest.spyOn(console, "error").mockImplementation(() => {});

      await result.unmount();
      await settle();

      expect(lifecycle()).toEqual([
        "session.release",
        "session.release:settled",
        "map.dispose",
        "runtime.dispose",
        "surfaces.release:1",
      ]);
      expect(error).toHaveBeenCalled();
      error.mockRestore();
    });

    test("unmount before the runtime exists disposes the runtime once it arrives", async () => {
      mockNativeFfi.hold("runtime.create");
      const result = await render(view(createMapController()));
      await result.unmount();
      await settle();

      mockNativeFfi.settle("runtime.create");
      await settle();

      expect(mockNativeFfi.runtimes[0]!.dispose).toHaveBeenCalledTimes(1);
      expect(mockNativeFfi.maps).toHaveLength(0);
    });

    test("unmount before the map is ready disposes it and never attaches", async () => {
      mockNativeFfi.hold("map.ready");
      const result = await render(view(createMapController()));
      await layout(result);
      await surface(result, "surfaceAvailable", 1);
      await settle();
      await result.unmount();
      await settle();

      expect(lifecycle()).toEqual(["map.dispose", "runtime.dispose"]);

      mockNativeFfi.settle("map.ready");
      await settle();

      expect(lifecycle()).toEqual(["map.dispose", "runtime.dispose"]);
    });

    test("unmount during an attach waits for it, then releases in order", async () => {
      mockNativeFfi.hold("session.ready");
      const result = await renderAttached();
      await result.unmount();
      await settle();

      expect(lifecycle()).toEqual([
        "surfaces.acquire:1",
        `map.attach:${layerOf(1)}`,
      ]);

      mockNativeFfi.settle("session.ready");
      await settle();

      expect(lifecycle()).toEqual([
        "surfaces.acquire:1",
        `map.attach:${layerOf(1)}`,
        "session.ready:settled",
        "session.release",
        "session.release:settled",
        "map.dispose",
        "runtime.dispose",
        "surfaces.release:1",
      ]);
    });

    test("unmount after a lost surface does not release it again", async () => {
      const result = await renderAttached();
      await surface(result, "surfaceLost", 1);
      await settle();
      await result.unmount();
      await settle();

      expect(
        mockNativeFfi.calls.filter((call) => call === "surfaces.release:1"),
      ).toHaveLength(1);
    });

    test("a surface that the view withdrew first is not attached", async () => {
      mockNativeFfi.withdrawn.add(1);
      const result = await renderAttached();
      await result.unmount();
      await settle();

      expect(lifecycle()).toEqual([
        "surfaces.acquire:1",
        "map.dispose",
        "runtime.dispose",
      ]);
    });

    test("a lost surface is released only after the session lets go of it", async () => {
      mockNativeFfi.hold("session.releaseTarget");
      const result = await renderAttached();
      mockNativeFfi.calls = [];

      await surface(result, "surfaceLost", 1);
      await settle();

      expect(lifecycle()).toEqual(["session.releaseTarget"]);

      mockNativeFfi.settle("session.releaseTarget");
      await settle();

      expect(lifecycle()).toEqual([
        "session.releaseTarget",
        "session.releaseTarget:settled",
        "surfaces.release:1",
      ]);

      mockNativeFfi.calls = [];
      await surface(result, "surfaceAvailable", 2);
      await settle();

      expect(lifecycle()).toEqual([
        "surfaces.acquire:2",
        `session.setTarget:${layerOf(2)}`,
        "session.setTarget:settled",
      ]);
      expect(mockNativeFfi.sessions).toHaveLength(1);
    });

    test("a new surface releases the old one only after the switch settles", async () => {
      mockNativeFfi.hold("session.setTarget");
      const result = await renderAttached();
      mockNativeFfi.calls = [];

      await surface(result, "surfaceAvailable", 2);
      await settle();

      expect(lifecycle()).toEqual([
        "surfaces.acquire:2",
        `session.setTarget:${layerOf(2)}`,
      ]);

      mockNativeFfi.settle("session.setTarget");
      await settle();

      expect(lifecycle()).toEqual([
        "surfaces.acquire:2",
        `session.setTarget:${layerOf(2)}`,
        "session.setTarget:settled",
        "surfaces.release:1",
      ]);
    });

    test("a failed switch keeps both surfaces held until unmount", async () => {
      mockNativeFfi.hold("session.setTarget");
      const result = await renderAttached();
      const error = jest.spyOn(console, "error").mockImplementation(() => {});
      await surface(result, "surfaceAvailable", 2);
      await settle();
      mockNativeFfi.fail("session.setTarget", new Error("no layer"));
      await settle();

      expect(mockNativeFfi.acquired).toEqual(new Set([1, 2]));
      expect(error).toHaveBeenCalled();

      mockNativeFfi.calls = [];
      await result.unmount();
      await settle();

      expect(lifecycle()).toEqual([
        "session.release",
        "session.release:settled",
        "map.dispose",
        "runtime.dispose",
        "surfaces.release:1",
        "surfaces.release:2",
      ]);
      error.mockRestore();
    });
  });

  describe("held surfaces", () => {
    test("a retry after a failed attach reuses the held surface", async () => {
      mockNativeFfi.attachError = new Error("no device");
      const error = jest.spyOn(console, "error").mockImplementation(() => {});
      const result = await renderAttached();

      expect(mockNativeFfi.sessions).toHaveLength(0);
      expect(mockNativeFfi.acquired.has(1)).toBe(true);

      mockNativeFfi.calls = [];
      await layout(result, 300, 400);
      await settle();

      expect(lifecycle()).toEqual([
        `map.attach:${layerOf(1)}`,
        "session.ready:settled",
      ]);
      expect(mockNativeFfi.sessions).toHaveLength(1);
      error.mockRestore();
    });

    test("losing a held surface that is not the target leaves the target alone", async () => {
      mockNativeFfi.hold("session.setTarget");
      const result = await renderAttached();
      const error = jest.spyOn(console, "error").mockImplementation(() => {});
      await surface(result, "surfaceAvailable", 2);
      await settle();
      mockNativeFfi.fail("session.setTarget", new Error("no layer"));
      await settle();
      mockNativeFfi.calls = [];

      await surface(result, "surfaceLost", 2);
      await settle();

      expect(lifecycle()).toEqual([]);
      expect(mockNativeFfi.acquired).toEqual(new Set([1, 2]));
      error.mockRestore();
    });
  });

  describe("after the host cleaned the binding up", () => {
    test("a layout does not throw", async () => {
      const result = await renderAttached();
      mockNativeFfi.cleanUp();
      mockNativeFfi.calls = [];

      await layout(result, 100, 100);

      expect(mockNativeFfi.calls).toEqual(["session.resize:100x100"]);
    });

    test("a new style does not throw", async () => {
      const controller = createMapController();
      const result = await renderAttached(controller);
      mockNativeFfi.cleanUp();
      mockNativeFfi.calls = [];

      await result.rerender(view(controller, OBJECT_STYLE));

      expect(mockNativeFfi.calls).toEqual(["map.setStyleJson:object"]);
    });

    test("a frame already scheduled does not throw", async () => {
      let frame: (() => void) | undefined;
      const raf = jest
        .spyOn(global, "requestAnimationFrame")
        .mockImplementation((callback) => {
          frame = () => callback(0);
          return 0;
        });
      await renderAttached();
      const session = mockNativeFfi.sessions[0]!;
      session.drainFrameResults.mockReturnValueOnce([{ disposition: 0 }]);
      const [, options] = mockNativeFfi.maps[0]!.attachMetalSurface.mock
        .calls[0] as unknown as [unknown, { frameWake: { callback(): void } }];
      options.frameWake.callback();
      expect(frame).toBeDefined();
      session.demandFrame.mockClear();

      mockNativeFfi.cleanUp();
      frame!();

      expect(session.demandFrame).toHaveBeenCalledTimes(1);
      raf.mockRestore();
    });

    test("any other error still throws", async () => {
      const result = await renderAttached();
      mockNativeFfi.sessions[0]!.discarding.resize.mockImplementationOnce(
        () => {
          throw new Error("bad size");
        },
      );

      await expect(layout(result, 100, 100)).rejects.toThrow("bad size");
    });
  });

  describe("restart on the same object, as Fast Refresh does", () => {
    test("a retarget queued before the restart does not attach to the old session's surface", async () => {
      mockNativeFfi.hold("session.ready");
      const session = new FFIMapSession(() => {});
      session.start();
      await settle();
      session.setSize({ width: 10, height: 10 });
      session.surfaceAvailable(1);
      await settle();

      session.dispose();
      session.start();
      await settle();
      mockNativeFfi.settle("session.ready");
      await settle();

      const calls = lifecycle();
      expect(calls.slice(0, 8)).toEqual([
        "surfaces.acquire:1",
        `map.attach:${layerOf(1)}`,
        "session.ready:settled",
        "session.release",
        "session.release:settled",
        "map.dispose",
        "runtime.dispose",
        "surfaces.release:1",
      ]);
      // The new start attaches its own session once the old one is gone.
      expect(calls.slice(8)).toEqual([
        "surfaces.acquire:1",
        `map.attach:${layerOf(1)}`,
      ]);
      session.dispose();
    });

    test("a surfaceLost queued before the restart cannot release a surface the old session uses", async () => {
      mockNativeFfi.hold("session.setTarget", "session.release");
      const session = new FFIMapSession(() => {});
      session.start();
      session.setSize({ width: 10, height: 10 });
      session.surfaceAvailable(1);
      await settle();
      session.surfaceAvailable(2);
      await settle();
      session.surfaceLost(2);

      session.dispose();
      session.start();
      await settle();
      mockNativeFfi.settle("session.setTarget");
      await settle();

      expect(mockNativeFfi.calls).not.toContain("surfaces.release:2");

      mockNativeFfi.settle("session.release");
      await settle();

      const calls = mockNativeFfi.calls;
      expect(calls.indexOf("surfaces.release:2")).toBeGreaterThan(
        calls.indexOf("session.release:settled"),
      );
    });
  });

  describe("attribution reads", () => {
    test("at most one read is in flight, and one more follows it", async () => {
      mockNativeFfi.hold("map.listStyleSources");
      mockNativeFfi.sources = [{ id: "a", attribution: "A" }];
      const result = await renderAttached();
      const map = mockNativeFfi.maps[0]!;

      await act(async () => {
        mockNativeFfi.emit("mapStyleLoaded");
        mockNativeFfi.emit("mapSourceChanged");
        mockNativeFfi.emit("mapSourceChanged");
        mockNativeFfi.emit("mapSourceChanged");
      });

      expect(map.listStyleSources).toHaveBeenCalledTimes(1);

      mockNativeFfi.settle("map.listStyleSources");
      await settle();

      expect(map.listStyleSources).toHaveBeenCalledTimes(2);

      mockNativeFfi.sources = [{ id: "b", attribution: "B" }];
      mockNativeFfi.settle("map.listStyleSources");
      await settle();

      expect(map.listStyleSources).toHaveBeenCalledTimes(2);
      expect(result.getByText("B")).toBeDefined();
    });
  });
});
