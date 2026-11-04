import { createMapController } from "@/components/map/engine/MapController";

describe("MapController", () => {
  test("holds commands until ready, then runs them in order", async () => {
    const controller = createMapController();
    const order: string[] = [];

    const first = controller.run(() => {
      order.push("first");
      return 1;
    });
    const second = controller.run(async () => {
      order.push("second");
      return 2;
    });

    await Promise.resolve();
    expect(order).toEqual([]);
    expect(controller.isReady).toBe(false);

    controller.setReady();
    const third = controller.run(() => {
      order.push("third");
      return 3;
    });

    await expect(Promise.all([first, second, third])).resolves.toEqual([
      1, 2, 3,
    ]);
    expect(order).toEqual(["first", "second", "third"]);
    expect(controller.isReady).toBe(true);
    await expect(controller.ready).resolves.toBeUndefined();
  });

  test("a failing command rejects only its own promise", async () => {
    const controller = createMapController();
    const failing = controller.run(() => {
      throw new Error("boom");
    });
    const after = controller.run(() => "ok");

    controller.setReady();

    await expect(failing).rejects.toThrow("boom");
    await expect(after).resolves.toBe("ok");
  });

  test("notifies subscribers on ready and on dispose", () => {
    const controller = createMapController();
    const listener = jest.fn();
    const unsubscribe = controller.subscribe(listener);

    controller.setReady();
    controller.setReady();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    controller.dispose();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("rejects queued and new commands after dispose", async () => {
    const controller = createMapController();
    const command = jest.fn();
    const queued = controller.run(command);

    controller.dispose();
    controller.setReady();

    await expect(queued).rejects.toThrow(/disposed/);
    await expect(controller.run(command)).rejects.toThrow(/disposed/);
    await expect(controller.ready).rejects.toThrow(/disposed/);
    expect(command).not.toHaveBeenCalled();
    expect(controller.isReady).toBe(false);
    expect(controller.isDisposed).toBe(true);
  });

  test("rejects commands after dispose once ready", async () => {
    const controller = createMapController();
    controller.setReady();
    controller.dispose();

    await expect(controller.run(() => 1)).rejects.toThrow(/disposed/);
  });

  test("exposes its capabilities", () => {
    const controller = createMapController({ capabilities: ["camera"] });

    expect(controller.capabilities.has("camera")).toBe(true);
    expect(controller.capabilities.has("sources")).toBe(false);
  });
});
