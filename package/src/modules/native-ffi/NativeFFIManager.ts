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
};
