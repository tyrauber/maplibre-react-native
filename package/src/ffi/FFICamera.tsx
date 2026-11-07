import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { FFISessionContext } from "./FFISessionContext";
import {
  type CameraFields,
  limitsCommand,
  type MapCommand,
  stopCommand,
} from "./camera";
import { FFI_CAMERA_PROPS } from "./features";
import type {
  CameraProps,
  CameraRef,
  CameraStop,
} from "../components/camera/Camera";
import type { MapController } from "../components/map/engine/MapController";
import { MapControllerContext } from "../components/map/engine/MapControllerContext";
import { checkEngineProps } from "../components/map/engine/engineProps";

/**
 * The FFI engine's `<Camera>` . It renders nothing: it sends camera commands
 * through the map's controller, which runs them in order once the map is ready.
 *
 * On a mount it sends the limits, then the initial view, then the stop. The
 * initial view goes once per map; the stop goes again whenever it changes.
 */
export function FFICamera(props: CameraProps) {
  const controller = useContext(MapControllerContext);
  const session = useContext(FFISessionContext);
  if (!controller || !session) {
    throw new Error("<Camera>: the FFI camera renders only inside an FFI map");
  }
  // A prop the engine cannot honour throws here. `ref` is not in the table,
  // so it passes through.
  checkEngineProps(
    controller.engine,
    props,
    controller.capabilities,
    FFI_CAMERA_PROPS,
  );
  const {
    ref,
    initialViewState,
    minZoom,
    maxZoom,
    maxBounds,
    center,
    bounds,
    zoom,
    bearing,
    pitch,
    padding,
    duration,
    easing,
  }: CameraProps & CameraFields = props;
  const stop = {
    center,
    bounds,
    zoom,
    bearing,
    pitch,
    padding,
    duration,
    easing,
  } as CameraStop;

  const send = useCallback(
    (command: MapCommand) =>
      controller.run(() => session.withMap(command)).then(() => undefined),
    [controller, session],
  );

  useImperativeHandle(ref, () => {
    const setStop = (next: CameraStop) => {
      const command = stopCommand(next);
      return command ? send(command) : Promise.resolve();
    };
    // Every method returns its command's promise, with the native engine's
    // defaults.
    const methods = {
      setStop,
      jumpTo: ({ center, ...options }) =>
        setStop({ ...options, center, duration: 0, easing: undefined }),
      easeTo: ({ center, duration = 500, easing = "ease", ...options }) =>
        setStop({ ...options, center, duration, easing }),
      flyTo: ({ center, duration = 2000, easing = "fly", ...options }) =>
        setStop({ ...options, center, duration, easing }),
      fitBounds: (
        bounds,
        { duration = 2000, easing = "fly", ...options } = {},
      ) => setStop({ ...options, bounds, duration, easing }),
      zoomTo: (zoom, { duration = 500, easing = "ease", ...options } = {}) =>
        setStop({ ...options, zoom, duration, easing }),
    } satisfies {
      [Method in keyof CameraRef]: (
        ...args: Parameters<CameraRef[Method]>
      ) => Promise<void>;
    };
    return methods;
  }, [send]);

  const limitsKey = JSON.stringify([minZoom, maxZoom, maxBounds]);
  useEffect(() => {
    const [min, max, bounds] = JSON.parse(limitsKey);
    const command = limitsCommand({
      minZoom: min ?? undefined,
      maxZoom: max ?? undefined,
      maxBounds: bounds ?? undefined,
    });
    if (command) report(controller, send(command));
  }, [controller, send, limitsKey]);

  // The initial view goes to each controller once. Strict Mode and Fast
  // Refresh replace the controller, and so the map, of the same mount.
  const initialSentTo = useRef<MapController | undefined>(undefined);
  const initialView = useRef(initialViewState);
  useEffect(() => {
    if (initialSentTo.current === controller) return;
    initialSentTo.current = controller;
    const view = initialView.current;
    const command =
      view && stopCommand({ ...view, duration: 0, easing: undefined });
    if (command) report(controller, send(command));
  }, [controller, send]);

  const stopKey = JSON.stringify(stop);
  useEffect(() => {
    const command = stopCommand(JSON.parse(stopKey));
    if (command) report(controller, send(command));
  }, [controller, send, stopKey]);

  return null;
}

// A disposed map rejects its queued commands; nobody needs to hear about it.
function report(controller: MapController, result: Promise<unknown>) {
  result.catch((error: unknown) => {
    if (!controller.isDisposed) console.error("[MapLibre FFI]", error);
  });
}
