/* global __dirname */
const path = require("node:path");
const {
  getConfig: getBobConfig,
} = require("react-native-builder-bob/babel-config");

const nativeFfi = require("./nativeFfi");
const pkg = require("../../package/package.json");

const root = path.resolve(__dirname, "..", "..");

// The app compiles the MapLibre Native FFI binding's TypeScript sources (see
// nativeFfi.js). React Native's preset strips Flow types from every file, which
// rejects the binding's `declare` class fields unless that same plugin allows
// them, and it leaves out static class blocks. The npm package will ship
// compiled JavaScript, which needs neither.
function nativeFfiOverrides(preset) {
  if (!nativeFfi.available || preset !== "module:@react-native/babel-preset") {
    return [];
  }
  const sources = path.join(nativeFfi.binding, "src") + path.sep;
  const reactNativePreset = require.resolve("@react-native/babel-preset", {
    paths: [process.cwd()],
  });
  return [
    {
      test: (file) => file !== undefined && file.startsWith(sources),
      plugins: [
        [
          require.resolve("@babel/plugin-transform-flow-strip-types", {
            paths: [reactNativePreset],
          }),
          { allowDeclareFields: true },
        ],
        require.resolve("@babel/plugin-transform-class-static-block", {
          paths: [require.resolve("react-native-builder-bob/babel-config")],
        }),
      ],
    },
  ];
}

function withBabelShared(preset) {
  const config = getBobConfig(
    {
      presets: [preset],
      plugins: [
        "@babel/plugin-transform-export-namespace-from",
        [
          "module-resolver",
          {
            extensions: [".js", ".ts", ".json", ".jsx", ".tsx"],
            alias: {
              "@": path.resolve(__dirname, "src"),
            },
          },
        ],
        "react-native-worklets/plugin",
      ],
    },
    { root, pkg },
  );
  return {
    ...config,
    overrides: [...(config.overrides ?? []), ...nativeFfiOverrides(preset)],
  };
}
exports.withBabelShared = withBabelShared;
