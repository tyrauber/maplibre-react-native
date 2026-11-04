/* global __dirname */
const path = require("node:path");
const { withMetroConfig } = require("react-native-monorepo-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const nativeFfi = require("./nativeFfi");

const root = path.resolve(__dirname, "..", "..");

const nativeFfiStub = path.join(
  __dirname,
  "src",
  "examples",
  "NativeFFI",
  "nativeFfiStub.js",
);

/**
 * @param {import("metro-config").MetroConfig} config
 * @param {object} options
 * @param {string} options.project
 * @param {boolean} [options.nativeFfi] - Resolve @maplibre/native-ffi-react-native
 *   to the checkout, for an app that compiles it (see babel.shared.js). Other
 *   apps get the stub.
 * @returns {import("metro-config").MetroConfig}
 */
function withMetroShared(config, { project, nativeFfi: useNativeFfi = false }) {
  const ffi = useNativeFfi && nativeFfi.available;
  const metroConfig = wrapWithReanimatedMetroConfig(
    withMetroConfig(config, {
      root,
      dirname: project,
      workspaces: ["examples/*", "package"],
    }),
  );

  const resolveRequest = metroConfig.resolver?.resolveRequest ?? null;
  const resolve = (context, moduleName, platform) =>
    (resolveRequest ?? context.resolveRequest)(context, moduleName, platform);

  return {
    ...metroConfig,
    watchFolders: ffi
      ? [
          ...(metroConfig.watchFolders ?? []),
          path.join(nativeFfi.binding, "src"),
          path.join(nativeFfi.reactNative, "src"),
        ]
      : metroConfig.watchFolders,
    resolver: {
      ...metroConfig.resolver,
      extraNodeModules: {
        ...metroConfig.resolver?.extraNodeModules,
        "@": path.resolve(__dirname, "src"),
      },
      resolveRequest: (context, moduleName, platform) => {
        if (moduleName === "@maplibre/native-ffi-react-native") {
          return {
            type: "sourceFile",
            filePath: ffi ? nativeFfi.entry : nativeFfiStub,
          };
        }
        if (ffi && moduleName === "@maplibre/native-ffi/hermes") {
          return {
            type: "sourceFile",
            filePath: path.join(nativeFfi.binding, "src", "hermes.ts"),
          };
        }
        // The checkout's own node_modules hold its React Native version. React
        // Native, React and Babel's helpers come from the app instead.
        if (
          ffi &&
          !moduleName.startsWith(".") &&
          context.originModulePath.startsWith(nativeFfi.binding + path.sep)
        ) {
          return resolve(
            { ...context, originModulePath: path.join(project, "index.js") },
            moduleName,
            platform,
          );
        }
        return resolve(context, moduleName, platform);
      },
    },
  };
}

exports.withMetroShared = withMetroShared;
