import { StyleSheet, View } from "react-native";

import type { MapEngineViewProps } from "../components/map/engine/MapEngine";

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});

/**
 * Placeholder for the FFI map view. It renders an empty view with the map's
 * layout; the FFI rendering lands in a later change.
 */
export function FFIMapView({ props }: MapEngineViewProps) {
  return (
    <View
      style={props.style ?? styles.flex1}
      testID={props.testID ? `${props.testID}-ffi` : undefined}
    />
  );
}
