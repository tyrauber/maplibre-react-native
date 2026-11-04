require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

# Experimental: hosts the MapLibre Native C API through the Hermes binding of
# @maplibre/native-ffi. Opt in from a Podfile, after running ios-ffi/stage.sh:
#
#   pod "MapLibreReactNativeFFI", :path => "<path to package>"
vendor = "ios-ffi/vendor"

Pod::Spec.new do |s|
  s.name         = "MapLibreReactNativeFFI"
  s.version      = package["version"]
  s.summary      = "MapLibre Native C API host for MapLibre React Native (experimental)"
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/maplibre/maplibre-react-native.git", :tag => "#{s.version}" }

  s.source_files = ["ios-ffi/*.{h,mm}", "#{vendor}/hermes/*.{h,c,cpp}"]
  s.private_header_files = ["ios-ffi/*.h", "#{vendor}/hermes/*.h"]
  s.vendored_frameworks = "#{vendor}/MaplibreNativeC.framework"

  s.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20",
    "HEADER_SEARCH_PATHS" => [
      "\"$(PODS_TARGET_SRCROOT)/#{vendor}/hermes\"",
      "\"$(PODS_TARGET_SRCROOT)/#{vendor}/include\"",
      "\"$(PODS_TARGET_SRCROOT)/#{vendor}/node-api-headers\"",
    ].join(" "),
    # symbols.h renames the adapter's Node-API symbols to private, hidden
    # names, so it never interposes on another Hermes addon.
    "OTHER_CFLAGS" => "$(inherited) -include \"$(PODS_TARGET_SRCROOT)/#{vendor}/hermes/symbols.h\" -DNAPI_VERSION=8",
  }

  install_modules_dependencies(s)
end
