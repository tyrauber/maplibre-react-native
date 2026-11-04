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
   * Takes a new hold on the CAMetalLayer of a mounted `MLRNFFISurface` , by the
   * surface token that its `onLayer` event carries. The hold keeps the layer
   * alive until `releaseLayer` with its lease token, even after the view is gone.
   * Tokens are in decimal, and native code never reuses one.
   *
   * @returns the hold's lease token and the layer's address, or null when the surface is not mounted
   */
  leaseLayer(surface: string): { lease: string; layer: string } | null;

  /**
   * Lets go of the one hold that `leaseLayer` took under the lease token. A token
   * that native code does not hold changes nothing.
   */
  releaseLayer(lease: string): void;
}

// Present only when the app links the MapLibreReactNativeFFI pod.
export default TurboModuleRegistry.get<Spec>("MLRNFFIModule");
