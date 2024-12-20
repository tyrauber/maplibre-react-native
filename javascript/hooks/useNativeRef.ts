import React, { Component, useRef } from "react";
import { NativeMethods } from "react-native";

export type NativeRef<NativeProps> = Component<NativeProps> &
  Readonly<NativeMethods>;

/**
 * Separate  module which allows to be mocked in tests.
 */
export function useNativeRef<NativeProps = object>(): React.RefObject<
  NativeRef<NativeProps>
> {
  return useRef<NativeRef<NativeProps>>(null);
}
