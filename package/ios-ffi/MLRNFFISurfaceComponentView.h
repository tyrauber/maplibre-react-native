#import <React/RCTViewComponentView.h>

NS_ASSUME_NONNULL_BEGIN

// Hosts a CAMetalLayer for the MapLibre Native C API. Reports its surface token
// and size to JavaScript through onLayer, and names its layer by that token in
// MLRNFFILayerRegistry while it is mounted.
@interface MLRNFFISurfaceComponentView : RCTViewComponentView
@end

NS_ASSUME_NONNULL_END
