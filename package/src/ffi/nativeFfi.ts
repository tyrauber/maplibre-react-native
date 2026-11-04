/**
 * The subset of `@maplibre/native-ffi-react-native` that the FFI engine uses.
 *
 * The package is not on npm yet, so the type checker cannot resolve it. These
 * local interfaces describe only what this module calls. They are not module
 * declarations, so they will not clash with the package's own types once it is
 * installed.
 *
 * Loading the package installs its binding, and throws when the app does not
 * link it. Only the `/ffi` entry point reaches this module.
 */
import type { ComponentType } from "react";
import type { NativeSyntheticEvent, ViewProps } from "react-native";

export interface LogicalSize {
  width: number;
  height: number;
}

export interface RuntimeEvent {
  readonly type: number;
  readonly source: bigint;
  readonly message: string;
}

export interface StyleSourceInfo {
  readonly id: string;
  readonly attribution: string;
}

export interface RenderFrameResult {
  readonly disposition: number;
}

export type SurfaceHandles =
  | { readonly kind: "android"; readonly window: bigint }
  | { readonly kind: "metal"; readonly layer: bigint };

export interface RenderSessionAttachOptions {
  driver: number;
  frameWake?: { callback: () => void };
}

export interface RenderSessionHandle {
  readonly ready: Promise<void>;
  readonly discarding: { resize(logicalSize: LogicalSize): void };
  demandFrame(demand: { flags?: number }): void;
  drainFrameResults(): readonly RenderFrameResult[];
  release(): Promise<void>;
  releaseTarget(): Promise<void>;
  setMetalSurfaceTarget(replacement: {
    logicalSize: LogicalSize;
    layer: bigint;
  }): Promise<void>;
  setAndroidSurfaceTarget(replacement: {
    logicalSize: LogicalSize;
    window: bigint;
  }): Promise<void>;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface LatLngBounds {
  southwest: LatLng;
  northeast: LatLng;
}

export interface EdgeInsets {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

/** A timing curve from (0, 0) to (1, 1) with two control points. */
export interface UnitBezier {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface AnimationOptions {
  durationMs?: number;
  easing?: UnitBezier;
}

export interface CameraUpdate {
  mode?: number;
  camera?: {
    center?: LatLng;
    padding?: EdgeInsets;
    zoom?: number;
    bearing?: number;
    pitch?: number;
  };
  animation?: AnimationOptions;
}

export interface CameraFitUpdate {
  mode?: number;
  fit?: { padding?: EdgeInsets; bearing?: number; pitch?: number };
  animation?: AnimationOptions;
}

export interface BoundOptions {
  bounds?: LatLngBounds;
  minZoom?: number;
  maxZoom?: number;
}

export interface MapHandle {
  readonly id: bigint;
  readonly ready: Promise<void>;
  readonly discarding: {
    setStyleUrl(url: string): void;
    /** Takes a JSON value, which the binding serializes itself. */
    setStyleJson(json: unknown): void;
  };
  listStyleSources(): Promise<readonly StyleSourceInfo[]>;
  updateCamera(update: CameraUpdate): Promise<unknown>;
  fitCameraToLatLngBounds(
    bounds: LatLngBounds,
    update: CameraFitUpdate,
  ): Promise<unknown>;
  setBounds(options: BoundOptions): Promise<unknown>;
  attachMetalSurface(
    descriptor: { logicalSize: LogicalSize; layer: bigint },
    options: RenderSessionAttachOptions,
  ): RenderSessionHandle;
  attachAndroidSurface(
    descriptor: { logicalSize: LogicalSize; window: bigint },
    device: undefined,
    options: RenderSessionAttachOptions,
  ): RenderSessionHandle;
  dispose(): void;
}

export interface RuntimeHandle {
  createMap(options: {
    initialExtent: LogicalSize & { scaleFactor: number };
    mapMode: number;
    eventMask: bigint;
  }): MapHandle;
  readonly discarding: {
    setEventHandler(handler: {
      callback: (events: readonly RuntimeEvent[]) => void;
    }): void;
  };
  dispose(): void;
}

export type SurfaceEvent = NativeSyntheticEvent<{ surface: number }>;

export interface MaplibreSurfaceViewProps extends ViewProps {
  onSurfaceAvailable?: (event: SurfaceEvent) => void;
  onSurfaceLost?: (event: SurfaceEvent) => void;
}

export interface NativeFfi {
  RuntimeHandle: { create(): Promise<RuntimeHandle> };
  MaplibreSurfaceView: ComponentType<MaplibreSurfaceViewProps>;
  surfaces: {
    acquire(surface: number): SurfaceHandles | undefined;
    release(surface: number): void;
  };
  MapMode: { readonly continuous: number };
  CameraUpdateMode: {
    readonly jump: number;
    readonly ease: number;
    readonly fly: number;
  };
  RenderDriverKind: { readonly coreWorker: number };
  FrameDemandFlag: { readonly waitForUpdate: number };
  RenderResult: { readonly failed: number };
  RuntimeEventFlag: {
    readonly mapStyleLoaded: bigint;
    readonly mapLoadingFailed: bigint;
    readonly mapRenderError: bigint;
    readonly mapSourceChanged: bigint;
  };
  RuntimeEventType: {
    readonly mapStyleLoaded: number;
    readonly mapLoadingFailed: number;
    readonly mapRenderError: number;
    readonly mapSourceChanged: number;
  };
}

// A literal specifier, so that Metro bundles the package statically.
export const nativeFfi: NativeFfi = require("@maplibre/native-ffi-react-native");
