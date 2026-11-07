import type { CameraProps } from "../components/camera/Camera";
import type {
  EngineMapProps,
  EnginePropSupport,
} from "../components/map/engine/engineProps";

/**
 * What the FFI engine supports. A later slice that adds a feature adds its
 * capability here and changes its prop's entry.
 *
 * - Props name a capability, are cosmetic, or are not supported.
 * - Children are capabilities named like `"<Camera>"`. A `<Map>` child that is
 *   not listed throws when it renders under this engine.
 * - `MapRef` methods all reject for now.
 */
export const FFI_CAPABILITIES: readonly string[] = [
  "mapStyle",
  "gestures",
  "<Camera>",
];

const none = { support: "none" } as const;
const cosmetic = { support: "cosmetic" } as const;

export const FFI_MAP_PROPS: EngineMapProps = {
  mapStyle: { support: "capability", capability: "mapStyle" },

  // The map always shows its attribution, so only `true` is honoured.
  attribution: { support: "value", accepts: (value) => value === true },
  androidView: { support: "value", accepts: (value) => value === "surface" },

  // Ornaments the engine does not draw. Ignoring them changes how the map
  // looks, not how it behaves.
  attributionPosition: cosmetic,
  logo: cosmetic,
  logoPosition: cosmetic,
  compass: cosmetic,
  compassPosition: cosmetic,
  compassHiddenFacingNorth: cosmetic,
  scaleBar: cosmetic,
  scaleBarPosition: cosmetic,
  tintColor: cosmetic,

  light: none,
  contentInset: none,
  preferredFramesPerSecond: none,

  // The engine's gestures (see `gestures.ts`) honour these toggles both ways.
  dragPan: { support: "capability", capability: "gestures" },
  touchZoom: { support: "capability", capability: "gestures" },
  doubleTapZoom: { support: "capability", capability: "gestures" },
  touchRotate: { support: "capability", capability: "gestures" },
  // The engine has no such gestures. Turning one off is honoured; asking for
  // one with `true` throws, as any explicit request the engine cannot honour.
  doubleTapHoldZoom: { support: "value", accepts: (value) => value === false },
  touchPitch: { support: "value", accepts: (value) => value === false },

  onPress: none,
  onLongPress: none,
  onRegionWillChange: none,
  onRegionIsChanging: none,
  onRegionDidChange: none,
  onWillStartLoadingMap: none,
  onDidFinishLoadingMap: none,
  onDidFailLoadingMap: none,
  onWillStartRenderingFrame: none,
  onDidFinishRenderingFrame: none,
  onDidFinishRenderingFrameFully: none,
  onWillStartRenderingMap: none,
  onDidFinishRenderingMap: none,
  onDidFinishRenderingMapFully: none,
  onDidFinishLoadingStyle: none,
};

const camera = { support: "capability", capability: "<Camera>" } as const;

/**
 * How the FFI engine treats every `<Camera>` prop. The type lists every prop
 * but `ref` , so a new `<Camera>` prop does not compile until it is decided.
 *
 * - The stop, its animation, the initial view and the limits map to the binding's
 *   camera commands (see `camera.ts`).
 * - Tracking the user's location needs a location source the engine does not have
 *   yet.
 */
// Every key of every kind of `CameraProps`, such as `center` and `bounds`.
type KeyOfUnion<T> = T extends unknown ? keyof T : never;

export const FFI_CAMERA_PROPS: Readonly<
  Record<Exclude<KeyOfUnion<CameraProps>, "ref">, EnginePropSupport>
> = {
  // No view carries it; the camera renders nothing.
  testID: camera,
  center: camera,
  bounds: camera,
  zoom: camera,
  bearing: camera,
  pitch: camera,
  padding: camera,
  duration: camera,
  easing: camera,
  initialViewState: camera,
  minZoom: camera,
  maxZoom: camera,
  maxBounds: camera,
  trackUserLocation: none,
  onTrackUserLocationChange: none,
};
