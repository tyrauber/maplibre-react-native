import {
  Map,
  type MapProps,
  UnsupportedByEngineError,
} from "@maplibre/maplibre-react-native";
import { act, fireEvent, render } from "@testing-library/react-native";
import { Component, type ReactNode } from "react";
import {
  type GestureResponderEvent,
  PanResponder,
  type PanResponderCallbacks,
} from "react-native";

import { mockNativeFfi } from "../__mocks__/NativeFfi.mock";

import { ffiEngine } from "@/ffi";

const MAP_STYLE = "https://demotiles.maplibre.org/style.json";
const BEGIN = 1;
const UPDATE = 2;
const END = 3;

let config: PanResponderCallbacks | undefined;
const create = PanResponder.create.bind(PanResponder);
let createSpy: jest.SpyInstance;

beforeEach(() => {
  mockNativeFfi.reset();
  config = undefined;
  // The map's responder: its callbacks are called as React Native would.
  createSpy = jest
    .spyOn(PanResponder, "create")
    .mockImplementation((callbacks) => {
      config = callbacks;
      return create(callbacks);
    });
});

afterEach(() => createSpy.mockRestore());

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function tree(props: Partial<MapProps> = {}) {
  return (
    <Map mapStyle={MAP_STYLE} testID="map" engine={ffiEngine} {...props} />
  );
}

/** Renders a map with a surface, and makes it ready unless told not to. */
async function renderMap(props: Partial<MapProps> = {}, { ready = true } = {}) {
  const result = await render(tree(props));
  const view = result.getByTestId("map-ffi-surface");
  await fireEvent(view, "layout", {
    nativeEvent: { layout: { x: 0, y: 0, width: 300, height: 300 } },
  });
  await fireEvent(view, "surfaceAvailable", { nativeEvent: { surface: 1 } });
  await settle();
  if (ready) {
    await act(async () => mockNativeFfi.emit("mapStyleLoaded"));
    await settle();
  }
  return result;
}

type Touch = [id: number, x: number, y: number];

// The time of the last event, in milliseconds. Each event comes 10 ms after
// the one before it, as React Native's timestamps would.
let clock = 0;

function event(touches: Touch[], at?: [number, number], timestamp = clock) {
  const [first] = touches;
  return {
    nativeEvent: {
      touches: touches.map(([identifier, locationX, locationY]) => ({
        identifier,
        locationX,
        locationY,
      })),
      locationX: at?.[0] ?? first?.[1] ?? 0,
      locationY: at?.[1] ?? first?.[2] ?? 0,
      timestamp,
    },
  } as unknown as GestureResponderEvent;
}

const state = {} as never;

interface Release {
  /** How fast the touches moved at release, in pixels per millisecond. */
  vx?: number;
  vy?: number;
  /** How long the touches rest after the last move before they lift. */
  restMs?: number;
}

/**
 * Runs one gesture: the first touches start it, each later set moves it, and
 * the touches lift as `release` says.
 */
function fling({ vx = 0, vy = 0, restMs = 10 }: Release, ...steps: Touch[][]) {
  const [first, ...moves] = steps;
  config!.onPanResponderGrant!(event(first!, undefined, (clock += 10)), state);
  for (const touches of moves) {
    config!.onPanResponderMove!(
      event(touches, undefined, (clock += 10)),
      state,
    );
  }
  const last = steps[steps.length - 1]!;
  config!.onPanResponderRelease!(
    event([], [last[0]![1], last[0]![2]], (clock += restMs)),
    { vx, vy } as never,
  );
}

function gesture(...steps: Touch[][]) {
  fling({}, ...steps);
}

function tap(x: number, y: number) {
  gesture([[1, x, y]]);
}

const deltas = () =>
  mockNativeFfi.cameraCommands
    .filter(([name]) => name === "applyCameraDelta")
    .map(([, delta]) => delta as Record<string, unknown>);

const moves = () => deltas().filter((delta) => delta.gesturePhase === UPDATE);

const ends = () => deltas().filter((delta) => delta.gesturePhase === END);

/** Two fingers that spread from 100 to 200 to 400 pixels apart. */
const PINCH: Touch[][] = [
  [
    [1, 100, 150],
    [2, 200, 150],
  ],
  [
    [1, 50, 150],
    [2, 250, 150],
  ],
  [
    [1, -50, 150],
    [2, 350, 150],
  ],
];

describe("FFI map gestures", () => {
  test("a drag pans by the finger's offset", async () => {
    await renderMap();

    gesture([[1, 10, 10]], [[1, 30, 15]], [[1, 50, 25]]);

    expect(deltas()).toEqual([
      { gesturePhase: BEGIN },
      { offset: { x: 20, y: 5 }, gesturePhase: UPDATE },
      { offset: { x: 20, y: 10 }, gesturePhase: UPDATE },
      {
        momentum: { pan: { velocity: { x: 0, y: 0 } } },
        gesturePhase: END,
      },
    ]);
  });

  test("a pinch zooms about the fingers' midpoint", async () => {
    await renderMap();

    gesture(
      [
        [1, 100, 150],
        [2, 200, 150],
      ],
      [
        [1, 50, 150],
        [2, 250, 150],
      ],
    );

    expect(moves()).toEqual([
      expect.objectContaining({
        offset: { x: 0, y: 0 },
        scale: 2,
        anchor: { x: 150, y: 150 },
      }),
    ]);
  });

  test("two fingers turning rotate the map", async () => {
    await renderMap();

    gesture(
      [
        [1, 100, 150],
        [2, 200, 150],
      ],
      [
        [1, 150, 100],
        [2, 150, 200],
      ],
    );

    const [move] = moves();
    expect(move!.scale).toBeCloseTo(1);
    expect(move!.bearing).toBeCloseTo(-90);
  });

  test("a double tap zooms in at the tap", async () => {
    await renderMap();

    tap(60, 80);
    tap(62, 81);

    expect(deltas()).toContainEqual({
      scale: 2,
      anchor: { x: 62, y: 81 },
      animation: { durationMs: 300 },
    });
  });

  describe("momentum", () => {
    test("a fling keeps the map moving at the release's speed", async () => {
      await renderMap();

      fling({ vx: 0.5, vy: -0.25 }, [[1, 10, 10]], [[1, 30, 15]]);

      expect(ends()).toEqual([
        {
          momentum: { pan: { velocity: { x: 500, y: -250 } } },
          gesturePhase: END,
        },
      ]);
    });

    test("a release after the touch rests starts no momentum", async () => {
      await renderMap();

      fling({ vx: 0.5, vy: 0.5, restMs: 150 }, [[1, 10, 10]], [[1, 30, 15]]);

      expect(ends()).toEqual([{ momentum: {}, gesturePhase: END }]);
    });

    test("a pinch keeps zooming at its rate, about its last midpoint", async () => {
      await renderMap();

      fling({}, ...PINCH);

      // The span doubles from the first move to the second, 10 ms later.
      const [end] = ends();
      const momentum = end!.momentum as Record<string, Record<string, unknown>>;
      expect(momentum.zoom).toEqual({
        velocity: expect.closeTo(100),
        anchor: { x: 150, y: 150 },
      });
      expect(momentum.bearing).toEqual({
        velocity: expect.closeTo(0),
        anchor: { x: 150, y: 150 },
      });
    });

    test("a pinch released after it rests starts no momentum", async () => {
      await renderMap();

      fling({ restMs: 150 }, ...PINCH);

      expect(ends()).toEqual([{ momentum: {}, gesturePhase: END }]);
    });

    test("a tap ends without momentum", async () => {
      await renderMap();

      tap(60, 80);

      expect(ends()).toEqual([{ gesturePhase: END }]);
    });

    test("a touch stops the glide", async () => {
      await renderMap();

      fling({ vx: 1 }, [[1, 10, 10]], [[1, 30, 15]]);
      fling({}, [[1, 40, 40]]);

      expect(
        deltas().filter((delta) => delta.gesturePhase === BEGIN),
      ).toHaveLength(2);
    });

    test.each([
      ["dragPan", "pan"],
      ["touchZoom", "zoom"],
      ["touchRotate", "bearing"],
    ])("%s={false} drops the %s momentum", async (prop, part) => {
      await renderMap({ [prop]: false });

      fling({ vx: 1, vy: 1 }, ...PINCH);

      const [end] = ends();
      expect(end!.momentum).not.toHaveProperty(part);
      expect(Object.keys(end!.momentum as object)).toHaveLength(2);
    });
  });

  describe("toggles", () => {
    test("dragPan={false} stops a drag, and the pan of two fingers", async () => {
      await renderMap({ dragPan: false });

      gesture([[1, 10, 10]], [[1, 30, 15]]);
      gesture(
        [
          [1, 100, 150],
          [2, 200, 150],
        ],
        [
          [1, 60, 160],
          [2, 260, 160],
        ],
      );

      const updates = moves();
      expect(updates).toHaveLength(1);
      expect(updates[0]).not.toHaveProperty("offset");
      expect(updates[0]!.scale).toBeCloseTo(2);
    });

    test("touchZoom={false} stops a pinch from zooming", async () => {
      await renderMap({ touchZoom: false });

      gesture(
        [
          [1, 100, 150],
          [2, 200, 150],
        ],
        [
          [1, 50, 150],
          [2, 250, 150],
        ],
      );

      expect(moves()).toHaveLength(1);
      expect(moves()[0]).not.toHaveProperty("scale");
    });

    test("touchRotate={false} stops two fingers from rotating", async () => {
      await renderMap({ touchRotate: false });

      gesture(
        [
          [1, 100, 150],
          [2, 200, 150],
        ],
        [
          [1, 150, 100],
          [2, 150, 200],
        ],
      );

      expect(moves()).toHaveLength(1);
      expect(moves()[0]).not.toHaveProperty("bearing");
    });

    test("doubleTapZoom={false} stops a double tap", async () => {
      await renderMap({ doubleTapZoom: false });

      tap(60, 80);
      tap(62, 81);

      expect(deltas().filter((delta) => "scale" in delta)).toEqual([]);
    });

    test("a toggle change applies to the next gesture", async () => {
      const result = await renderMap({ dragPan: false });
      await result.rerender(tree({ dragPan: true }));

      gesture([[1, 10, 10]], [[1, 30, 15]]);

      expect(moves()).toEqual([
        { offset: { x: 20, y: 5 }, gesturePhase: UPDATE },
      ]);
    });
  });

  describe("toggles without a gesture", () => {
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

    async function caughtFor(props: Partial<MapProps>) {
      let caught: unknown;
      const error = jest.spyOn(console, "error").mockImplementation(() => {});
      await render(
        <Boundary onError={(e) => (caught = e)}>{tree(props)}</Boundary>,
      );
      error.mockRestore();
      return caught;
    }

    test.each(["touchPitch", "doubleTapHoldZoom"])(
      "%s={false} is accepted, and true throws",
      async (prop) => {
        expect(await caughtFor({ [prop]: false })).toBeUndefined();
        expect(await caughtFor({ [prop]: undefined })).toBeUndefined();

        const caught = await caughtFor({ [prop]: true });
        expect(caught).toBeInstanceOf(UnsupportedByEngineError);
        expect(caught).toMatchObject({ engine: "ffi", feature: prop });
      },
    );
  });

  describe("when gestures do nothing", () => {
    test("before the map is ready", async () => {
      await renderMap({}, { ready: false });

      gesture([[1, 10, 10]], [[1, 30, 15]]);
      tap(5, 5);
      tap(5, 5);

      expect(deltas()).toEqual([]);
    });

    test("after the surface is lost", async () => {
      const result = await renderMap();
      await fireEvent(result.getByTestId("map-ffi-surface"), "surfaceLost", {
        nativeEvent: { surface: 1 },
      });
      await settle();

      gesture([[1, 10, 10]], [[1, 30, 15]]);

      expect(deltas()).toEqual([]);
    });

    test("after the map unmounts", async () => {
      const result = await renderMap();
      await result.unmount();
      await settle();

      gesture([[1, 10, 10]], [[1, 30, 15]]);

      expect(deltas()).toEqual([]);
    });
  });
});
