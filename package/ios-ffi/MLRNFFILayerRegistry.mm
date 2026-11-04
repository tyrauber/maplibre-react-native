#import "MLRNFFILayerRegistry.h"

#include <mutex>
#include <unordered_map>
#include <vector>

#if !__has_feature(objc_arc)
#error "MLRNFFILayerRegistry counts on ARC to hold and let go of layers"
#endif

namespace {

std::mutex &registryMutex() {
  static std::mutex mutex;
  return mutex;
}

// Every map and counter below is touched only under registryMutex().

// Mounted surfaces, by surface token. Weak: the view owns its layer, and
// unmounting erases the entry. So this map never keeps a layer alive, and a
// layer that is gone reads as nil, which leases nothing.
std::unordered_map<uint64_t, __weak CAMetalLayer *> &surfaces() {
  static auto *map = new std::unordered_map<uint64_t, __weak CAMetalLayer *>();
  return *map;
}

// One strong hold per lease, by lease token.
std::unordered_map<uint64_t, CAMetalLayer *> &leases() {
  static auto *map = new std::unordered_map<uint64_t, CAMetalLayer *>();
  return *map;
}

uint64_t nextSurface = 1;
uint64_t nextLease = 1;

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

uint64_t MLRNFFIMountSurface(CAMetalLayer *layer) {
  std::lock_guard<std::mutex> lock(registryMutex());
  const uint64_t surface = nextSurface++;
  surfaces().emplace(surface, layer);
  return surface;
}

void MLRNFFIUnmountSurface(uint64_t surface) {
  std::lock_guard<std::mutex> lock(registryMutex());
  surfaces().erase(surface);
}

MLRNFFILayerLease MLRNFFILeaseLayer(uint64_t surface) {
  std::lock_guard<std::mutex> lock(registryMutex());
  auto found = surfaces().find(surface);
  if (found == surfaces().end()) {
    return {0, 0};
  }
  // A strong reference, or nil when the layer already deallocated.
  CAMetalLayer *layer = found->second;
  if (layer == nil) {
    return {0, 0};
  }
  const uint64_t lease = nextLease++;
  leases().emplace(lease, layer);
  return {lease, reinterpret_cast<uintptr_t>((__bridge void *)layer)};
}

BOOL MLRNFFIReleaseLease(uint64_t lease) {
  std::vector<CAMetalLayer *> released;
  {
    std::lock_guard<std::mutex> lock(registryMutex());
    auto found = leases().find(lease);
    if (found == leases().end()) {
      return NO;
    }
    released.push_back(found->second);
    leases().erase(found);
  }
  releaseOnMain(std::move(released));
  return YES;
}

NSUInteger MLRNFFIReleaseAllLayers(void) {
  std::vector<CAMetalLayer *> released;
  {
    std::lock_guard<std::mutex> lock(registryMutex());
    for (auto &entry : leases()) {
      released.push_back(entry.second);
    }
    leases().clear();
  }
  const NSUInteger count = released.size();
  releaseOnMain(std::move(released));
  return count;
}
