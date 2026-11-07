import type { ViewProps } from "react-native";

import { UnsupportedByEngineError } from "./UnsupportedByEngineError";
import type { MapProps } from "../Map";

/**
 * How an engine treats one `<Map>` prop.
 *
 * - `capability`: honoured when the controller has the capability.
 * - `value`: honoured for the values that `accepts` allows.
 * - `cosmetic`: ignored, with one development warning per prop name.
 * - `none`: never honoured.
 *
 * @internal
 */
export type EnginePropSupport =
  | { readonly support: "capability"; readonly capability: string }
  | {
      readonly support: "value";
      readonly accepts: (value: unknown) => boolean;
    }
  | { readonly support: "cosmetic" }
  | { readonly support: "none" };

/**
 * The `<Map>` props that are the map's own. The plain view props such as the
 * style and the test ID are not among them, and always pass through.
 *
 * @internal
 */
export type EngineMapProp = Exclude<
  keyof MapProps,
  keyof ViewProps | "engine" | "ref"
>;

/**
 * How an engine treats every `<Map>` prop. The type lists every prop, so a new
 * `<Map>` prop does not compile until each engine decides about it.
 *
 * @internal
 */
export type EngineMapProps = Readonly<Record<EngineMapProp, EnginePropSupport>>;

const warned = new Set<string>();

/**
 * Checks the `<Map>` props against an engine. A prop the engine cannot honour
 * throws `UnsupportedByEngineError` and a cosmetic one warns once per prop
 * name. An undefined prop is not a request. Returns the plain view props.
 *
 * @internal
 */
export function checkEngineProps(
  engine: string,
  props: object,
  capabilities: ReadonlySet<string>,
  table: { readonly [name: string]: EnginePropSupport },
): ViewProps {
  const entries = table as Readonly<
    Record<string, EnginePropSupport | undefined>
  >;
  const viewProps: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(props)) {
    const entry = entries[name];
    if (entry === undefined) {
      viewProps[name] = value;
      continue;
    }
    if (value === undefined) continue;
    switch (entry.support) {
      case "capability":
        if (!capabilities.has(entry.capability)) {
          throw new UnsupportedByEngineError(engine, name);
        }
        break;
      case "value":
        if (!entry.accepts(value)) {
          throw new UnsupportedByEngineError(
            engine,
            name,
            `${name}={${JSON.stringify(value)}}`,
          );
        }
        break;
      case "cosmetic":
        if (__DEV__ && !warned.has(`${engine}:${name}`)) {
          warned.add(`${engine}:${name}`);
          console.warn(
            `<Map>: the "${engine}" map engine ignores the ${name} prop.`,
          );
        }
        break;
      case "none":
        throw new UnsupportedByEngineError(engine, name);
    }
  }
  return viewProps;
}

/** @internal Forgets the cosmetic props already warned about, for tests. */
export function resetEngineWarnings(): void {
  warned.clear();
}
