import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createOrder,
  getMenu,
  getOrder,
  updateOrder,
} from "../../../services/apiRestaurant";

describe("apiRestaurant", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns menu data when the menu request succeeds", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ id: 1, name: "Margherita" }] }),
    });

    const menu = await getMenu();

    expect(menu).toEqual([{ id: 1, name: "Margherita" }]);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://react-fast-pizza-api.jonas.io/api/menu",
    );
  });

  it("throws when the menu request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false });

    await expect(getMenu()).rejects.toThrow("Failed getting menu");
  });

  it("returns order data when the order request succeeds", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: "ABC123", status: "preparing" } }),
    });

    const order = await getOrder("ABC123");

    expect(order).toEqual({ id: "ABC123", status: "preparing" });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://react-fast-pizza-api.jonas.io/api/order/ABC123",
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
