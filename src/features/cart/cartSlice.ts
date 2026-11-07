import { createSlice } from "@reduxjs/toolkit";

import type { CartItem } from "../../types";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState: { cart: CartItem[] } = {
  cart: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.cart.find(
        (item) => item.pizzaId === action.payload.pizzaId,
      );

      if (existing) {
        existing.quantity = Math.min(
          99,
          existing.quantity + action.payload.quantity,
        );
        existing.totalPrice = existing.unitPrice * existing.quantity;
        return;
      }

      state.cart.push({
        ...action.payload,
        totalPrice: action.payload.unitPrice * action.payload.quantity,
      });
    },
    deleteItem(state, action: PayloadAction<number>) {
      state.cart = state.cart.filter((item) => item.pizzaId !== action.payload);
    },
    increaseItemQuantity(state, action: PayloadAction<number>) {
      const item = state.cart.find((item) => item.pizzaId === action.payload);

      if (!item || item.quantity >= 99) {
        return;
      }

      ++item.quantity;
      item.totalPrice = item.unitPrice * item.quantity;
    },
    decreaseItemQuantity(state, action: PayloadAction<number>) {
      const item = state.cart.find((item) => item.pizzaId === action.payload);

      if (!item) {
        return;
      }

      --item.quantity;
      item.totalPrice = item.unitPrice * item.quantity;

      if (item.quantity === 0) cartSlice.caseReducers.deleteItem(state, action);
    },
    clearCart(state) {
      state.cart = [];
    },
  },
});

export default cartSlice.reducer;

export const {
  addItem,
  deleteItem,
  increaseItemQuantity,
  decreaseItemQuantity,
  clearCart,
} = cartSlice.actions;

type CartState = { cart: typeof initialState };

export const getCart = (state: CartState) => state.cart.cart;

export const getTotalCartQuantity = (state: CartState) =>
  state.cart.cart.reduce((sum, item) => item.quantity + sum, 0);

export const getTotalCartPrice = (state: CartState) =>
  state.cart.cart.reduce((sum, item) => item.totalPrice + sum, 0);

export const getCurrentQuantityById = (id: number) => (state: CartState) =>
  state.cart.cart.find((item) => item.pizzaId === id)?.quantity ?? 0;
