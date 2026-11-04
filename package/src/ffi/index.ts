/**
 * The map engine that runs MapLibre Native through the
 * `@maplibre/native-ffi-react-native` package, at the entry point
 * `@maplibre/maplibre-react-native/ffi` for opt-in.
 *
 * The main entry never loads this module. Only this module may import the
 * `@maplibre/native-ffi-react-native` package.
 *
 * @example
 * ```tsx
 * import { MapEngineProvider } from "@maplibre/maplibre-react-native";
 * import { ffiEngine } from "@maplibre/maplibre-react-native/ffi";
 *
 * <MapEngineProvider engine={ffiEngine}>
 *   <App />
 * </MapEngineProvider>;
 * ```
 */
import { FFIMapView } from "./FFIMapView";
import { FFI_CAPABILITIES } from "./features";
import { createMapController } from "../components/map/engine/MapController";
import {
  defineMapEngine,
  type MapEngine,
} from "../components/map/engine/MapEngine";

export const ffiEngine: MapEngine = defineMapEngine({
  name: "ffi",
  MapView: FFIMapView,
  createController: () =>
    createMapController({ engine: "ffi", capabilities: FFI_CAPABILITIES }),
});
