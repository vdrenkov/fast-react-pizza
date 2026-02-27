import { describe, expect, it } from "vitest";

import reducer, {
  addItem,
  clearCart,
  decreaseItemQuantity,
  deleteItem,
  getCart,
  getCurrentQuantityById,
  getTotalCartPrice,
  getTotalCartQuantity,
  increaseItemQuantity,
} from "../../../../features/cart/cartSlice";

const margherita = {
  pizzaId: 1,
  name: "Margherita",
  quantity: 1,
  unitPrice: 10,
  totalPrice: 10,
};

const carbonara = {
  pizzaId: 2,
  name: "Carbonara",
  quantity: 2,
  unitPrice: 12,
  totalPrice: 24,
};

describe("cartSlice", () => {
  it("returns initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({ cart: [] });
  });

  it("adds and deletes items", () => {
    const withOne = reducer(undefined, addItem(margherita));
    expect(withOne.cart).toEqual([margherita]);

    const afterDelete = reducer(withOne, deleteItem(margherita.pizzaId));
    expect(afterDelete.cart).toEqual([]);
  });

  it("increases and decreases quantity", () => {
    const state = { cart: [carbonara] };

    const increased = reducer(state, increaseItemQuantity(carbonara.pizzaId));
    expect(increased.cart[0].quantity).toBe(3);
    expect(increased.cart[0].totalPrice).toBe(36);

    const decreased = reducer(increased, decreaseItemQuantity(carbonara.pizzaId));
    expect(decreased.cart[0].quantity).toBe(2);
    expect(decreased.cart[0].totalPrice).toBe(24);
  });

  it("removes item when quantity reaches zero", () => {
    const state = { cart: [margherita] };
    const result = reducer(state, decreaseItemQuantity(margherita.pizzaId));
    expect(result.cart).toEqual([]);
  });

  it("clears cart", () => {
    const state = { cart: [margherita, carbonara] };
    const result = reducer(state, clearCart());
    expect(result.cart).toEqual([]);
  });

  it("computes cart selectors", () => {
    const rootState = { cart: { cart: [margherita, carbonara] } };

    expect(getCart(rootState)).toHaveLength(2);
    expect(getTotalCartQuantity(rootState)).toBe(3);
    expect(getTotalCartPrice(rootState)).toBe(34);
    expect(getCurrentQuantityById(2)(rootState)).toBe(2);
    expect(getCurrentQuantityById(999)(rootState)).toBe(0);
  });
});
