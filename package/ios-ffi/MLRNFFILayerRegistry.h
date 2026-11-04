#import <QuartzCore/CAMetalLayer.h>

NS_ASSUME_NONNULL_BEGIN

// The CAMetalLayers of mounted surfaces, and the holds that JavaScript leases
// on them. JavaScript hands a layer's address to the C API, which renders to
// the layer until the session's close completes, after its view may be gone.
// So each lease keeps its layer alive from before the address leaves native
// code until JavaScript releases that lease. Tokens are never reused, and 0 is
// never a token. Safe to call from any thread.

/// Names a mounted surface's layer by a new surface token, until
/// MLRNFFIUnmountSurface. Takes no hold: the view owns its layer.
uint64_t MLRNFFIMountSurface(CAMetalLayer *layer);

/// Forgets the surface. Leases already taken on its layer stay held. An
/// unknown token changes nothing.
void MLRNFFIUnmountSurface(uint64_t surface);

typedef struct {
  /// The hold's token, or 0 when the surface is not mounted.
  uint64_t lease;
  /// The layer's address, or 0 when the surface is not mounted.
  uintptr_t layer;
} MLRNFFILayerLease;

/// Takes a new hold on a mounted surface's layer, under a new lease token.
MLRNFFILayerLease MLRNFFILeaseLayer(uint64_t surface);

/// Lets go of the one hold under the lease token. Returns NO, and changes
/// nothing, when it holds no such lease.
BOOL MLRNFFIReleaseLease(uint64_t lease);

/// Lets every lease's hold go, and returns how many there were.
NSUInteger MLRNFFIReleaseAllLayers(void);

NS_ASSUME_NONNULL_END
