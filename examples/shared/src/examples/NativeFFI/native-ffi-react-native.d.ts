// @maplibre/native-ffi-react-native is not a dependency: Metro resolves it to a
// maplibre-native-ffi checkout (see nativeFfi.js), which CI does not have. So
// the type checker sees it as untyped until the package is on npm.
declare module "@maplibre/native-ffi-react-native";
