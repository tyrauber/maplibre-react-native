#import <QuartzCore/CAMetalLayer.h>

NS_ASSUME_NONNULL_BEGIN

// The CAMetalLayers whose addresses JavaScript holds. JavaScript hands an
// address to the C API, which renders to the layer until the session's close
// completes, after its view may be gone. So the registry keeps each layer
// alive from before its address leaves native code until JavaScript releases
// it. Safe to call from any thread.

/// Retains the layer until MLRNFFIReleaseLayer, and returns its address.
/// Retaining a layer that the registry holds again changes nothing.
uintptr_t MLRNFFIRetainLayer(CAMetalLayer *layer);

/// Lets the registry's hold on the layer at the address go. Returns NO, and
/// changes nothing, when it holds no such layer.
BOOL MLRNFFIReleaseLayer(uintptr_t address);

/// Lets every hold go, and returns how many there were.
NSUInteger MLRNFFIReleaseAllLayers(void);

NS_ASSUME_NONNULL_END
