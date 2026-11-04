import { NativeFFIManager } from "@maplibre/maplibre-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

// The calls this example makes. The package is not a dependency here: Metro
// resolves it to a local checkout (see metro.shared.js).
interface NativeFFI {
  cVersion(): number;
  supportedRenderBackendMask(): number;
  RuntimeHandle: {
    create(): Promise<{ id: bigint; close(): Promise<void> }>;
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  line: { fontFamily: "Menlo", fontSize: 13 },
});

export function NativeFFIRuntime() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const log = (line: string) => {
      console.log(`[NativeFFI] ${line}`);
      setLines((previous) => [...previous, line]);
    };

    if (!NativeFFIManager.install()) {
      log("not installed: link the MapLibreReactNativeFFI pod (MLRN_FFI=1)");
      return;
    }

    // Loads only after install(): the module reads the bindings when it loads.
    const ffi: NativeFFI = require("@maplibre/native-ffi/hermes");
    log(`C API version ${ffi.cVersion()}`);
    log(`render backend mask ${ffi.supportedRenderBackendMask()}`);

    let closed = false;
    let runtime:
      | Awaited<ReturnType<NativeFFI["RuntimeHandle"]["create"]>>
      | undefined;
    ffi.RuntimeHandle.create()
      .then(async (created) => {
        if (closed) {
          await created.close();
          return;
        }
        runtime = created;
        log(`runtime created ${created.id}`);
      })
      .catch((error: unknown) => log(`runtime failed: ${String(error)}`));

    return () => {
      closed = true;
      runtime?.close().catch((error: unknown) => {
        console.warn(`[NativeFFI] runtime close failed: ${String(error)}`);
      });
    };
  }, []);

  return (
    <View style={styles.container}>
      {lines.map((line, index) => (
        <Text key={index} style={styles.line}>
          {line}
        </Text>
      ))}
    </View>
  );
}
