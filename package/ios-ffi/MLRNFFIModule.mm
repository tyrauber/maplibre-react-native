#import "MLRNFFIModule.h"

#import <React/RCTBridgeModule.h>
#import <React/RCTComponentViewFactory.h>
#import <React/RCTLog.h>

#include <cerrno>
#include <cstdlib>
#include <functional>
#include <memory>

#include "MLRNFFIImplementation.h"
#include "module.h"

#import "MLRNFFILayerRegistry.h"
#import "MLRNFFISurfaceComponentView.h"

@implementation MLRNFFIModule {
  std::unique_ptr<mln::hermes::Module> _module;
}

+ (NSString *)moduleName {
  return @"MLRNFFIModule";
}

// On the JavaScript thread, bridgeless React Native invalidates this module
// before it destroys the runtime, which is when mln::hermes::Module must go.
- (dispatch_queue_t)methodQueue {
  return RCTJSThread;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeFFIModuleSpecJSI>(params);
}

- (void)installJSIBindingsWithRuntime:(facebook::jsi::Runtime &)runtime
                          callInvoker:
                              (const std::shared_ptr<facebook::react::CallInvoker> &)callInvoker {
  // The app's component provider does not list MLRNFFISurface, since only an
  // app that links this pod has its view. Register it before JavaScript can
  // render one: JavaScript renders it only when this module exists.
  static dispatch_once_t registered;
  dispatch_once(&registered, ^{
    [[RCTComponentViewFactory currentComponentViewFactory]
        registerComponentViewClass:[MLRNFFISurfaceComponentView class]];
  });

  std::shared_ptr<facebook::react::CallInvoker> invoker = callInvoker;
  _module = std::make_unique<mln::hermes::Module>(runtime, [invoker](std::function<void()> work) {
    invoker->invokeAsync([work = std::move(work)](facebook::jsi::Runtime &) { work(); });
  });
}

- (NSNumber *)install {
  return @(_module != nullptr);
}

- (NSString *)implementation {
  return @MLRN_FFI_IMPLEMENTATION;
}

- (void)releaseLayer:(NSString *)layer {
  const char *text = layer.UTF8String;
  char *end = nullptr;
  errno = 0;
  const unsigned long long address = text != nullptr ? std::strtoull(text, &end, 10) : 0;
  if (text == nullptr || end == text || *end != '\0' || errno != 0 || address == 0 ||
      !MLRNFFIReleaseLayer(static_cast<uintptr_t>(address))) {
    RCTLogWarn(@"[MLRNFFIModule] releaseLayer: no retained layer at %@", layer);
  }
}

- (void)invalidate {
  // The destructor runs cleanup(), which ends all outstanding native work, so
  // no session renders to a layer after this.
  _module.reset();
  const NSUInteger released = MLRNFFIReleaseAllLayers();
  if (released > 0) {
    RCTLogInfo(@"[MLRNFFIModule] released %lu layer(s) on invalidate", (unsigned long)released);
  }
}

@end
