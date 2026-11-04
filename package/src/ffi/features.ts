import type { EngineMapProps } from "../components/map/engine/engineProps";

/**
 * What the FFI engine supports. A later slice that adds a feature adds its
 * capability here and changes its prop's entry.
 *
 * - Props name a capability, are cosmetic, or are not supported.
 * - Children are capabilities named like `"<Camera>"`. A `<Map>` child that is
 *   not listed throws when it renders under this engine.
 * - `MapRef` methods all reject for now.
 */
export const FFI_CAPABILITIES: readonly string[] = ["mapStyle"];

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

  dragPan: none,
  touchZoom: none,
  doubleTapZoom: none,
  doubleTapHoldZoom: none,
  touchRotate: none,
  touchPitch: none,

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
