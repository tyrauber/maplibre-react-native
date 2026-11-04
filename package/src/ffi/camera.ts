import {
  type AnimationOptions,
  type BoundOptions,
  type EdgeInsets,
  type LatLngBounds,
  type MapHandle,
  nativeFfi,
  type UnitBezier,
} from "./nativeFfi";
import type {
  CameraAnimationOptions,
  CameraOptions,
} from "../components/camera/Camera";
import type { LngLat } from "../types/LngLat";
import type { LngLatBounds } from "../types/LngLatBounds";
import type { ViewPadding } from "../types/ViewPadding";

/**
 * A camera stop with every field optional. Each kind of camera stop fits it.
 */
export type CameraFields = CameraOptions &
  CameraAnimationOptions & { center?: LngLat; bounds?: LngLatBounds };

/** A command for the map, which the map's controller runs once it is ready. */
export type MapCommand = (map: MapHandle) => Promise<unknown>;

// The curve of the native engine's "ease" on iOS, which is Core Animation's
// ease-in-ease-out.
const EASE_IN_OUT: UnitBezier = { x1: 0.42, y1: 0, x2: 0.58, y2: 1 };
const LINEAR: UnitBezier = { x1: 0, y1: 0, x2: 1, y2: 1 };

function latLng([longitude, latitude]: LngLat) {
  return { latitude, longitude };
}

function latLngBounds([west, south, east, north]: LngLatBounds): LatLngBounds {
  return {
    southwest: { latitude: south, longitude: west },
    northeast: { latitude: north, longitude: east },
  };
}

function edgeInsets(padding: ViewPadding): EdgeInsets {
  return {
    top: padding.top ?? 0,
    left: padding.left ?? 0,
    bottom: padding.bottom ?? 0,
    right: padding.right ?? 0,
  };
}

/**
 * How a stop moves, as on the native engine: no easing jumps; `linear` and
 * `ease` animate over `duration` , which defaults to none; `fly` flies, and
 * picks its own duration without one.
 */
function motion({ easing, duration }: CameraFields): {
  mode: number;
  animation?: AnimationOptions;
} {
  const { CameraUpdateMode } = nativeFfi;
  switch (easing) {
    case "linear":
      return {
        mode: CameraUpdateMode.ease,
        animation: { durationMs: duration ?? 0, easing: LINEAR },
      };
    case "ease":
      return {
        mode: CameraUpdateMode.ease,
        animation: { durationMs: duration ?? 0, easing: EASE_IN_OUT },
      };
    case "fly":
      return {
        mode: CameraUpdateMode.fly,
        animation:
          duration !== undefined && duration > 0
            ? { durationMs: duration }
            : {},
      };
    default:
      return { mode: CameraUpdateMode.jump };
  }
}

/** Drops the fields that are undefined. */
function defined<T extends object>(object: T): T {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  ) as T;
}

/**
 * The command that moves the camera to a stop, or `undefined` when the stop
 * names no camera field. Bounds fit the camera and, as on the native engine,
 * take the place of a center and a zoom.
 */
export function stopCommand(stop: CameraFields): MapCommand | undefined {
  const { center, bounds, zoom, bearing, pitch, padding } = stop;
  const { mode, animation } = motion(stop);
  const insets = padding && edgeInsets(padding);

  if (bounds) {
    const update = defined({
      mode,
      fit: defined({ padding: insets, bearing, pitch }),
      animation,
    });
    return (map) => map.fitCameraToLatLngBounds(latLngBounds(bounds), update);
  }
  if ([center, zoom, bearing, pitch, padding].every((v) => v === undefined)) {
    return undefined;
  }
  const update = defined({
    mode,
    camera: defined({
      center: center && latLng(center),
      zoom,
      bearing,
      pitch,
      padding: insets,
    }),
    animation,
  });
  return (map) => map.updateCamera(update);
}

/**
 * The command that sets the camera's limits, or `undefined` when none is set. A
 * limit that is later unset stays, as on the native engine.
 */
export function limitsCommand(limits: {
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: LngLatBounds;
}): MapCommand | undefined {
  const options: BoundOptions = defined({
    minZoom: limits.minZoom,
    maxZoom: limits.maxZoom,
    bounds: limits.maxBounds && latLngBounds(limits.maxBounds),
  });
  if (Object.keys(options).length === 0) return undefined;
  return (map) => map.setBounds(options);
}
