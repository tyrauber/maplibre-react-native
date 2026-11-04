import {
  Camera,
  type CameraProps,
  type CameraRef,
  Map,
  UnsupportedByEngineError,
} from "@maplibre/maplibre-react-native";
import { act, render } from "@testing-library/react-native";
import { Component, createRef, type ReactNode, StrictMode } from "react";

import { mockNativeFfi } from "../__mocks__/NativeFfi.mock";

import { ffiEngine } from "@/ffi";

const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

const JUMP = 0;
const EASE = 1;
const FLY = 2;
const EASE_IN_OUT = { x1: 0.42, y1: 0, x2: 0.58, y2: 1 };
const LINEAR = { x1: 0, y1: 0, x2: 1, y2: 1 };

/** Lets every pending promise settle. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

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

function tree(props: Partial<CameraProps>, ref?: React.Ref<CameraRef>) {
  return (
    <Map mapStyle={MAP_STYLE} testID="map" engine={ffiEngine}>
      <Camera ref={ref} {...(props as CameraProps)} />
    </Map>
  );
}

/** Renders an FFI map with a camera, and makes the map ready unless told not to. */
async function renderCamera(
  props: Partial<CameraProps>,
  { ready = true } = {},
) {
  const ref = createRef<CameraRef>();
  const result = await render(tree(props, ref));
  await settle();
  if (ready) await makeReady();
  return { result, ref };
}

async function makeReady() {
  await act(async () => mockNativeFfi.emit("mapStyleLoaded"));
  await settle();
}

const commands = () => mockNativeFfi.cameraCommands;

beforeEach(() => {
  mockNativeFfi.reset();
});

describe("FFI <Camera>", () => {
  describe("stop props", () => {
    test("without easing, jumps to the camera fields", async () => {
      await renderCamera({ center: [1, 2], zoom: 3, bearing: 4, pitch: 5 });

      expect(commands()).toEqual([
        [
          "updateCamera",
          {
            mode: JUMP,
            camera: {
              center: { latitude: 2, longitude: 1 },
              zoom: 3,
              bearing: 4,
              pitch: 5,
            },
          },
        ],
      ]);
    });

    test("ease eases with the duration and an ease-in-out curve", async () => {
      await renderCamera({ zoom: 6, easing: "ease", duration: 500 });

      expect(commands()).toEqual([
        [
          "updateCamera",
          {
            mode: EASE,
            camera: { zoom: 6 },
            animation: { durationMs: 500, easing: EASE_IN_OUT },
          },
        ],
      ]);
    });

    test("linear eases with the duration and a linear curve", async () => {
      await renderCamera({ bearing: 90, easing: "linear", duration: 300 });

      expect(commands()).toEqual([
        [
          "updateCamera",
          {
            mode: EASE,
            camera: { bearing: 90 },
            animation: { durationMs: 300, easing: LINEAR },
          },
        ],
      ]);
    });

    test("an ease without a duration takes no time, as on the native engine", async () => {
      await renderCamera({ pitch: 30, easing: "ease" });

      expect(commands()).toEqual([
        [
          "updateCamera",
          {
            mode: EASE,
            camera: { pitch: 30 },
            animation: { durationMs: 0, easing: EASE_IN_OUT },
          },
        ],
      ]);
    });

    test("fly flies with the duration, or picks its own without one", async () => {
      const { result } = await renderCamera({
        center: [10, 20],
        easing: "fly",
        duration: 6000,
      });
      await result.rerender(tree({ center: [11, 21], easing: "fly" }));
      await settle();

      expect(commands()).toEqual([
        [
          "updateCamera",
          {
            mode: FLY,
            camera: { center: { latitude: 20, longitude: 10 } },
            animation: { durationMs: 6000 },
          },
        ],
        [
          "updateCamera",
          {
            mode: FLY,
            camera: { center: { latitude: 21, longitude: 11 } },
            animation: {},
          },
        ],
      ]);
    });

    test("padding fills the edges it leaves out with zero", async () => {
      await renderCamera({ zoom: 4, padding: { top: 10, left: 5 } });

      expect(commands()).toEqual([
        [
          "updateCamera",
          {
            mode: JUMP,
            camera: {
              zoom: 4,
              padding: { top: 10, left: 5, bottom: 0, right: 0 },
            },
          },
        ],
      ]);
    });

    test("bounds fit the camera, with padding, bearing and pitch", async () => {
      await renderCamera({
        bounds: [-10, -20, 30, 40],
        padding: { top: 8, right: 8, bottom: 8, left: 8 },
        bearing: 15,
        pitch: 10,
        zoom: 99,
        easing: "fly",
        duration: 1000,
      });

      expect(commands()).toEqual([
        [
          "fitCameraToLatLngBounds",
          {
            southwest: { latitude: -20, longitude: -10 },
            northeast: { latitude: 40, longitude: 30 },
          },
          {
            mode: FLY,
            fit: {
              padding: { top: 8, left: 8, bottom: 8, right: 8 },
              bearing: 15,
              pitch: 10,
            },
            animation: { durationMs: 1000 },
          },
        ],
      ]);
    });

    test("a changed stop sends a new command; an equal one does not", async () => {
      const { result } = await renderCamera({ zoom: 3 });
      await result.rerender(tree({ zoom: 3 }));
      await settle();
      await result.rerender(tree({ zoom: 5, easing: "ease", duration: 200 }));
      await settle();

      expect(commands()).toEqual([
        ["updateCamera", { mode: JUMP, camera: { zoom: 3 } }],
        [
          "updateCamera",
          {
            mode: EASE,
            camera: { zoom: 5 },
            animation: { durationMs: 200, easing: EASE_IN_OUT },
          },
        ],
      ]);
    });

    test("a stop without camera fields sends nothing", async () => {
      await renderCamera({ duration: 300, easing: "ease" });

      expect(commands()).toEqual([]);
    });
  });

  describe("order", () => {
    test("commands wait for the map, then run in order: limits, initial view, stop", async () => {
      await renderCamera(
        {
          minZoom: 2,
          maxZoom: 12,
          maxBounds: [-10, -20, 30, 40],
          initialViewState: { center: [1, 2], zoom: 4 },
          zoom: 6,
          easing: "ease",
          duration: 100,
        },
        { ready: false },
      );

      expect(commands()).toEqual([]);

      await makeReady();

      expect(commands()).toEqual([
        [
          "setBounds",
          {
            minZoom: 2,
            maxZoom: 12,
            bounds: {
              southwest: { latitude: -20, longitude: -10 },
              northeast: { latitude: 40, longitude: 30 },
            },
          },
        ],
        [
          "updateCamera",
          {
            mode: JUMP,
            camera: { center: { latitude: 2, longitude: 1 }, zoom: 4 },
          },
        ],
        [
          "updateCamera",
          {
            mode: EASE,
            camera: { zoom: 6 },
            animation: { durationMs: 100, easing: EASE_IN_OUT },
          },
        ],
      ]);
    });

    test("limits send only what is set", async () => {
      await renderCamera({ maxZoom: 10 });

      expect(commands()).toEqual([["setBounds", { maxZoom: 10 }]]);
    });

    test("the initial view is applied once, even when it changes", async () => {
      const { result } = await renderCamera({
        initialViewState: { zoom: 4 },
      });
      await result.rerender(tree({ initialViewState: { zoom: 8 } }));
      await settle();

      expect(commands()).toEqual([
        ["updateCamera", { mode: JUMP, camera: { zoom: 4 } }],
      ]);
    });

    test("an initial view with bounds fits at once", async () => {
      await renderCamera({ initialViewState: { bounds: [0, 0, 10, 10] } });

      expect(commands()).toEqual([
        [
          "fitCameraToLatLngBounds",
          {
            southwest: { latitude: 0, longitude: 0 },
            northeast: { latitude: 10, longitude: 10 },
          },
          { mode: JUMP, fit: {} },
        ],
      ]);
    });

    test("in Strict Mode, the live map gets the initial view and the stop", async () => {
      await render(
        <StrictMode>
          {tree({ initialViewState: { zoom: 4 }, pitch: 20 })}
        </StrictMode>,
      );
      await settle();
      await makeReady();

      expect(commands()).toEqual([
        ["updateCamera", { mode: JUMP, camera: { zoom: 4 } }],
        ["updateCamera", { mode: JUMP, camera: { pitch: 20 } }],
      ]);
    });
  });

  describe("unsupported props", () => {
    async function renderCatching(props: Partial<CameraProps>) {
      let caught: unknown;
      const error = jest.spyOn(console, "error").mockImplementation(() => {});
      await render(
        <Boundary onError={(e) => (caught = e)}>{tree(props)}</Boundary>,
      );
      error.mockRestore();
      return caught;
    }

    test.each<[string, Partial<CameraProps>]>([
      ["trackUserLocation", { trackUserLocation: "default" }],
      ["onTrackUserLocationChange", { onTrackUserLocationChange: () => {} }],
    ])("an explicit %s throws", async (feature, props) => {
      const caught = await renderCatching(props);

      expect(caught).toBeInstanceOf(UnsupportedByEngineError);
      expect(caught).toMatchObject({ engine: "ffi", feature });
    });

    test("undefined ones do not", async () => {
      const caught = await renderCatching({
        trackUserLocation: undefined,
        onTrackUserLocationChange: undefined,
        zoom: 3,
      });

      expect(caught).toBeUndefined();
    });
  });

  describe("ref", () => {
    test("lists every method", async () => {
      const { ref } = await renderCamera({});

      expect(Object.keys(ref.current!).sort()).toEqual(
        ["easeTo", "fitBounds", "flyTo", "jumpTo", "setStop", "zoomTo"].sort(),
      );
    });

    test("each method sends its command and resolves", async () => {
      const { ref } = await renderCamera({});
      const camera = ref.current!;

      const results = [
        camera.jumpTo({ center: [1, 2], zoom: 3 }),
        camera.easeTo({ center: [3, 4] }),
        camera.flyTo({ center: [5, 6], zoom: 7 }),
        camera.fitBounds([0, 0, 10, 10], { padding: { top: 4 } }),
        camera.zoomTo(9),
        camera.setStop({ bearing: 45, easing: "linear", duration: 250 }),
      ] as unknown[];
      for (const result of results) {
        expect(result).toBeInstanceOf(Promise);
        await expect(result).resolves.toBeUndefined();
      }

      expect(commands()).toEqual([
        [
          "updateCamera",
          {
            mode: JUMP,
            camera: { center: { latitude: 2, longitude: 1 }, zoom: 3 },
          },
        ],
        [
          "updateCamera",
          {
            mode: EASE,
            camera: { center: { latitude: 4, longitude: 3 } },
            animation: { durationMs: 500, easing: EASE_IN_OUT },
          },
        ],
        [
          "updateCamera",
          {
            mode: FLY,
            camera: { center: { latitude: 6, longitude: 5 }, zoom: 7 },
            animation: { durationMs: 2000 },
          },
        ],
        [
          "fitCameraToLatLngBounds",
          {
            southwest: { latitude: 0, longitude: 0 },
            northeast: { latitude: 10, longitude: 10 },
          },
          {
            mode: FLY,
            fit: { padding: { top: 4, left: 0, bottom: 0, right: 0 } },
            animation: { durationMs: 2000 },
          },
        ],
        [
          "updateCamera",
          {
            mode: EASE,
            camera: { zoom: 9 },
            animation: { durationMs: 500, easing: EASE_IN_OUT },
          },
        ],
        [
          "updateCamera",
          {
            mode: EASE,
            camera: { bearing: 45 },
            animation: { durationMs: 250, easing: LINEAR },
          },
        ],
      ]);
    });

    test("a method called before the map is ready waits for it", async () => {
      const { ref } = await renderCamera({}, { ready: false });

      const result = ref.current!.jumpTo({ center: [0, 0], zoom: 5 });
      await settle();

      expect(commands()).toEqual([]);

      await makeReady();
      await expect(result).resolves.toBeUndefined();
      expect(commands()).toEqual([
        [
          "updateCamera",
          {
            mode: JUMP,
            camera: { center: { latitude: 0, longitude: 0 }, zoom: 5 },
          },
        ],
      ]);
    });
  });
});
