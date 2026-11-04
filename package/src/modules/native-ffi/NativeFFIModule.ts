import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  /**
   * Whether the MapLibre Native C API bindings are installed in this runtime.
   */
  install(): boolean;

  /**
   * The engine that the C library was built with, such as "maplibre-native".
   */
  implementation(): string;

  /**
   * Lets go of a layer that an `onLayer` event of `MLRNFFISurface` retained. An
   * address that native code does not hold changes nothing.
   */
  releaseLayer(layer: string): void;
}

// Present only when the app links the MapLibreReactNativeFFI pod.
export default TurboModuleRegistry.get<Spec>("MLRNFFIModule");
