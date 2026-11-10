import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createOrder,
  getMenu,
  getOrder,
  updateOrder,
} from "../../../services/apiRestaurant";
import { pizza, order } from "../../fixtures";

describe("apiRestaurant", () => {
  it("getMenu_malformedData_rejectsResponse", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ id: 1 }] }),
    });
    await expect(getMenu()).rejects.toThrow("menu is temporarily unavailable");
  });

  it("getMenu_networkFailure_returnsActionableError", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );
    await expect(getMenu()).rejects.toThrow(
      "Check your connection and try again",
    );
  });

  it("getMenu_cancelledRequest_preservesAbort", async () => {
    const controller = new AbortController();
    controller.abort();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(controller.signal.reason);
    await expect(getMenu(controller.signal)).rejects.toBe(
      controller.signal.reason,
    );
  });

  it("getOrder_malformedData_rejectsResponse", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: "ABC123" } }),
    });
    await expect(getOrder("ABC123")).rejects.toThrow("incomplete details");
  });

  it("getOrder_specialCharacters_encodesPath", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true, json: async () => ({ data: order }) });
    await getOrder("a/b?c");
    expect(fetch).toHaveBeenCalledWith(
      "https://react-fast-pizza-api.jonas.io/api/order/a%2Fb%3Fc",
      expect.any(Object),
    );
  });

  it("createOrder_invalidConfirmation_doesNotPretendSuccess", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    });
    await expect(createOrder({ customer: "Demo" })).rejects.toThrow(
      "invalid confirmation",
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns menu data when the menu request succeeds", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: [pizza] }),
    });

    const menu = await getMenu();

    expect(menu).toEqual([pizza]);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://react-fast-pizza-api.jonas.io/api/menu",
      { signal: expect.any(AbortSignal) },
    );
  });

  it("throws when the menu request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false });

    await expect(getMenu()).rejects.toThrow("Failed getting menu");
  });

  it("returns order data when the order request succeeds", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: order }),
    });

    const result = await getOrder("ABC123");

    expect(result).toEqual(order);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://react-fast-pizza-api.jonas.io/api/order/ABC123",
      { signal: expect.any(AbortSignal) },
    );
  });

  it("throws with an order-specific message when order lookup fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false });

    await expect(getOrder("404")).rejects.toThrow("Couldn't find order #404");
  });

  it("posts a new order and returns created data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: "NEW-1" } }),
    });

    const newOrder = await createOrder({ customer: "Valentin" });

    expect(newOrder).toEqual({ id: "NEW-1" });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://react-fast-pizza-api.jonas.io/api/order",
      {
        method: "POST",
        signal: expect.any(AbortSignal),
        body: JSON.stringify({ customer: "Valentin" }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  });

  it("throws when creating a new order fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false });

    await expect(createOrder({ customer: "Valentin" })).rejects.toThrow(
      "Failed creating your order",
    );
  });

  it("sends a patch request when updating an order", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true });

    await updateOrder("ABC123", { priority: true });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://react-fast-pizza-api.jonas.io/api/order/ABC123",
      {
        method: "PATCH",
        signal: expect.any(AbortSignal),
        body: JSON.stringify({ priority: true }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  });

  it("throws when updating an order fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false });

    await expect(updateOrder("ABC123", { priority: true })).rejects.toThrow(
      "Failed updating your order",
    );
  });
});
