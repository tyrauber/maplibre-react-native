import { UnsupportedByEngineError } from "./UnsupportedByEngineError";
import type { MapRef } from "../Map";

// Every MapRef method. The type lists each one, so a new method does not
// compile until it is added here.
const METHODS: Readonly<Record<keyof MapRef, true>> = {
  getCenter: true,
  getZoom: true,
  getBearing: true,
  getPitch: true,
  getBounds: true,
  getViewState: true,
  project: true,
  unproject: true,
  queryRenderedFeatures: true,
  createStaticMapImage: true,
  setSourceVisibility: true,
  showAttribution: true,
};

/**
 * A map ref whose every method rejects. Each rejection is an
 * `UnsupportedByEngineError` for that method, until the engine supports it.
 *
 * @internal
 */
export function unsupportedMapRef(engine: string): MapRef {
  const ref: Record<string, () => Promise<never>> = {};
  for (const method of Object.keys(METHODS)) {
    ref[method] = () =>
      Promise.reject(
        new UnsupportedByEngineError(engine, `MapRef.${method}()`),
      );
  }
  return ref as unknown as MapRef;
}
