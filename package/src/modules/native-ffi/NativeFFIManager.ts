import {
  MetalLayerLease,
  type MetalLayerLeaseSession,
} from "./MetalLayerLease";
import NativeFFIModule from "./NativeFFIModule";

/**
 * Experimental: the MapLibre Native C API, through the Hermes binding that
 * `@maplibre/native-ffi` provides.
 */
export const NativeFFIManager = {
  /**
   * Installs the C API bindings into this runtime, on the first call.
   *
   * Import `@maplibre/native-ffi/hermes` only after this returns true. It reads
   * the bindings when it loads, and throws if they are missing.
   *
   * @returns false when the app does not link the MapLibreReactNativeFFI pod
   */
  install(): boolean {
    return NativeFFIModule?.install() ?? false;
  },

  /**
   * The engine that the C library was built with, such as "maplibre-native".
   *
   * @returns undefined when the app does not link the MapLibreReactNativeFFI pod
   */
  implementation(): string | undefined {
    return NativeFFIModule?.implementation();
  },

  /**
   * Takes the layer of a `NativeFFISurface` `onLayer` event. Attach the render
   * session with the lease, and end the lease to close the session: it releases
   * the layer only after the close settles.
   *
   * @param layer - The event's `layer`
   */
  leaseLayer<Session extends MetalLayerLeaseSession = MetalLayerLeaseSession>(
    layer: string,
  ): MetalLayerLease<Session> {
    return new MetalLayerLease<Session>(layer, (released) =>
      NativeFFIModule?.releaseLayer(released),
    );
  },
};
