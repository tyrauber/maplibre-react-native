#import "MLRNFFISurfaceComponentView.h"

#import <QuartzCore/CAMetalLayer.h>

#import <react/renderer/components/MapLibreReactNativeSpec/ComponentDescriptors.h>
#import <react/renderer/components/MapLibreReactNativeSpec/EventEmitters.h>
#import <react/renderer/components/MapLibreReactNativeSpec/Props.h>

#include <string>

#import "MLRNFFILayerRegistry.h"

using namespace facebook::react;

@interface MLRNFFIMetalView : UIView
@end

@implementation MLRNFFIMetalView

+ (Class)layerClass {
  return [CAMetalLayer class];
}

@end

@implementation MLRNFFISurfaceComponentView {
  MLRNFFIMetalView *_metalView;
  // Names this view's layer in the registry while it is mounted. Never reused.
  uint64_t _surface;
  BOOL _mounted;
  // What onLayer last reported, so a layout that changes nothing reports
  // nothing.
  CGSize _reportedSize;
  CGFloat _reportedScale;
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MLRNFFISurfaceProps>();
    _props = defaultProps;
    _metalView = [[MLRNFFIMetalView alloc] initWithFrame:self.bounds];
    _metalView.layer.opaque = YES;
    self.contentView = _metalView;
    _surface = MLRNFFIMountSurface((CAMetalLayer *)_metalView.layer);
    _mounted = YES;
  }
  return self;
}

// Fabric calls this once the view is unmounted for good: it is never recycled.
// Leases already taken on the layer stay held.
- (void)invalidate {
  [self unmountSurface];
  [super invalidate];
}

- (void)dealloc {
  [self unmountSurface];
}

- (void)unmountSurface {
  if (_mounted) {
    _mounted = NO;
    MLRNFFIUnmountSurface(_surface);
  }
}

// A recycled view would hand its layer to a second map while the first
// session may still render to it.
+ (BOOL)shouldBeRecycled {
  return NO;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<MLRNFFISurfaceComponentDescriptor>();
}

- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics {
  [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:oldLayoutMetrics];
  _metalView.layer.contentsScale = layoutMetrics.pointScaleFactor;
  [self reportLayer];
}

- (void)updateEventEmitter:(const EventEmitter::Shared &)eventEmitter {
  [super updateEventEmitter:eventEmitter];
  [self reportLayer];
}

- (void)reportLayer {
  CAMetalLayer *layer = (CAMetalLayer *)_metalView.layer;
  const CGSize size = _metalView.bounds.size;
  const CGFloat scale = layer.contentsScale;
  if (!_mounted || _eventEmitter == nullptr || size.width <= 0 || size.height <= 0 ||
      (CGSizeEqualToSize(size, _reportedSize) && scale == _reportedScale)) {
    return;
  }
  _reportedSize = size;
  _reportedScale = scale;

  // The layer's address leaves native code only with a lease, which holds it.
  std::static_pointer_cast<const MLRNFFISurfaceEventEmitter>(_eventEmitter)
      ->onLayer(MLRNFFISurfaceEventEmitter::OnLayer{
          .surface = std::to_string(_surface),
          .width = size.width,
          .height = size.height,
          .scale = scale,
      });
}

@end
