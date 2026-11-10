import type { CartItem, Order, Pizza } from "../types";

export const pizza: Pizza = {
  id: 1,
  name: "Margherita",
  unitPrice: 12,
  ingredients: ["tomato", "mozzarella", "basil"],
  soldOut: false,
  imageUrl:
    "https://dclaevazetcjjkrzczpc.supabase.co/storage/v1/object/public/pizzas/pizza-1.jpg",
};

export const cartItem: CartItem = {
  pizzaId: 1,
  name: "Margherita",
  quantity: 1,
  unitPrice: 12,
  totalPrice: 12,
};

export const order: Order = {
  id: "ABC123",
  status: "preparing",
  priority: false,
  priorityPrice: 0,
  orderPrice: 12,
  estimatedDelivery: "2030-11-07T18:30:00.000Z",
  cart: [cartItem],
};
