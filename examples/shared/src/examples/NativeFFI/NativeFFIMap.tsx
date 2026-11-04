import { type ComponentType, useEffect, useState } from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";

import type {
  MapController as MapControllerClass,
  Status,
} from "./MapController";
import type { mapGestures as mapGesturesFunction } from "./gestures";

// Experimental: a map drawn through the MapLibre Native C API, with the React
// Native package and example controller from maplibre-native-ffi. Loading the
// package installs the binding, and throws when the app does not link it, so the
// screen loads it on first render. Link it with MLRN_FFI=1 (see
// react-native-app/react-native.config.js).

// The package's MaplibreSurfaceView props, which the type checker cannot see
// (see native-ffi-react-native.d.ts).
interface SurfaceEvent {
  nativeEvent: { surface: number };
}
interface SurfaceViewProps extends ViewProps {
  onSurfaceAvailable?: (event: SurfaceEvent) => void;
  onSurfaceLost?: (event: SurfaceEvent) => void;
}

interface Loaded {
  MaplibreSurfaceView: ComponentType<SurfaceViewProps>;
  MapController: typeof MapControllerClass;
  mapGestures: typeof mapGesturesFunction;
}

function load(): Loaded | Error {
  try {
    return {
      MaplibreSurfaceView: require("@maplibre/native-ffi-react-native")
        .MaplibreSurfaceView,
      MapController: require("./MapController").MapController,
      mapGestures: require("./gestures").mapGestures,
    };
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

function log(status: Status): void {
  console.log(
    `[NativeFFI] ${status.error ? "error" : "status"}: ${status.message || "style loaded"}`,
  );
}

export function NativeFFIMap() {
  const [loaded] = useState(load);

  if (loaded instanceof Error) {
    return (
      <View style={styles.root}>
        <View style={[styles.status, styles.error]}>
          <Text style={[styles.statusText, styles.errorText]}>
            {`Not available: ${loaded.message}\nBuild the app with MLRN_FFI=1.`}
          </Text>
        </View>
      </View>
    );
  }

  return <Map {...loaded} />;
}

// maplibre-native-ffi's examples/react-native/src/App.tsx at 616f9175.
function Map({ MaplibreSurfaceView, MapController, mapGestures }: Loaded) {
  const [status, setStatus] = useState<Status>({ message: "", error: false });
  // The view can report its surface before the effect runs, so the controller
  // exists from the first render and starts in the effect.
  const [controller] = useState(
    () =>
      new MapController((next) => {
        log(next);
        setStatus(next);
      }),
  );
  const [gestures] = useState(() => mapGestures(() => controller.map));

  useEffect(() => {
    controller.start();
    return () => controller.dispose();
  }, [controller]);

  return (
    <View style={styles.root}>
      <MaplibreSurfaceView
        style={StyleSheet.absoluteFill}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          controller.setSize({
            width: Math.max(1, Math.round(width)),
            height: Math.max(1, Math.round(height)),
          });
        }}
        onSurfaceAvailable={(event) =>
          controller.surfaceAvailable(event.nativeEvent.surface)
        }
        onSurfaceLost={(event) =>
          controller.surfaceLost(event.nativeEvent.surface)
        }
        {...gestures.panHandlers}
      />
      {status.message === "" ? null : (
        <View
          pointerEvents="none"
          style={[styles.status, status.error && styles.error]}
        >
          <Text style={[styles.statusText, status.error && styles.errorText]}>
            {status.message}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f2efe9" },
  status: {
    position: "absolute",
    alignSelf: "center",
    bottom: 48,
    maxWidth: "90%",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  error: { backgroundColor: "#fdecea" },
  statusText: { color: "#222", fontSize: 15 },
  errorText: { color: "#a1261b" },
});
