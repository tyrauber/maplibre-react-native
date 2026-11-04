import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { type MapController } from "./MapController";
import {
  getMapEngineImplementation,
  type MapEngine,
  type MapEngineImplementation,
} from "./MapEngine";

const MapEngineContext = createContext<MapEngine | undefined>(undefined);

export interface MapEngineProviderProps {
  /** The engine for every `<Map>` in this subtree without its own `engine`. */
  engine: MapEngine;
  children?: ReactNode;
}

/**
 * Sets the default engine for the maps in its subtree. A `<Map engine>` prop
 * overrides it.
 *
 * @example
 * ```tsx
 * import { ffiEngine } from "@maplibre/maplibre-react-native/ffi";
 *
 * <MapEngineProvider engine={ffiEngine}>
 *   <Map mapStyle={style} />
 * </MapEngineProvider>;
 * ```
 */
export function MapEngineProvider({
  engine,
  children,
}: MapEngineProviderProps) {
  return <MapEngineContext value={engine}>{children}</MapEngineContext>;
}

/**
 * Picks the engine of a map in this order: the prop, the provider, then native
 * (undefined). The first pick holds for the mounted lifetime. A later change
 * warns once in development.
 *
 * @internal
 */
export function useMapEngine(
  engine: MapEngine | undefined,
): MapEngineImplementation | undefined {
  const fromProvider = useContext(MapEngineContext);
  const requested = engine ?? fromProvider;
  const [captured] = useState(requested);
  const warned = useRef(false);

  useEffect(() => {
    if (__DEV__ && requested !== captured && !warned.current) {
      warned.current = true;
      console.warn(
        `<Map>: the map engine changed from ${describe(captured)} to ${describe(requested)}. ` +
          "A map keeps the engine it mounted with. To switch engines, remount the map with a new `key`.",
      );
    }
  }, [requested, captured]);

  return captured && getMapEngineImplementation(captured);
}

/**
 * Makes the controller of a `<Map>` mount and disposes it on unmount. Returns
 * `undefined` for the native engine.
 *
 * @internal
 */
export function useMapEngineController(
  engine: MapEngineImplementation | undefined,
): MapController | undefined {
  const [controller, setController] = useState(() =>
    engine?.createController(),
  );

  useEffect(() => {
    if (!engine || !controller) return;
    // Strict Mode and Fast Refresh run the cleanup and then this effect again
    // on the same mount. The disposed controller is replaced, not reused. This
    // renders once more, only in development.
    if (controller.isDisposed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setController(engine.createController());
      return;
    }
    return () => controller.dispose();
  }, [engine, controller]);

  return controller;
}

function describe(engine: MapEngine | undefined) {
  return engine ? `"${engine.name}"` : "native";
}
