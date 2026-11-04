import {
  MetalLayerLease,
  type MetalLayerLeaseSession,
} from "./MetalLayerLease";
import NativeFFIModule from "./NativeFFIModule";
import type { NativeFFISurfaceLayerEvent } from "./NativeFFISurface";

/**
 * Experimental: the MapLibre Native C API, through the Hermes binding that
 * `@maplibre/native-ffi` provides.
 */
export const NativeFFIManager = {
  /**
   * Whether the C API bindings are installed in this runtime. Native code
   * installs them when it creates the module, which happens when this package
   * loads, so this call only reports it.
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
   * Takes a new hold on the layer of the surface that sent a `NativeFFISurface`
   * `onLayer` event. Attach the render session with the lease, and end the lease
   * to close the session: it releases its hold only after the close settles.
   * Every call takes its own hold.
   *
   * @param event - The `onLayer` event, or its `surface`
   * @returns undefined when the surface is no longer mounted, or the app does not link the MapLibreReactNativeFFI pod
   */
  leaseLayer<Session extends MetalLayerLeaseSession = MetalLayerLeaseSession>(
    event: Pick<NativeFFISurfaceLayerEvent, "surface">,
  ): MetalLayerLease<Session> | undefined {
    const native = NativeFFIModule;
    const leased = native?.leaseLayer(event.surface);
    if (!native || !leased) {
      return undefined;
    }
    return new MetalLayerLease<Session>(leased.layer, leased.lease, (token) =>
      native.releaseLayer(token),
    );
  },
};
