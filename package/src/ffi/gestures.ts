// Adapted from maplibre/maplibre-native-ffi examples/react-native/src/gestures.ts
// at 616f9175. BSD-2-Clause: see LICENSE-maplibre-native-ffi in this folder.
// The gesture math is unchanged; this copy adds the map's gesture toggles and
// sends each delta through a callback instead of to a map.

// Gestures. A drag pans, two fingers pinch, rotate, and pan, and a double tap
// zooms in.

import {
  type GestureResponderEvent,
  PanResponder,
  type PanResponderInstance,
} from "react-native";

import { type CameraDelta, nativeFfi, type ScreenPoint } from "./nativeFfi";

/** Which gestures are on. Each is on unless its `<Map>` prop is `false`. */
export interface GestureToggles {
  dragPan: boolean;
  touchZoom: boolean;
  touchRotate: boolean;
  doubleTapZoom: boolean;
}

const doubleTapMs = 300;
const tapSlop = 10;

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
  let lastTap: { point: ScreenPoint; time: number } | undefined;

  const touches = (event: GestureResponderEvent) =>
    new Map(
      event.nativeEvent.touches.map((touch): [string, ScreenPoint] => [
        touch.identifier,
        { x: touch.locationX, y: touch.locationY },
      ]),
    );

  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,

    onPanResponderGrant: (event) => {
      previous = touches(event);
      start = previous.values().next().value;
      moved = false;
      apply({ gesturePhase: GesturePhase.begin });
    },

    onPanResponderMove: (event) => {
      const current = touches(event);
      const pairs = [...current]
        .filter(([id]) => previous.has(id))
        .map(([id, point]) => [previous.get(id)!, point] as const);
      previous = current;
      const [first, second] = pairs;
      if (first === undefined) return;
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
      const scale =
        Math.hypot(spanAfter.x, spanAfter.y) /
        Math.hypot(spanBefore.x, spanBefore.y);
      const turn =
        (Math.atan2(spanAfter.y, spanAfter.x) -
          Math.atan2(spanBefore.y, spanBefore.x)) *
        (180 / Math.PI);
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
      if (on.touchZoom) {
        delta.scale = Number.isFinite(scale) && scale > 0 ? scale : 1;
      }
      if (on.touchRotate) delta.bearing = -wrapDegrees(turn);
      apply(delta);
    },

    onPanResponderRelease: (event) => {
      apply({ gesturePhase: GesturePhase.end });
      const point = {
        x: event.nativeEvent.locationX,
        y: event.nativeEvent.locationY,
      };
      if (moved || !on.doubleTapZoom) return;
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
