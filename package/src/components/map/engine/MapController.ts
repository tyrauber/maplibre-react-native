import type { ComponentType } from "react";

/**
 * The per-map controller of a non-native engine. `<Map>` makes one per mount
 * and gives it to its children through a private context. Children send it
 * commands; the engine runs them once the map is ready.
 *
 * @internal
 */
export interface MapController {
  /** Resolves when the map is ready. Rejects if disposed first. */
  readonly ready: Promise<void>;
  readonly isReady: boolean;
  readonly isDisposed: boolean;
  /** The engine's name, such as `"ffi"`. */
  readonly engine: string;
  /**
   * What this engine supports, by name: a prop such as `"mapStyle"` or a child
   * such as `"<Camera>"` in JSX form.
   */
  readonly capabilities: ReadonlySet<string>;
  /**
   * The engine's own implementations of `<Map>` children, by the same names as
   * the capabilities, such as `"<Camera>"` .
   */
  readonly components: ReadonlyMap<string, ComponentType<never>>;

  /**
   * Calls `listener` when the controller becomes ready or is disposed. Returns a
   * function that removes it.
   */
  subscribe(listener: () => void): () => void;

  /**
   * Runs `command` once the map is ready. Commands start in the order they were
   * sent; an async command does not hold back the next one. The promise settles
   * with the command's result. Once disposed, queued and new commands reject.
   */
  run<T>(command: () => T | Promise<T>): Promise<T>;

  /** Marks the map ready and starts the queued commands. Called by the engine. */
  setReady(): void;

  /** Rejects queued and future commands. Called by `<Map>` on unmount. */
  dispose(): void;
}

export interface MapControllerOptions {
  /** The engine's name, for errors. */
  engine?: string;
  capabilities?: Iterable<string>;
  components?: Readonly<Record<string, ComponentType<never>>>;
}

function disposedError() {
  return new Error("MapController: the map is disposed");
}

/** @internal */
export function createMapController({
  engine = "custom",
  capabilities = [],
  components = {},
}: MapControllerOptions = {}): MapController {
  let isReady = false;
  let isDisposed = false;
  let queue: { start: () => void; reject: (error: Error) => void }[] = [];
  const listeners = new Set<() => void>();

  let resolveReady!: () => void;
  let rejectReady!: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  // A map disposed before it was ready rejects `ready`; nobody has to wait.
  ready.catch(() => {});

  const notify = () => listeners.forEach((listener) => listener());

  return {
    ready,
    get isReady() {
      return isReady;
    },
    get isDisposed() {
      return isDisposed;
    },
    engine,
    capabilities: new Set(capabilities),
    components: new Map(Object.entries(components)),

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    run(command) {
      if (isDisposed) {
        return Promise.reject(disposedError());
      }
      return new Promise((resolve, reject) => {
        const start = () => {
          try {
            resolve(command());
          } catch (error) {
            reject(error);
          }
        };
        if (isReady) {
          start();
        } else {
          queue.push({ start, reject });
        }
      });
    },

    setReady() {
      if (isReady || isDisposed) return;
      isReady = true;
      const queued = queue;
      queue = [];
      // A command may dispose the map; the rest of the queue then rejects.
      queued.forEach(({ start, reject }) =>
        isDisposed ? reject(disposedError()) : start(),
      );
      resolveReady();
      notify();
    },

    dispose() {
      if (isDisposed) return;
      isDisposed = true;
      const queued = queue;
      queue = [];
      queued.forEach(({ reject }) => reject(disposedError()));
      rejectReady(disposedError());
      notify();
      listeners.clear();
    },
  };
}
