import { type ComponentType, useContext } from "react";

import { MapControllerContext } from "./MapControllerContext";
import { UnsupportedByEngineError } from "./UnsupportedByEngineError";

/**
 * Throws `UnsupportedByEngineError` while a `<Map>` child renders under an
 * engine that does not support it, named in JSX form like `"<Camera>"` in the
 * engine's capabilities. Call it first in the child, so that its native
 * component never renders. Under the native engine, which provides no
 * controller, it does nothing.
 *
 * Each child checks for itself, so the check holds wherever the child sits:
 * nested in a source, in a fragment, or in the user's own component.
 *
 * @internal
 */
export function useEngineSupport(feature: string): void {
  const controller = useContext(MapControllerContext);
  if (controller && !controller.capabilities.has(feature)) {
    throw new UnsupportedByEngineError(controller.engine, feature);
  }
}

/**
 * Picks a `<Map>` child's implementation: `undefined` under the native engine,
 * or the engine's own component for `feature` , such as `"<Camera>"` . Throws
 * `UnsupportedByEngineError` when the engine has none.
 *
 * @internal
 */
export function useEngineComponent<P>(
  feature: string,
): ComponentType<P> | undefined {
  const controller = useContext(MapControllerContext);
  if (!controller) return undefined;
  const component = controller.components.get(feature);
  if (!controller.capabilities.has(feature) || component === undefined) {
    throw new UnsupportedByEngineError(controller.engine, feature);
  }
  return component as ComponentType<P>;
}
