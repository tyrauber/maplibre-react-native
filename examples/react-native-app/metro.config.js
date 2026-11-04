const {
  withMetroShared,
} = require("@maplibre-react-native/examples/metro.shared");
const { getDefaultConfig } = require("@react-native/metro-config");

const project = __dirname;

module.exports = withMetroShared(getDefaultConfig(project), {
  project,
  // Experimental: resolves @maplibre/native-ffi-react-native (see
  // shared/nativeFfi.js).
  nativeFfi: true,
});
