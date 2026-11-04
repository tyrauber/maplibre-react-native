import {
  Callout,
  Camera,
  GeoJSONSource,
  ImageSource,
  Images,
  Layer,
  Map,
  type MapProps,
  type MapRef,
  Marker,
  NativeUserLocation,
  RasterDEMSource,
  RasterSource,
  UnsupportedByEngineError,
  VectorSource,
  ViewAnnotation,
} from "@maplibre/maplibre-react-native";
import { render } from "@testing-library/react-native";
import { Component, createRef, type ReactElement, type ReactNode } from "react";
import { View } from "react-native";

import { mockNativeFfi } from "../__mocks__/NativeFfi.mock";

import { resetEngineWarnings } from "@/components/map/engine/engineProps";
import { ffiEngine } from "@/ffi";

const mockRendered: string[] = [];

// Each native component of a <Map> child records that it rendered.
function mockNative(path: string, name: string) {
  return {
    ...jest.requireActual(path),
    __esModule: true,
    default: () => {
      mockRendered.push(name);
      return null;
    },
  };
}

jest.mock("@/components/camera/CameraNativeComponent", () =>
  mockNative("@/components/camera/CameraNativeComponent", "Camera"),
);
jest.mock("@/components/images/ImagesNativeComponent", () =>
  mockNative("@/components/images/ImagesNativeComponent", "Images"),
);
jest.mock("@/components/layer/LayerNativeComponent", () =>
  mockNative("@/components/layer/LayerNativeComponent", "Layer"),
);
jest.mock("@/components/user-location/UserLocationNativeComponent", () =>
  mockNative(
    "@/components/user-location/UserLocationNativeComponent",
    "UserLocation",
  ),
);
jest.mock("@/components/annotations/marker/MarkerViewNativeComponent", () =>
  mockNative(
    "@/components/annotations/marker/MarkerViewNativeComponent",
    "Marker",
  ),
);
jest.mock("@/components/annotations/callout/CalloutNativeComponent", () =>
  mockNative(
    "@/components/annotations/callout/CalloutNativeComponent",
    "Callout",
  ),
);
jest.mock(
  "@/components/annotations/view-annotation/PointAnnotationNativeComponent",
  () =>
    mockNative(
      "@/components/annotations/view-annotation/PointAnnotationNativeComponent",
      "PointAnnotation",
    ),
);
jest.mock(
  "@/components/sources/geojson-source/GeoJSONSourceNativeComponent",
  () =>
    mockNative(
      "@/components/sources/geojson-source/GeoJSONSourceNativeComponent",
      "GeoJSONSource",
    ),
);
jest.mock("@/components/sources/image-source/ImageSourceNativeComponent", () =>
  mockNative(
    "@/components/sources/image-source/ImageSourceNativeComponent",
    "ImageSource",
  ),
);
jest.mock(
  "@/components/sources/raster-dem-source/RasterDEMSourceNativeComponent",
  () =>
    mockNative(
      "@/components/sources/raster-dem-source/RasterDEMSourceNativeComponent",
      "RasterDEMSource",
    ),
);
jest.mock(
  "@/components/sources/raster-source/RasterSourceNativeComponent",
  () =>
    mockNative(
      "@/components/sources/raster-source/RasterSourceNativeComponent",
      "RasterSource",
    ),
);
jest.mock(
  "@/components/sources/vector-source/VectorSourceNativeComponent",
  () =>
    mockNative(
      "@/components/sources/vector-source/VectorSourceNativeComponent",
      "VectorSource",
    ),
);

const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

class Boundary extends Component<
  { onError: (error: unknown) => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Renders an FFI map, and returns what an error boundary caught. */
async function renderFfi(props: Partial<MapProps> = {}, children?: ReactNode) {
  let caught: unknown;
  const result = await render(
    <Boundary onError={(error) => (caught = error)}>
      <Map mapStyle={MAP_STYLE} testID="map" engine={ffiEngine} {...props}>
        {children}
      </Map>
    </Boundary>,
  );
  return { result, caught };
}

function expectUnsupported(caught: unknown, feature: string) {
  expect(caught).toBeInstanceOf(UnsupportedByEngineError);
  expect(caught).toMatchObject({ engine: "ffi", feature });
}

let consoleError: jest.SpyInstance;
let consoleWarn: jest.SpyInstance;

beforeEach(() => {
  mockNativeFfi.reset();
  mockRendered.length = 0;
  resetEngineWarnings();
  // React reports each error that a boundary catches.
  consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
  consoleWarn.mockRestore();
});

describe("UnsupportedByEngineError", () => {
  test("names the engine and the feature", () => {
    const error = new UnsupportedByEngineError("ffi", "dragPan");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("UnsupportedByEngineError");
    expect(error.engine).toBe("ffi");
    expect(error.feature).toBe("dragPan");
    expect(error.message).toContain('"ffi"');
    expect(error.message).toContain("dragPan");
  });
});

describe("FFI engine props", () => {
  test.each<[string, Partial<MapProps>]>([
    ["touchPitch", { touchPitch: true }],
    ["contentInset", { contentInset: { top: 10 } }],
    ["light", { light: { intensity: 0.5 } }],
    ["preferredFramesPerSecond", { preferredFramesPerSecond: 30 }],
    ["onPress", { onPress: () => {} }],
    ["onRegionDidChange", { onRegionDidChange: () => {} }],
    ["androidView", { androidView: "texture" }],
    ["attribution", { attribution: false }],
  ])("an explicit %s throws during render", async (feature, props) => {
    const { result, caught } = await renderFfi(props);

    expectUnsupported(caught, feature);
    expect(result.queryByTestId("map-ffi")).toBeNull();
  });

  test("an undefined prop is not a request", async () => {
    const { result, caught } = await renderFfi({
      dragPan: undefined,
      onPress: undefined,
      light: undefined,
      attribution: undefined,
      androidView: undefined,
    });

    expect(caught).toBeUndefined();
    expect(result.getByTestId("map-ffi")).toBeDefined();
  });

  test("props the engine honours render", async () => {
    const { caught } = await renderFfi({
      attribution: true,
      androidView: "surface",
    });

    expect(caught).toBeUndefined();
  });

  test("a cosmetic prop warns once per name, not on every render", async () => {
    const first = await renderFfi({
      logo: false,
      compassPosition: { top: 8, right: 8 },
    });
    await first.result.rerender(
      <Map
        mapStyle={MAP_STYLE}
        testID="map"
        engine={ffiEngine}
        logo={false}
        compassPosition={{ top: 9, right: 9 }}
      />,
    );
    await renderFfi({ logo: true });

    expect(first.caught).toBeUndefined();
    const warnings = consoleWarn.mock.calls.map(([message]) => message);
    expect(warnings.filter((message) => message.includes("logo"))).toHaveLength(
      1,
    );
    expect(
      warnings.filter((message) => message.includes("compassPosition")),
    ).toHaveLength(1);
  });

  test("plain view props pass through to the view", async () => {
    const onLayout = jest.fn();
    const { result, caught } = await renderFfi({
      accessibilityLabel: "the map",
      onLayout,
    });

    expect(caught).toBeUndefined();
    const view = result.getByTestId("map-ffi");
    expect(view.props.accessibilityLabel).toBe("the map");
    expect(view.props.onLayout).toBe(onLayout);
  });
});

describe("FFI engine children", () => {
  const point: GeoJSON.Point = { type: "Point", coordinates: [0, 0] };

  test.each<[string, ReactElement]>([
    ["<Images>", <Images images={{}} />],
    ["<Layer>", <Layer id="l" type="background" />],
    ["<NativeUserLocation>", <NativeUserLocation />],
    [
      "<Marker>",
      <Marker id="m" lngLat={[0, 0]}>
        <View />
      </Marker>,
    ],
    [
      "<ViewAnnotation>",
      <ViewAnnotation id="v" lngLat={[0, 0]}>
        <View />
      </ViewAnnotation>,
    ],
    ["<Callout>", <Callout title="c" />],
    ["<GeoJSONSource>", <GeoJSONSource id="g" data={point} />],
    [
      "<ImageSource>",
      <ImageSource
        id="i"
        url="https://example.com/a.png"
        coordinates={[
          [0, 1],
          [1, 1],
          [1, 0],
          [0, 0],
        ]}
      />,
    ],
    ["<RasterDEMSource>", <RasterDEMSource id="d" url="https://e.com" />],
    ["<RasterSource>", <RasterSource id="r" url="https://e.com" />],
    ["<VectorSource>", <VectorSource id="s" url="https://e.com" />],
  ])(
    "%s throws, and its native component never renders",
    async (feature, child) => {
      const { caught } = await renderFfi({}, child);

      expectUnsupported(caught, feature);
      expect(mockRendered).toEqual([]);
    },
  );

  test("<Camera> renders the FFI camera, not the native one", async () => {
    const { caught } = await renderFfi({}, <Camera zoom={2} />);

    expect(caught).toBeUndefined();
    expect(mockRendered).toEqual([]);
  });

  test("a child inside a wrapper component throws too", async () => {
    function Wrapper() {
      return (
        <View>
          <GeoJSONSource id="g" data={point} />
        </View>
      );
    }
    const { caught } = await renderFfi({}, <Wrapper />);

    expectUnsupported(caught, "<GeoJSONSource>");
    expect(mockRendered).toEqual([]);
  });

  test("a plain view renders over the map", async () => {
    const { result, caught } = await renderFfi({}, <View testID="overlay" />);

    expect(caught).toBeUndefined();
    expect(result.getByTestId("overlay")).toBeDefined();
  });
});

describe("FFI engine MapRef", () => {
  test("every method rejects with UnsupportedByEngineError", async () => {
    const ref = createRef<MapRef>();
    await renderFfi({ ref });

    const methods: (keyof MapRef)[] = [
      "getCenter",
      "getZoom",
      "getBearing",
      "getPitch",
      "getBounds",
      "getViewState",
      "project",
      "unproject",
      "queryRenderedFeatures",
      "createStaticMapImage",
      "setSourceVisibility",
      "showAttribution",
    ];
    expect(ref.current).not.toBeNull();
    expect(Object.keys(ref.current!).sort()).toEqual([...methods].sort());

    for (const method of methods) {
      const call = ref.current![method] as () => Promise<unknown>;
      const result = call();
      expect(result).toBeInstanceOf(Promise);
      await expect(result).rejects.toBeInstanceOf(UnsupportedByEngineError);
      await expect(result).rejects.toMatchObject({
        engine: "ffi",
        feature: `MapRef.${method}()`,
      });
    }
  });
});
