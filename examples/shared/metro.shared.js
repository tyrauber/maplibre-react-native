/* global __dirname */
const fs = require("node:fs");
const path = require("node:path");
const { withMetroConfig } = require("react-native-monorepo-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const root = path.resolve(__dirname, "..", "..");

// Experimental: @maplibre/native-ffi/hermes is not on npm yet, so it comes from a
// maplibre-native-ffi checkout, by default next to this repository. Metro takes
// the bundle that npm would ship, which package/ios-ffi/stage.sh builds: React
// Native's Babel preset rejects the sources' `declare` fields.
const nativeFfiDist = path.join(
  process.env.MLN_FFI_DIR ?? path.join(root, "..", "maplibre-native-ffi"),
  "bindings",
  "typescript",
  "build",
  "dist",
);
const nativeFfiHermes = path.join(nativeFfiDist, "hermes.mjs");
const hasNativeFfi = fs.existsSync(nativeFfiHermes);
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
 * @returns {import("metro-config").MetroConfig}
 */
function withMetroShared(config, { project }) {
  const metroConfig = wrapWithReanimatedMetroConfig(
    withMetroConfig(config, {
      root,
      dirname: project,
      workspaces: ["examples/*", "package"],
    }),
  );

  const resolveRequest = metroConfig.resolver?.resolveRequest;

  return {
    ...metroConfig,
    watchFolders: hasNativeFfi
      ? [...(metroConfig.watchFolders ?? []), nativeFfiDist]
      : metroConfig.watchFolders,
    resolver: {
      ...metroConfig.resolver,
      // Babel adds @babel/runtime imports to the bundle, which has no
      // node_modules of its own.
      nodeModulesPaths: hasNativeFfi
        ? [
            ...(metroConfig.resolver?.nodeModulesPaths ?? []),
            path.join(project, "node_modules"),
          ]
        : metroConfig.resolver?.nodeModulesPaths,
      extraNodeModules: {
        ...metroConfig.resolver?.extraNodeModules,
        "@": path.resolve(__dirname, "src"),
      },
      resolveRequest: (context, moduleName, platform) => {
        if (moduleName === "@maplibre/native-ffi/hermes") {
          return {
            type: "sourceFile",
            filePath: hasNativeFfi ? nativeFfiHermes : nativeFfiStub,
          };
        }
        // The bundle's chunks are .mjs, which Metro does not resolve itself.
        if (
          moduleName.startsWith("./") &&
          context.originModulePath.startsWith(nativeFfiDist + path.sep)
        ) {
          return {
            type: "sourceFile",
            filePath: path.resolve(
              path.dirname(context.originModulePath),
              moduleName,
            ),
          };
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
