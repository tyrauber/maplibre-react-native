const {
  withBabelShared,
} = require("@maplibre-react-native/examples/babel.shared");

module.exports = withBabelShared("module:@react-native/babel-preset", {
  // Experimental: compiles the MapLibre Native FFI binding (see
  // shared/nativeFfi.js).
  nativeFfi: __dirname,
});
