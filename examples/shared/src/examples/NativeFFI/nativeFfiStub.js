// Metro serves this for @maplibre/native-ffi-react-native to an app that does
// not install it, such as the Expo app (see metro.shared.js). It must not
// throw: Metro reports a module that throws while it loads as a fatal error.
exports.unavailable =
  "the app does not install @maplibre/native-ffi-react-native";
