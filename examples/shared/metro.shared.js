/* global __dirname */
const path = require("node:path");
const { withMetroConfig } = require("react-native-monorepo-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const root = path.resolve(__dirname, "..", "..");

const nativeFfiStub = path.join(
  __dirname,
  "src",
  "examples",
  "NativeFFI",
  "nativeFfiStub.js",
);

// @maplibre/native-ffi-react-native, which the FFI example uses. An app that
// does not install it, such as the Expo app, gets the stub instead.
const nativeFfi = "@maplibre/native-ffi-react-native";

/**
 * @param {string} project
 * @param {string} name
 * @returns {boolean} Whether the project resolves the package `name`.
 */
function installs(project, name) {
  try {
    require.resolve(`${name}/package.json`, { paths: [project] });
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {import("metro-config").MetroConfig} config
 * @param {object} options
 * @param {string} options.project
 * @returns {import("metro-config").MetroConfig}
 */
function withMetroShared(config, { project }) {
  const hasNativeFfi = installs(project, nativeFfi);
  const metroConfig = wrapWithReanimatedMetroConfig(
    withMetroConfig(config, {
      root,
      dirname: project,
      workspaces: ["examples/*", "package"],
    }),
  );

  const resolveRequest = metroConfig.resolver?.resolveRequest ?? null;

  return {
    ...metroConfig,
    resolver: {
      ...metroConfig.resolver,
      extraNodeModules: {
        ...metroConfig.resolver?.extraNodeModules,
        "@": path.resolve(__dirname, "src"),
      },
      resolveRequest: (context, moduleName, platform) => {
        if (moduleName === nativeFfi && !hasNativeFfi) {
          return { type: "sourceFile", filePath: nativeFfiStub };
        }
        return (resolveRequest ?? context.resolveRequest)(
          context,
          moduleName,
          platform,
        );
      },
    },
  };
}

exports.withMetroShared = withMetroShared;
