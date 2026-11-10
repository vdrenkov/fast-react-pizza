import { z } from "zod";

import { orderSchema, pizzaSchema } from "../types";

import type { NewOrder } from "../types";

const API_URL = "https://react-fast-pizza-api.jonas.io/api";

export async function createOrder(newOrder: NewOrder) {
  const response = await request("/order", "Failed creating your order", {
    method: "POST",
    body: JSON.stringify(newOrder),
    headers: { "Content-Type": "application/json" },
  });
  const result = z
    .object({ data: z.object({ id: z.string().min(1) }) })
    .safeParse(await response.json());

  if (!result.success) {
    throw new Error(
      "The order service returned an invalid confirmation. Check your order before retrying.",
    );
  }

  return result.data.data;
}

export async function getMenu(signal?: AbortSignal) {
  const response = await request("/menu", "Failed getting menu", {}, signal);
  const result = z
    .object({ data: z.array(pizzaSchema) })
    .safeParse(await response.json());

  if (!result.success) {
    throw new Error("The menu is temporarily unavailable. Please try again.");
  }

  return result.data.data;
}

export async function getOrder(id: string, signal?: AbortSignal) {
  const response = await request(
    `/order/${encodeURIComponent(id)}`,
    `Couldn't find order #${id}`,
    {},
    signal,
  );
  const result = z
    .object({ data: orderSchema })
    .safeParse(await response.json());

  if (!result.success) {
    throw new Error(
      "The order service returned incomplete details. Please try again.",
    );
  }

  return result.data.data;
}

export async function updateOrder(id: string, update: { priority: true }) {
  await request(
    `/order/${encodeURIComponent(id)}`,
    "Failed updating your order",
    {
      method: "PATCH",
      body: JSON.stringify(update),
      headers: { "Content-Type": "application/json" },
    },
  );
}

async function request(
  path: string,
  message: string,
  options: RequestInit = {},
  signal?: AbortSignal,
) {
  const timeout = AbortSignal.timeout(15_000);
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (exception) {
    if (signal?.aborted) {
      throw exception;
    }

    throw new Error(`${message}. Check your connection and try again.`, {
      cause: exception,
    });
  }

  if (!response.ok) {
    throw new Error(message);
  }

  return response;
}
