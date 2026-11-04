// Metro serves this for @maplibre/native-ffi-react-native to an app that does
// not opt in, or when it finds no maplibre-native-ffi checkout (see
// nativeFfi.js). It must not throw: Metro reports a module that throws while
// it loads as a fatal error.
exports.unavailable =
  "the bundle has no @maplibre/native-ffi-react-native: check out maplibre-native-ffi next to this repository, or set MLN_FFI_DIR";
