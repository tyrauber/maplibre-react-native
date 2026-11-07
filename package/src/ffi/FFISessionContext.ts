import { createContext } from "react";

import type { FFIMapSession } from "./FFIMapSession";

/** The session of the enclosing FFI map, for its children's commands. */
export const FFISessionContext = createContext<FFIMapSession | undefined>(
  undefined,
);
