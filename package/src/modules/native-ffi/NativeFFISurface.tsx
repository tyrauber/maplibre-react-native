import { View, type NativeSyntheticEvent, type ViewProps } from "react-native";

import NativeFFIModule from "./NativeFFIModule";
import NativeFFISurfaceNativeComponent from "./NativeFFISurfaceNativeComponent";

export interface NativeFFISurfaceLayerEvent {
  /**
   * The CAMetalLayer's address, in decimal. Native code retains the layer until
   * it is released: take it with `NativeFFIManager.leaseLayer()` .
   */
  layer: string;
  /** The layer's width, in points. */
  width: number;
  /** The layer's height, in points. */
  height: number;
  /** Pixels per point. */
  scale: number;
}

export interface NativeFFISurfaceProps extends ViewProps {
  /**
   * Called once the layer has a size, and again whenever its size or scale
   * changes. Every call names the same layer.
   */
  onLayer?: (event: NativeFFISurfaceLayerEvent) => void;
}

/**
 * Experimental: a view that hosts a CAMetalLayer for the MapLibre Native C API.
 * Without the MapLibreReactNativeFFI pod, it is a plain view and never calls
 * `onLayer` .
 */
export function NativeFFISurface({ onLayer, ...props }: NativeFFISurfaceProps) {
  if (!NativeFFIModule) {
    return <View {...props} />;
  }

  return (
    <NativeFFISurfaceNativeComponent
      {...props}
      onLayer={
        onLayer &&
        ((event: NativeSyntheticEvent<NativeFFISurfaceLayerEvent>) => {
          const { layer, width, height, scale } = event.nativeEvent;
          onLayer({ layer, width, height, scale });
        })
      }
    />
  );
}
