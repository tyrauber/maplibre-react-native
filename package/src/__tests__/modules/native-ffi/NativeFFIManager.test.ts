import { NativeFFIManager } from "@/modules/native-ffi/NativeFFIManager";
import type { Spec } from "@/modules/native-ffi/NativeFFIModule";

// Native code as the manager sees it: surfaces that are mounted, and one hold
// per lease token on a surface's layer.
class FakeNativeFFIModule {
  readonly mounted = new Map<string, string>();
  readonly holds = new Map<string, string>();
  private nextLease = 1;

  readonly install = jest.fn(() => true);
  readonly implementation = jest.fn(() => "maplibre-native");

  readonly leaseLayer = jest.fn((surface: string) => {
    const layer = this.mounted.get(surface);
    if (layer === undefined) {
      return null;
    }
    const lease = String(this.nextLease);
    this.nextLease += 1;
    this.holds.set(lease, layer);
    return { lease, layer };
  });

  // Drops exactly the hold of one lease token.
  readonly releaseLayer = jest.fn((lease: string) => {
    this.holds.delete(lease);
  });
}

let mockNativeFFIModule: FakeNativeFFIModule | null;

jest.mock("@/modules/native-ffi/NativeFFIModule", () => ({
  __esModule: true,
  get default(): Spec | null {
    return mockNativeFFIModule as unknown as Spec | null;
  },
}));

const SURFACE = "7";
const LAYER = "105553116266496";

describe("NativeFFIManager.leaseLayer", () => {
  let native: FakeNativeFFIModule;

  beforeEach(() => {
    native = new FakeNativeFFIModule();
    native.mounted.set(SURFACE, LAYER);
    mockNativeFFIModule = native;
  });

  it("gives each lease on one surface its own hold, and ending one leaves the other held", async () => {
    const first = NativeFFIManager.leaseLayer({ surface: SURFACE });
    const second = NativeFFIManager.leaseLayer({ surface: SURFACE });
    if (!first || !second) {
      throw new Error("expected two leases");
    }

    expect(first.layer).toBe(LAYER);
    expect(second.layer).toBe(LAYER);
    expect(first.token).not.toBe(second.token);
    expect([...native.holds.keys()]).toEqual([first.token, second.token]);

    await first.end();

    expect(native.releaseLayer.mock.calls).toEqual([[first.token]]);
    expect([...native.holds]).toEqual([[second.token, LAYER]]);
  });

  it("releases each lease once, so a repeated end changes nothing", async () => {
    const first = NativeFFIManager.leaseLayer({ surface: SURFACE });
    const second = NativeFFIManager.leaseLayer({ surface: SURFACE });
    if (!first || !second) {
      throw new Error("expected two leases");
    }

    await first.end();
    await first.end();
    expect([...native.holds]).toEqual([[second.token, LAYER]]);

    await second.end();
    await first.end();
    await second.end();

    expect(native.releaseLayer.mock.calls).toEqual([
      [first.token],
      [second.token],
    ]);
    expect(native.holds.size).toBe(0);
  });

  it("returns undefined, and holds nothing, for a surface that is gone", () => {
    native.mounted.delete(SURFACE);

    expect(NativeFFIManager.leaseLayer({ surface: SURFACE })).toBeUndefined();
    expect(native.leaseLayer).toHaveBeenCalledWith(SURFACE);
    expect(native.holds.size).toBe(0);
  });

  it("returns undefined when the app does not link the pod", () => {
    mockNativeFFIModule = null;

    expect(NativeFFIManager.leaseLayer({ surface: SURFACE })).toBeUndefined();
    expect(native.leaseLayer).not.toHaveBeenCalled();
  });
});
