/* global __dirname */
const path = require("node:path");
const {
  getConfig: getBobConfig,
} = require("react-native-builder-bob/babel-config");

const nativeFfi = require("./nativeFfi");
const pkg = require("../../package/package.json");

const root = path.resolve(__dirname, "..", "..");

// An app that opts in compiles the MapLibre Native FFI binding's TypeScript
// sources (see nativeFfi.js). React Native's preset strips Flow types from
// every file, which rejects the binding's `declare` class fields unless that
// same plugin allows them, and it leaves out static class blocks. The npm
// package will ship compiled JavaScript, which needs neither.
function nativeFfiOverrides(project) {
  if (!nativeFfi.available) {
    return [];
  }
  const sources = path.join(nativeFfi.binding, "src") + path.sep;
  const reactNativePreset = require.resolve("@react-native/babel-preset", {
    paths: [project],
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

/**
 * @param {string} preset
 * @param {object} [options]
 * @param {string} [options.nativeFfi] - The app's folder, when it uses
 *   @maplibre/native-ffi-react-native with React Native's preset
 */
function withBabelShared(preset, { nativeFfi: project } = {}) {
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
    overrides: [
      ...(config.overrides ?? []),
      ...(project ? nativeFfiOverrides(project) : []),
    ],
  };
}
exports.withBabelShared = withBabelShared;
