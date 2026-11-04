import {
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from "react-native";

type LayerEvent = {
  surface: string;
  width: CodegenTypes.Double;
  height: CodegenTypes.Double;
  scale: CodegenTypes.Double;
};

export interface NativeProps extends ViewProps {
  onLayer?: CodegenTypes.DirectEventHandler<LayerEvent>;
}

// Registered by MLRNFFIModule, in an app that links the MapLibreReactNativeFFI
// pod, so it is not in the package's componentProvider.
export default codegenNativeComponent<NativeProps>(
  "MLRNFFISurface",
) as HostComponent<NativeProps>;
