// Adapted from maplibre/maplibre-native-ffi examples/react-native/src/gestures.ts
// at 1feb892d (v0.202611.0). BSD-2-Clause: see LICENSE-maplibre-native-ffi in
// this folder. The gesture math is unchanged; this copy adds the map's gesture
// toggles and sends each delta through a callback instead of to a map.

// Gestures. A drag pans, two fingers pinch, rotate, and pan, and a double tap
// zooms in. The map keeps moving after a drag or a pinch, until a touch stops
// it.

import {
  type GestureResponderEvent,
  PanResponder,
  type PanResponderGestureState,
  type PanResponderInstance,
} from "react-native";

import {
  type CameraDelta,
  type GestureMomentum,
  nativeFfi,
  type ScreenPoint,
} from "./nativeFfi";

/** Which gestures are on. Each is on unless its `<Map>` prop is `false`. */
export interface GestureToggles {
  dragPan: boolean;
  touchZoom: boolean;
  touchRotate: boolean;
  doubleTapZoom: boolean;
}

const doubleTapMs = 300;
const tapSlop = 10;
// PanResponder keeps the last move's velocity while a touch rests, so a release
// this long after the last move starts no momentum.
const releaseWindowMs = 100;

// How far a pinch has zoomed and turned since the gesture began.
interface PinchSample {
  readonly time: number;
  readonly zoom: number;
  readonly bearing: number;
  readonly anchor: ScreenPoint;
}

export interface MapGestures {
  readonly panHandlers: PanResponderInstance["panHandlers"];
  /** Takes the latest toggles, which apply from the next event. */
  setToggles(toggles: GestureToggles): void;
}

/**
 * The map's touch handling. `apply` moves the camera by a delta right away.
 * Every gesture is on until `setToggles` says otherwise.
 */
export function mapGestures(apply: (delta: CameraDelta) => void): MapGestures {
  const { GesturePhase } = nativeFfi;
  let on: GestureToggles = {
    dragPan: true,
    touchZoom: true,
    touchRotate: true,
    doubleTapZoom: true,
  };
  // The touches at the last event, by identifier, in the view's coordinates.
  let previous = new Map<string, ScreenPoint>();
  let start: ScreenPoint | undefined;
  let moved = false;
  let lastMove = 0;
  // The pinch's recent samples, oldest first.
  let pinch: PinchSample[] = [];
  let lastTap: { point: ScreenPoint; time: number } | undefined;

  const touches = (event: GestureResponderEvent) =>
    new Map(
      event.nativeEvent.touches.map((touch): [string, ScreenPoint] => [
        touch.identifier,
        { x: touch.locationX, y: touch.locationY },
      ]),
    );

  // PanResponder reports how fast the touches moved in pixels per
  // millisecond, and the pinch's rates come from its samples. Each part moves
  // only while its gesture is on.
  const momentum = (
    time: number,
    gesture: PanResponderGestureState,
  ): GestureMomentum => {
    if (!(time - lastMove <= releaseWindowMs)) return {};
    const result: GestureMomentum = {};
    if (on.dragPan) {
      result.pan = {
        velocity: { x: gesture.vx * 1000, y: gesture.vy * 1000 },
      };
    }
    const first = pinch[0];
    const last = pinch.at(-1);
    if (
      first === undefined ||
      last === undefined ||
      last.time === first.time ||
      time - last.time > releaseWindowMs
    ) {
      return result;
    }
    const seconds = (last.time - first.time) / 1000;
    if (on.touchZoom) {
      result.zoom = {
        velocity: (last.zoom - first.zoom) / seconds,
        anchor: last.anchor,
      };
    }
    if (on.touchRotate) {
      result.bearing = {
        velocity: (last.bearing - first.bearing) / seconds,
        anchor: last.anchor,
      };
    }
    return result;
  };

  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,

    // Beginning a gesture also stops the last one's momentum.
    onPanResponderGrant: (event) => {
      previous = touches(event);
      start = previous.values().next().value;
      moved = false;
      pinch = [];
      apply({ gesturePhase: GesturePhase.begin });
    },

    onPanResponderMove: (event) => {
      const time = event.nativeEvent.timestamp;
      const current = touches(event);
      const pairs = [...current]
        .filter(([id]) => previous.has(id))
        .map(([id, point]) => [previous.get(id)!, point] as const);
      previous = current;
      const [first, second] = pairs;
      if (first === undefined) return;
      lastMove = time;
      const [before, after] = first;
      if (start !== undefined && distance(start, after) > tapSlop) moved = true;

      if (second === undefined) {
        if (!on.dragPan) return;
        apply({
          offset: { x: after.x - before.x, y: after.y - before.y },
          gesturePhase: GesturePhase.update,
        });
        return;
      }
      // The span between the touches scales and turns about their midpoint,
      // which moves with them.
      moved = true;
      if (!on.dragPan && !on.touchZoom && !on.touchRotate) return;
      const [otherBefore, otherAfter] = second;
      const midBefore = midpoint(before, otherBefore);
      const midAfter = midpoint(after, otherAfter);
      const spanBefore = {
        x: otherBefore.x - before.x,
        y: otherBefore.y - before.y,
      };
      const spanAfter = {
        x: otherAfter.x - after.x,
        y: otherAfter.y - after.y,
      };
      const ratio =
        Math.hypot(spanAfter.x, spanAfter.y) /
        Math.hypot(spanBefore.x, spanBefore.y);
      const scale = Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
      const bearing = -wrapDegrees(
        (Math.atan2(spanAfter.y, spanAfter.x) -
          Math.atan2(spanBefore.y, spanBefore.x)) *
          (180 / Math.PI),
      );
      const delta: CameraDelta = {
        anchor: midAfter,
        gesturePhase: GesturePhase.update,
      };
      if (on.dragPan) {
        delta.offset = {
          x: midAfter.x - midBefore.x,
          y: midAfter.y - midBefore.y,
        };
      }
      if (on.touchZoom) delta.scale = scale;
      if (on.touchRotate) delta.bearing = bearing;
      apply(delta);
      const last = pinch.at(-1);
      pinch = pinch.filter((sample) => time - sample.time <= releaseWindowMs);
      pinch.push({
        time,
        zoom: (last?.zoom ?? 0) + Math.log2(scale),
        bearing: (last?.bearing ?? 0) + bearing,
        anchor: midAfter,
      });
    },

    onPanResponderRelease: (event, gesture) => {
      if (moved) {
        apply({
          momentum: momentum(event.nativeEvent.timestamp, gesture),
          gesturePhase: GesturePhase.end,
        });
        return;
      }
      apply({ gesturePhase: GesturePhase.end });
      const point = {
        x: event.nativeEvent.locationX,
        y: event.nativeEvent.locationY,
      };
      if (!on.doubleTapZoom) return;
      const now = Date.now();
      if (
        lastTap !== undefined &&
        now - lastTap.time < doubleTapMs &&
        distance(lastTap.point, point) < tapSlop * 3
      ) {
        lastTap = undefined;
        apply({ scale: 2, anchor: point, animation: { durationMs: 300 } });
      } else {
        lastTap = { point, time: now };
      }
    },

    onPanResponderTerminate: () => {
      apply({ gesturePhase: GesturePhase.end });
    },
  });

  return {
    panHandlers: responder.panHandlers,
    setToggles: (toggles) => {
      on = toggles;
    },
  };
}

function midpoint(a: ScreenPoint, b: ScreenPoint): ScreenPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function distance(a: ScreenPoint, b: ScreenPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** An angle in degrees, wrapped to [-180, 180). */
function wrapDegrees(degrees: number): number {
  return ((((degrees + 180) % 360) + 360) % 360) - 180;
}
