import {
  Map,
  type MapEngine,
  MapEngineProvider,
  type MapProps,
} from "@maplibre/maplibre-react-native";
import { act, fireEvent, render } from "@testing-library/react-native";
import { type ReactNode, StrictMode } from "react";
import { View } from "react-native";

import {
  createMapController,
  type MapController,
} from "@/components/map/engine/MapController";
import { useMapController } from "@/components/map/engine/MapControllerContext";
import { defineMapEngine } from "@/components/map/engine/MapEngine";
import { ffiEngine } from "@/ffi";

const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

const created: Record<string, MapController[]> = {};

function testEngine(name: string): MapEngine {
  created[name] = [];

  return defineMapEngine({
    name,
    MapView: ({ props }) => (
      <View testID={`${name}-map`} style={props.style}>
        {props.children}
      </View>
    ),
    createController: () => {
      const controller = createMapController();
      created[name]!.push(controller);
      return controller;
    },
  });
}

let seen: (MapController | undefined)[] = [];

function Probe() {
  seen.push(useMapController());
  return <View testID="probe" />;
}

async function renderMap(props: Partial<MapProps> = {}, wrap?: MapEngine) {
  const map = (
    <Map mapStyle={MAP_STYLE} testID="mlrn-map" {...props}>
      <Probe />
    </Map>
  );
  const result = await render(
    wrap ? <MapEngineProvider engine={wrap}>{map}</MapEngineProvider> : map,
  );
  const nativeView = result.queryByTestId("mlrn-map-view");
  if (nativeView) {
    await fireEvent(nativeView, "layout");
  }
  return result;
}

describe("Map engine", () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    seen = [];
    warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  describe("selection", () => {
    test("no provider and no prop renders native without a controller", async () => {
      const result = await renderMap();

      expect(result.getByTestId("mlrn-map")).toBeDefined();
      expect(result.getByTestId("probe")).toBeDefined();
      expect(seen.length).toBeGreaterThan(0);
      expect(seen.every((controller) => controller === undefined)).toBe(true);
    });

    test("the provider sets the engine for its subtree", async () => {
      const a = testEngine("a");
      const result = await renderMap({}, a);

      expect(result.getByTestId("a-map")).toBeDefined();
      expect(result.queryByTestId("mlrn-map-view")).toBeNull();
    });

    test("the prop overrides the provider", async () => {
      const a = testEngine("a");
      const b = testEngine("b");
      const result = await renderMap({ engine: b }, a);

      expect(result.getByTestId("b-map")).toBeDefined();
      expect(result.queryByTestId("a-map")).toBeNull();
      expect(created.a).toHaveLength(0);
    });

    test("the prop works without a provider", async () => {
      const b = testEngine("b");
      const result = await renderMap({ engine: b });

      expect(result.getByTestId("b-map")).toBeDefined();
      expect(result.queryByTestId("mlrn-map-view")).toBeNull();
    });

    test("an engine map provides one stable controller to its children", async () => {
      const a = testEngine("a");
      const result = await renderMap({}, a);

      await result.rerender(
        <MapEngineProvider engine={a}>
          <Map mapStyle={MAP_STYLE} testID="mlrn-map" compass>
            <Probe />
          </Map>
        </MapEngineProvider>,
      );

      expect(created.a).toHaveLength(1);
      expect(seen.length).toBeGreaterThan(1);
      expect(seen.every((controller) => controller === created.a![0])).toBe(
        true,
      );
    });

    test("the controller is disposed on unmount", async () => {
      const a = testEngine("a");
      const result = await renderMap({}, a);

      expect(created.a![0]!.isDisposed).toBe(false);
      await result.unmount();
      expect(created.a![0]!.isDisposed).toBe(true);
    });

    test("strict mode remounts get a live controller", async () => {
      const a = testEngine("a");
      await render(
        <StrictMode>
          <Map mapStyle={MAP_STYLE} engine={a}>
            <Probe />
          </Map>
        </StrictMode>,
      );

      const last = seen[seen.length - 1];
      expect(last).toBeDefined();
      expect(last!.isDisposed).toBe(false);
    });

    test("the ffi engine renders its placeholder", async () => {
      const result = await renderMap({ engine: ffiEngine });

      expect(result.getByTestId("mlrn-map-ffi")).toBeDefined();
      expect(result.queryByTestId("mlrn-map-view")).toBeNull();
    });
  });

  describe("fixed for the mount", () => {
    function tree(engine: MapEngine | undefined, children?: ReactNode) {
      return (
        <Map mapStyle={MAP_STYLE} testID="mlrn-map" engine={engine}>
          {children}
        </Map>
      );
    }

    test("a changed prop keeps the first engine and warns once", async () => {
      const a = testEngine("a");
      const b = testEngine("b");
      const c = testEngine("c");
      const result = await render(tree(a));

      await result.rerender(tree(b));
      await result.rerender(tree(c));
      await result.rerender(tree(b));

      expect(result.getByTestId("a-map")).toBeDefined();
      expect(result.queryByTestId("b-map")).toBeNull();
      expect(result.queryByTestId("c-map")).toBeNull();
      expect(created.b).toHaveLength(0);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]![0]).toMatch(/key/);
    });

    test("switching from native to an engine keeps native and warns once", async () => {
      const a = testEngine("a");
      const result = await render(tree(undefined));
      await fireEvent(result.getByTestId("mlrn-map-view"), "layout");

      await result.rerender(tree(a));
      await result.rerender(tree(a));

      expect(result.getByTestId("mlrn-map")).toBeDefined();
      expect(result.queryByTestId("a-map")).toBeNull();
      expect(warn).toHaveBeenCalledTimes(1);
    });

    test("a changed provider keeps the first engine", async () => {
      const a = testEngine("a");
      const b = testEngine("b");
      const result = await render(
        <MapEngineProvider engine={a}>{tree(undefined)}</MapEngineProvider>,
      );

      await act(async () => {
        await result.rerender(
          <MapEngineProvider engine={b}>{tree(undefined)}</MapEngineProvider>,
        );
      });

      expect(result.getByTestId("a-map")).toBeDefined();
      expect(result.queryByTestId("b-map")).toBeNull();
      expect(warn).toHaveBeenCalledTimes(1);
    });

    test("a re-render with the same engine does not warn", async () => {
      const a = testEngine("a");
      const result = await render(tree(a));

      await result.rerender(tree(a));

      expect(warn).not.toHaveBeenCalled();
    });
  });
});
