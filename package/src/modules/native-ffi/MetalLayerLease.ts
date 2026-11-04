/**
 * The part of a render session that the lease needs: its close, which settles
 * once the library no longer uses the session's graphics objects.
 */
export interface MetalLayerLeaseSession {
  close(): Promise<void>;
}

/**
 * Experimental: one hold that native code took on a `NativeFFISurface` 's
 * CAMetalLayer, from `NativeFFIManager.leaseLayer()` .
 *
 * The MapLibre Native C API renders to the layer until the session's close
 * completes, which is asynchronous. So the lease gives its hold back to native
 * code only after that close settles, and native code keeps the layer alive
 * until then, even when its view is gone. Each lease has its own hold: ending
 * one never lets go of another lease's layer.
 *
 * A close that rejects still releases the layer once it settles: the session
 * then no longer exists to use it, and holding the layer would only leak it.
 */
export class MetalLayerLease<
  Session extends MetalLayerLeaseSession = MetalLayerLeaseSession,
> {
  private session: Session | undefined;
  private ending: Promise<void> | undefined;
  private released = false;

  /**
   * @param layer - The layer's address, in decimal
   * @param token - The hold's token, in decimal
   * @param release - Gives the hold with the token back to native code. It runs at most once.
   */
  constructor(
    readonly layer: string,
    readonly token: string,
    private readonly release: (token: string) => void,
  ) {}

  /** Whether `end()` was called, or an attach failed. */
  get ended(): boolean {
    return this.ending !== undefined;
  }

  /**
   * Starts the one session that renders to the layer.
   *
   * @param start - Attaches the session, such as with `map.attachMetalSurface({ layer,
   *   logicalSize }, options).session`
   * @throws when the lease ended or holds a session. When `start` throws, no session holds the layer, so the lease releases it at once and ends.
   */
  attach(start: (layer: bigint) => Session): Session {
    if (this.ending) {
      throw new Error(`MetalLayerLease(${this.layer}) has ended`);
    }
    if (this.session) {
      throw new Error(`MetalLayerLease(${this.layer}) is already attached`);
    }
    try {
      this.session = start(BigInt(this.layer));
    } catch (error) {
      this.ending = Promise.resolve();
      this.giveBack();
      throw error;
    }
    return this.session;
  }

  /**
   * Closes the session, if any, and releases the layer once the close settles.
   * Stop demanding frames first. Later calls return the same Promise.
   *
   * @returns a Promise that settles after the release, and rejects with the close's error
   */
  end(): Promise<void> {
    if (!this.ending) {
      const session = this.session;
      this.ending = session
        ? settle(() => session.close()).then(
            () => this.giveBack(),
            (error: unknown) => {
              this.giveBack();
              throw error;
            },
          )
        : Promise.resolve().then(() => this.giveBack());
    }
    return this.ending;
  }

  private giveBack(): void {
    if (!this.released) {
      this.released = true;
      this.release(this.token);
    }
  }
}

// A close that throws instead of rejecting still settles as a rejection.
function settle(close: () => Promise<void>): Promise<void> {
  try {
    return Promise.resolve(close());
  } catch (error) {
    return Promise.reject(error);
  }
}
