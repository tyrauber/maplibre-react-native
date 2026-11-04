#import "MLRNFFIModule.h"

#import <React/RCTBridgeModule.h>
#import <React/RCTComponentViewFactory.h>
#import <React/RCTLog.h>

#include <cstdint>
#include <functional>
#include <limits>
#include <memory>
#include <string>

#include "MLRNFFIImplementation.h"
#include "module.h"

#import "MLRNFFILayerRegistry.h"
#import "MLRNFFISurfaceComponentView.h"

namespace {

// A token in decimal, digits only. Returns 0, which is never a token, for
// anything else, or for a value past uint64_t.
uint64_t parseToken(NSString *text) {
  const char *digits = text.UTF8String;
  if (digits == nullptr || *digits == '\0') {
    return 0;
  }
  uint64_t value = 0;
  for (const char *c = digits; *c != '\0'; ++c) {
    if (*c < '0' || *c > '9') {
      return 0;
    }
    const uint64_t digit = static_cast<uint64_t>(*c - '0');
    if (value > (std::numeric_limits<uint64_t>::max() - digit) / 10) {
      return 0;
    }
    value = value * 10 + digit;
  }
  return value;
}

NSString *formatToken(uint64_t value) {
  return [NSString stringWithUTF8String:std::to_string(value).c_str()];
}

}  // namespace

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

- (NSDictionary *)leaseLayer:(NSString *)surface {
  const uint64_t token = parseToken(surface);
  if (token == 0) {
    return nil;
  }
  const MLRNFFILayerLease leased = MLRNFFILeaseLayer(token);
  if (leased.lease == 0) {
    return nil;
  }
  return @{
    @"lease" : formatToken(leased.lease),
    @"layer" : formatToken(static_cast<uint64_t>(leased.layer)),
  };
}

- (void)releaseLayer:(NSString *)lease {
  const uint64_t token = parseToken(lease);
  if (token == 0 || !MLRNFFIReleaseLease(token)) {
    RCTLogWarn(@"[MLRNFFIModule] releaseLayer: no lease %@", lease);
  }
}

- (void)invalidate {
  // The destructor runs cleanup(), which ends all outstanding native work, so
  // no session renders to a layer after this.
  _module.reset();
  const NSUInteger released = MLRNFFIReleaseAllLayers();
  if (released > 0) {
    RCTLogInfo(@"[MLRNFFIModule] released %lu lease(s) on invalidate", (unsigned long)released);
  }
}

@end
