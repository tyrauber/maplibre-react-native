import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  /**
   * Whether the MapLibre Native C API bindings are installed in this runtime.
   */
  install(): boolean;
}

// Present only when the app links the MapLibreReactNativeFFI pod.
export default TurboModuleRegistry.get<Spec>("MLRNFFIModule");
