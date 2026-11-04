import { MetalLayerLease } from "@/modules/native-ffi/MetalLayerLease";

interface Deferred {
  promise: Promise<void>;
  resolve(): void;
  reject(error: unknown): void;
}

function deferred(): Deferred {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Lets every queued promise reaction run.
async function flush(): Promise<void> {
  for (let i = 0; i < 10; i += 1) {
    await Promise.resolve();
  }
}

// A render session as the lease sees it: a close that settles when the test
// says so, and the order of the calls the test cares about.
function fakeSession(calls: string[]) {
  const closing = deferred();
  const ready = deferred();
  const session = {
    close: jest.fn(() => {
      calls.push("close");
      return closing.promise;
    }),
  };
  return { session, closing, ready };
}

const LAYER = "105553116266496";

describe("MetalLayerLease", () => {
  let calls: string[];
  let release: jest.Mock<void, [string]>;

  beforeEach(() => {
    calls = [];
    release = jest.fn((layer: string) => {
      calls.push(`release ${layer}`);
    });
  });

  it("passes the layer address as a bigint to the attach", () => {
    const lease = new MetalLayerLease(LAYER, release);
    const { session } = fakeSession(calls);
    const attach = jest.fn(() => session);

    expect(lease.attach(attach)).toBe(session);
    expect(attach).toHaveBeenCalledWith(BigInt(LAYER));
  });

  it("releases the layer only after the session's close resolves", async () => {
    const lease = new MetalLayerLease(LAYER, release);
    const { session, closing, ready } = fakeSession(calls);
    lease.attach(() => session);
    ready.resolve();

    const ended = lease.end();
    await flush();

    expect(session.close).toHaveBeenCalledTimes(1);
    expect(release).not.toHaveBeenCalled();

    closing.resolve();
    await ended;

    expect(calls).toEqual(["close", `release ${LAYER}`]);
  });

  it("closes a session that is not ready yet, and releases the layer once", async () => {
    const lease = new MetalLayerLease(LAYER, release);
    // The attach never becomes ready: the view unmounts first.
    const { session, closing } = fakeSession(calls);
    lease.attach(() => session);

    const first = lease.end();
    const second = lease.end();
    expect(second).toBe(first);
    await flush();

    expect(session.close).toHaveBeenCalledTimes(1);
    expect(release).not.toHaveBeenCalled();

    closing.resolve();
    await first;
    await lease.end();

    expect(calls).toEqual(["close", `release ${LAYER}`]);
  });

  it("holds a rejected close's layer until the close settles, then releases it once", async () => {
    const lease = new MetalLayerLease(LAYER, release);
    const { session, closing } = fakeSession(calls);
    lease.attach(() => session);

    const ended = lease.end();
    await flush();
    expect(release).not.toHaveBeenCalled();

    const failure = new Error("dispose failed");
    closing.reject(failure);

    await expect(ended).rejects.toBe(failure);
    await expect(lease.end()).rejects.toBe(failure);
    expect(calls).toEqual(["close", `release ${LAYER}`]);
  });

  it("releases a layer that was never attached once", async () => {
    const lease = new MetalLayerLease(LAYER, release);

    await lease.end();
    await lease.end();

    expect(calls).toEqual([`release ${LAYER}`]);
  });

  it("refuses an attach after the lease ended", async () => {
    const lease = new MetalLayerLease(LAYER, release);
    await lease.end();
    const attach = jest.fn();

    expect(() => lease.attach(attach)).toThrow(/ended/);
    expect(attach).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("refuses a second attach while a session holds the layer", () => {
    const lease = new MetalLayerLease(LAYER, release);
    const { session } = fakeSession(calls);
    lease.attach(() => session);
    const attach = jest.fn();

    expect(() => lease.attach(attach)).toThrow(/attached/);
    expect(attach).not.toHaveBeenCalled();
  });

  it("releases the layer at once when the attach throws, since no session holds it", async () => {
    const lease = new MetalLayerLease(LAYER, release);
    const failure = new Error("unsupported");

    expect(() =>
      lease.attach(() => {
        throw failure;
      }),
    ).toThrow(failure);
    expect(calls).toEqual([`release ${LAYER}`]);

    await lease.end();
    expect(release).toHaveBeenCalledTimes(1);
  });
});
