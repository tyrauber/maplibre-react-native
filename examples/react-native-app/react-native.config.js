const path = require("node:path");

const pkg = require("../../package/package.json");
const nativeFfi = require("../shared/nativeFfi");

module.exports = {
  project: {
    ios: {
      automaticPodsInstallation: true,
    },
  },
  dependencies: {
    [pkg.name]: {
      root: path.join(__dirname, "..", "..", "package"),
      platforms: {
        // Codegen script incorrectly fails without this
        // So we explicitly specify the platforms with empty object
        ios: {},
        android: {},
      },
    },
    // Experimental: MLRN_FFI=1 links the MapLibre Native FFI React Native
    // package from a maplibre-native-ffi checkout (see shared/nativeFfi.js).
    // Stage its native files there first, with
    // bindings/typescript/react-native/scripts/stage.sh.
    ...(process.env.MLRN_FFI === "1" && {
      "@maplibre/native-ffi-react-native": {
        root: nativeFfi.reactNative,
        platforms: { ios: {}, android: null },
      },
    }),
  },
};
