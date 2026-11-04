/**
 * Thrown when a map engine cannot honour what a map asks for: a prop, a child
 * component, or a `MapRef` method. A prop or child throws while the map
 * renders, so an error boundary catches it; a method rejects with it.
 *
 * @example
 * ```tsx
 * if (error instanceof UnsupportedByEngineError) {
 *   console.warn(error.feature + " needs the native engine");
 * }
 * ```
 */
export class UnsupportedByEngineError extends Error {
  /** The engine's name, such as `"ffi"`. */
  readonly engine: string;
  /**
   * What the engine cannot honour, as a prop name like `"dragPan"` or a child
   * like `"<Camera>"` or a method like `"MapRef.getCenter()"` in that form.
   */
  readonly feature: string;

  constructor(engine: string, feature: string, detail?: string) {
    super(
      `The "${engine}" map engine does not support ${feature}` +
        (detail ? `: ${detail}` : "."),
    );
    this.name = "UnsupportedByEngineError";
    this.engine = engine;
    this.feature = feature;
  }
}
