import {
  Camera,
  type LngLat,
  Map,
  type MapEngine,
  type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TurboModuleRegistry,
  View,
} from "react-native";

import { OSM_RASTER_STYLE } from "@/constants/OSM_RASTER_STYLE";
import { OSM_VECTOR_STYLE } from "@/constants/OSM_VECTOR_STYLE";

// Experimental: the library's own <Map>, drawn through the MapLibre Native C
// API by the engine from @maplibre/maplibre-react-native/ffi. Link the package
// with MLRN_FFI=1 (see react-native-app/react-native.config.js).

// Importing /ffi loads @maplibre/native-ffi-react-native, and Metro reports a
// module that throws while it loads as a fatal error, which no catch sees. So
// the screen checks for the native module, whose absence makes the package
// throw, and for Metro's stub, before it loads /ffi.
function load(): MapEngine | Error {
  if (TurboModuleRegistry.get("MaplibreNativeFfi") === null) {
    return new Error("the app does not link @maplibre/native-ffi-react-native");
  }
  const nativeFfi = require("@maplibre/native-ffi-react-native");
  if (typeof nativeFfi.unavailable === "string") {
    return new Error(nativeFfi.unavailable);
  }
  const {
    ffiEngine,
  }: { ffiEngine: MapEngine } = require("@maplibre/maplibre-react-native/ffi");
  return ffiEngine;
}

// Each style names its sources' attributions in HTML: in the style at a URL,
// in the TileJSON of a source (which loads after the style), and in a style
// document.
const STYLES: Record<"URL" | "TileJSON" | "JSON", string | StyleSpecification> =
  {
    URL: OSM_VECTOR_STYLE,
    TileJSON: "https://tiles.openfreemap.org/styles/liberty",
    JSON: OSM_RASTER_STYLE as StyleSpecification,
  };

// Places the camera flies between, after it starts over Europe.
const PLACES: { name: string; center: LngLat; zoom: number }[] = [
  { name: "Tokyo", center: [139.767, 35.681], zoom: 10 },
  { name: "Paris", center: [2.3522, 48.8566], zoom: 11 },
];

export function NativeFFILibraryMap() {
  const [engine] = useState(load);
  const [style, setStyle] = useState<keyof typeof STYLES>("URL");
  const [place, setPlace] = useState<number>();
  const next = PLACES[((place ?? -1) + 1) % PLACES.length]!;

  if (engine instanceof Error) {
    return (
      <View style={styles.root}>
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            {`Not available: ${engine.message}\nBuild the app with MLRN_FFI=1.`}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Map engine={engine} mapStyle={STYLES[style]} testID="ffi-library-map">
        <Camera
          initialViewState={{ center: [10, 50], zoom: 3 }}
          center={place === undefined ? undefined : PLACES[place]!.center}
          zoom={place === undefined ? undefined : PLACES[place]!.zoom}
          easing="fly"
          duration={3000}
        />
      </Map>
      <Pressable
        accessibilityRole="button"
        onPress={() => setPlace(PLACES.indexOf(next))}
        style={[styles.toggle, styles.fly]}
      >
        <Text style={styles.option}>{`Fly to ${next.name}`}</Text>
      </Pressable>
      <View style={styles.toggle}>
        {(Object.keys(STYLES) as (keyof typeof STYLES)[]).map((key) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected: key === style }}
            onPress={() => setStyle(key)}
            style={[styles.option, key === style && styles.selected]}
          >
            <Text style={key === style ? styles.selectedText : undefined}>
              {`${key} style`}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f2efe9" },
  notice: {
    position: "absolute",
    alignSelf: "center",
    bottom: 48,
    maxWidth: "90%",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fdecea",
  },
  noticeText: { color: "#a1261b", fontSize: 15 },
  toggle: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  option: { paddingHorizontal: 14, paddingVertical: 8 },
  fly: { top: undefined, bottom: 40 },
  selected: { backgroundColor: "#295daa" },
  selectedText: { color: "#fff" },
});
