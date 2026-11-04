#import "MLRNFFILayerRegistry.h"

#include <mutex>
#include <unordered_map>
#include <vector>

namespace {

std::mutex &registryMutex() {
  static std::mutex mutex;
  return mutex;
}

std::unordered_map<uintptr_t, CAMetalLayer *> &registry() {
  static auto *layers = new std::unordered_map<uintptr_t, CAMetalLayer *>();
  return *layers;
}

// A layer whose view is gone deallocates with its last release, which belongs
// on the main thread, where UIKit made it.
void releaseOnMain(std::vector<CAMetalLayer *> layers) {
  if (layers.empty()) {
    return;
  }
  dispatch_async(dispatch_get_main_queue(), ^{
    (void)layers;
  });
}

}  // namespace

uintptr_t MLRNFFIRetainLayer(CAMetalLayer *layer) {
  const auto address = reinterpret_cast<uintptr_t>((__bridge void *)layer);
  std::lock_guard<std::mutex> lock(registryMutex());
  registry().emplace(address, layer);
  return address;
}

BOOL MLRNFFIReleaseLayer(uintptr_t address) {
  std::vector<CAMetalLayer *> released;
  {
    std::lock_guard<std::mutex> lock(registryMutex());
    auto found = registry().find(address);
    if (found == registry().end()) {
      return NO;
    }
    released.push_back(found->second);
    registry().erase(found);
  }
  releaseOnMain(std::move(released));
  return YES;
}

NSUInteger MLRNFFIReleaseAllLayers(void) {
  std::vector<CAMetalLayer *> released;
  {
    std::lock_guard<std::mutex> lock(registryMutex());
    for (auto &entry : registry()) {
      released.push_back(entry.second);
    }
    registry().clear();
  }
  const NSUInteger count = released.size();
  releaseOnMain(std::move(released));
  return count;
}
