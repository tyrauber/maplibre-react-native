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

beforeEach(() => {
  mockNativeFfi.reset();
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

    test("on unmount, releases the session, then disposes, then releases the surface", async () => {
      const result = await renderAttached();
      mockNativeFfi.calls = [];

      await result.unmount();
      await settle();

      expect(mockNativeFfi.calls).toEqual([
        "session.release",
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

      expect(mockNativeFfi.calls).toEqual([
        "session.release",
        "map.dispose",
        "runtime.dispose",
        "surfaces.release:1",
      ]);
    });

    test("after the binding was cleaned up, still releases the surface once", async () => {
      const result = await renderAttached();
      mockNativeFfi.calls = [];
      mockNativeFfi.cleanedUp = true;
      const log = jest.spyOn(console, "log").mockImplementation(() => {});

      await result.unmount();
      await settle();

      expect(mockNativeFfi.calls).toEqual([
        "session.release",
        "surfaces.release:1",
      ]);
      log.mockRestore();
    });

    test("a lost surface leaves the session, which a new surface retargets", async () => {
      const result = await renderAttached();
      mockNativeFfi.calls = [];

      await surface(result, "surfaceLost", 1);
      await settle();

      expect(mockNativeFfi.calls).toEqual([
        "session.releaseTarget",
        "surfaces.release:1",
      ]);

      mockNativeFfi.calls = [];
      await surface(result, "surfaceAvailable", 2);
      await settle();

      expect(mockNativeFfi.calls).toEqual([
        "surfaces.acquire:2",
        `session.setTarget:${layerOf(2)}`,
      ]);
      expect(mockNativeFfi.sessions).toHaveLength(1);
    });

    test("a new surface while attached releases the old one after the switch", async () => {
      const result = await renderAttached();
      mockNativeFfi.calls = [];

      await surface(result, "surfaceAvailable", 2);
      await settle();

      expect(mockNativeFfi.calls).toEqual([
        "surfaces.acquire:2",
        `session.setTarget:${layerOf(2)}`,
        "surfaces.release:1",
      ]);
    });
  });
});
