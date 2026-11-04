/* global __dirname */
// Experimental: @maplibre/native-ffi-react-native is not on npm yet, so the
// examples take it from a maplibre-native-ffi checkout, next to this repository
// unless MLN_FFI_DIR names another.
const fs = require("node:fs");
const path = require("node:path");

const checkout = path.resolve(
  process.env.MLN_FFI_DIR ??
    path.join(__dirname, "..", "..", "..", "maplibre-native-ffi"),
);
const binding = path.join(checkout, "bindings", "typescript");
const reactNative = path.join(binding, "react-native");
const entry = path.join(reactNative, "src", "index.ts");

module.exports = {
  // The TypeScript binding, whose sources the app compiles.
  binding,
  // The React Native package: a TurboModule, a surface view, and its entry.
  reactNative,
  entry,
  available: fs.existsSync(entry),
};
