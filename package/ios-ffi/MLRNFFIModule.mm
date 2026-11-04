#import "MLRNFFIModule.h"

#import <React/RCTBridgeModule.h>

#include <functional>
#include <memory>

#include "module.h"

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
                          callInvoker:(const std::shared_ptr<facebook::react::CallInvoker> &)callInvoker {
  std::shared_ptr<facebook::react::CallInvoker> invoker = callInvoker;
  _module = std::make_unique<mln::hermes::Module>(runtime, [invoker](std::function<void()> work) {
    invoker->invokeAsync([work = std::move(work)](facebook::jsi::Runtime &) { work(); });
  });
}

- (NSNumber *)install {
  return @(_module != nullptr);
}

- (void)invalidate {
  // The destructor runs cleanup(), which ends all outstanding native work.
  _module.reset();
}

@end
