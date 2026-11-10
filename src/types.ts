import { z } from "zod";

export const pizzaSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  ingredients: z.array(z.string()),
  soldOut: z.boolean(),
  imageUrl: z.url().refine((value) => value.startsWith("https://")),
});

export const cartItemSchema = z.object({
  pizzaId: z.number().int().positive(),
  name: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
});

export const orderSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  priority: z.boolean(),
  priorityPrice: z.number().nonnegative(),
  orderPrice: z.number().nonnegative(),
  estimatedDelivery: z.iso.datetime(),
  cart: z.array(cartItemSchema),
});

export type Pizza = z.infer<typeof pizzaSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Position = { latitude: number; longitude: number };
export type NewOrder = {
  customer: string;
  phone: string;
  address: string;
  priority: boolean;
  position: string;
  cart: CartItem[];
};
