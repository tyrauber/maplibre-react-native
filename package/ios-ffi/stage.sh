#!/usr/bin/env bash
# Stages the MapLibre Native C library and its Hermes adapter for the
# MapLibreReactNativeFFI pod. Until @maplibre/native-ffi publishes its ./hermes
# entry, both come from a local maplibre-native-ffi checkout, built with
#
#   mise run build-preset ios-simulator-arm64-metal
#
# MLN_FFI_DIR names the checkout (default: a sibling of this repository).
# MLN_FFI_PRESET names the preset (default: ios-simulator-arm64-metal).
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
ffi="$(cd "${MLN_FFI_DIR:-$here/../../../maplibre-native-ffi}" && pwd)"
preset="${MLN_FFI_PRESET:-ios-simulator-arm64-metal}"
install="$ffi/build/$preset/install"
native="$ffi/bindings/typescript/native"
napi="$ffi/bindings/typescript/node_modules/node-api-headers/include"
vendor="$here/vendor"

for required in \
  "$install/Frameworks/MaplibreNativeC.framework" \
  "$install/include/maplibre_native_c.h" \
  "$native/hermes/module.h" \
  "$napi/node_api.h"; do
  if [ ! -e "$required" ]; then
    echo "stage.sh: missing $required" >&2
    exit 1
  fi
done

rm -rf "$vendor"
mkdir -p "$vendor/hermes" "$vendor/node-api-headers"
cp -R "$install/Frameworks/MaplibreNativeC.framework" "$vendor/"
cp -R "$install/include" "$vendor/include"
# Not installed: the repository's own bindings read it from the source tree.
cp "$ffi/include/maplibre_native_c/binding_support.h" "$vendor/include/maplibre_native_c/"
cp "$native"/{generated_addon.c,generated_addon.h,generated_values.c,mutex.h,realm.c,runtime.c,runtime.h} \
  "$vendor/hermes/"
cp "$native"/hermes/{module.cpp,module.h,shim.cpp,shim.h,symbols.h} "$vendor/hermes/"
cp "$napi"/*.h "$vendor/node-api-headers/"
printf '%s %s\n' "$(git -C "$ffi" rev-parse HEAD)" "$preset" > "$vendor/SOURCE"

echo "Staged $preset from $ffi at $(cut -d' ' -f1 "$vendor/SOURCE")"
