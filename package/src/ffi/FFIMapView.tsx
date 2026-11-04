import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { FFIMapSession } from "./FFIMapSession";
import { nativeFfi } from "./nativeFfi";
import type { MapEngineViewProps } from "../components/map/engine/MapEngine";

/**
 * The FFI engine's map: a `MaplibreSurfaceView` that MapLibre Native draws into
 * through its C API, with the style's attributions in the bottom-right corner.
 *
 * Attribution is required by the data licences of most styles, so it always
 * shows when the style's sources name one.
 */
export function FFIMapView({ props, controller }: MapEngineViewProps) {
  const { mapStyle, style, testID } = props;
  const [attributions, setAttributions] = useState<readonly string[]>([]);
  // The view can report its surface before the effect runs, so the session
  // exists from the first render and starts in the effect.
  const [session] = useState(() => new FFIMapSession(setAttributions));

  useEffect(() => {
    session.start();
    return () => session.dispose();
  }, [session]);

  useEffect(() => {
    session.setController(controller);
  }, [session, controller]);

  // An object style compares by its JSON, so a new but equal object does not
  // reload the style.
  const styleText =
    typeof mapStyle === "string" ? mapStyle : JSON.stringify(mapStyle);

  useEffect(() => {
    if (styleText !== undefined) session.setStyle(styleText);
  }, [session, styleText]);

  const { MaplibreSurfaceView } = nativeFfi;

  return (
    <View
      style={style ?? styles.flex1}
      testID={testID ? `${testID}-ffi` : undefined}
    >
      <MaplibreSurfaceView
        style={StyleSheet.absoluteFill}
        testID={testID ? `${testID}-ffi-surface` : undefined}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          session.setSize({
            width: Math.max(1, Math.round(width)),
            height: Math.max(1, Math.round(height)),
          });
        }}
        onSurfaceAvailable={(event) =>
          session.surfaceAvailable(event.nativeEvent.surface)
        }
        onSurfaceLost={(event) =>
          session.surfaceLost(event.nativeEvent.surface)
        }
      />
      {attributions.length > 0 ? (
        <View style={styles.attribution}>
          <Text style={styles.attributionText}>{attributions.join(" | ")}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  attribution: {
    position: "absolute",
    right: 0,
    bottom: 0,
    maxWidth: "100%",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderTopLeftRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    pointerEvents: "none",
  },
  attributionText: { color: "#333", fontSize: 10 },
});
