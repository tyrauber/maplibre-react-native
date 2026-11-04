// Metro serves this for @maplibre/native-ffi-react-native when it finds no
// maplibre-native-ffi checkout (see nativeFfi.js).
throw new Error(
  "@maplibre/native-ffi-react-native is not available: check out maplibre-native-ffi next to this repository, or set MLN_FFI_DIR.",
);
