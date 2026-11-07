const path = require("node:path");

const pkg = require("../../package/package.json");

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
    // Experimental: @maplibre/native-ffi-react-native carries about 240 MB
    // of native libraries, so the app links it only with MLRN_FFI=1.
    ...(process.env.MLRN_FFI !== "1" && {
      "@maplibre/native-ffi-react-native": {
        platforms: { ios: null, android: null },
      },
    }),
  },
};
