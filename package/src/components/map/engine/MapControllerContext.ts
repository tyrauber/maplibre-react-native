import { createContext, useContext } from "react";

import type { MapController } from "./MapController";

/**
 * The controller of the enclosing map. Only a map with a non-native engine
 * provides it; under the native engine it is undefined.
 *
 * Private: not exported from the package.
 */
export const MapControllerContext = createContext<MapController | undefined>(
  undefined,
);

/** @internal */
export function useMapController(): MapController | undefined {
  return useContext(MapControllerContext);
}
