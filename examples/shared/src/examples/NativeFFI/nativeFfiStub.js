// Metro serves this for @maplibre/native-ffi/hermes when it finds no built
// maplibre-native-ffi checkout (see metro.shared.js).
throw new Error(
  "@maplibre/native-ffi/hermes is not available: run package/ios-ffi/stage.sh against a maplibre-native-ffi checkout (MLN_FFI_DIR).",
);
