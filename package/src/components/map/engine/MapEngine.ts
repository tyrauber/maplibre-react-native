import type { ComponentType, Ref } from "react";

import type { MapController } from "./MapController";
import type { MapProps, MapRef } from "../Map";

declare const mapEngineBrand: unique symbol;

/**
 * A map engine renders `<Map>` and runs its commands. Without one, `<Map>` uses
 * the native MapLibre view.
 *
 * Engines are opaque: get one from the entry point that provides it, and pass
 * it to the `engine` prop of `<MapEngineProvider>` or `<Map>` as is.
 */
export interface MapEngine {
  /** Name for diagnostics, such as `"ffi"`. */
  readonly name: string;
  readonly [mapEngineBrand]: true;
}

/**
 * Props the engine's map component receives from `<Map>`.
 *
 * @internal
 */
export interface MapEngineViewProps {
  /** The `<Map>` props, without `ref` and `engine`. */
  props: Omit<MapProps, "ref" | "engine">;
  /** The controller `<Map>` created for this mount. */
  controller: MapController;
  /** The `<Map>` ref, for the engine's imperative handle. */
  mapRef: Ref<MapRef> | undefined;
}

/**
 * What an engine gives `<Map>`. `<Map>` depends only on this interface.
 *
 * @internal
 */
export interface MapEngineImplementation {
  readonly name: string;
  /** Renders the map for one `<Map>` mount. */
  MapView: ComponentType<MapEngineViewProps>;
  /**
   * Makes the controller for one `<Map>` mount. `<Map>` disposes it on unmount.
   * It must have no side effects: React may call it and discard the result.
   */
  createController(): MapController;
}

// A registered symbol, so that two copies of this module (for example the
// commonjs and module builds) still read each other's engines.
const IMPLEMENTATION = Symbol.for(
  "@maplibre/maplibre-react-native/MapEngineImplementation",
);

type EngineObject = MapEngine & {
  readonly [IMPLEMENTATION]: MapEngineImplementation;
};

/**
 * Wraps an implementation as an opaque `MapEngine`.
 *
 * @internal
 */
export function defineMapEngine(
  implementation: MapEngineImplementation,
): MapEngine {
  return Object.freeze({
    name: implementation.name,
    [IMPLEMENTATION]: implementation,
  }) as unknown as MapEngine;
}

/**
 * Reads the implementation of an engine made by `defineMapEngine`.
 *
 * @internal
 */
export function getMapEngineImplementation(
  engine: MapEngine,
): MapEngineImplementation {
  const implementation = (engine as Partial<EngineObject>)[IMPLEMENTATION];
  if (!implementation) {
    throw new Error(
      "MapEngine: this object is not a map engine. Import an engine from its entry point, such as `@maplibre/maplibre-react-native/ffi`.",
    );
  }
  return implementation;
}
