import { redirect } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { clearCart } from "../../../../features/cart/cartSlice";
import { action } from "../../../../features/order/CreateOrder";
import { createOrder } from "../../../../services/apiRestaurant";
import store from "../../../../store";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    redirect: vi.fn((to) => ({ to, status: 302 })),
  };
});

vi.mock("../../../../services/apiRestaurant", () => ({
  createOrder: vi.fn(),
}));

vi.mock("../../../../store", () => ({
  default: {
    dispatch: vi.fn(),
  },
}));

const mockedCreateOrder = vi.mocked(createOrder);
const mockedRedirect = vi.mocked(redirect);
const mockedDispatch = vi.mocked(store.dispatch);

function buildRequest(payload) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    formData.append(key, value);
  }

  return new Request("http://localhost/order/new", {
    method: "POST",
    body: formData,
  });
}

describe("CreateOrder action", () => {
  afterEach(() => {
    mockedCreateOrder.mockReset();
    mockedRedirect.mockClear();
    mockedDispatch.mockClear();
  });

  it("returns phone validation errors for invalid phone numbers", async () => {
    const request = buildRequest({
      customer: "Valentin",
      phone: "invalid",
      address: "Sofia",
      cart: JSON.stringify([{ pizzaId: 1, quantity: 1 }]),
      priority: "false",
      position: "",
    });

    const result = await action({ request });

    expect(result).toEqual({
      phone:
        "Please, give us your correct phone number. We might need it to contact you.",
    });
    expect(mockedCreateOrder).not.toHaveBeenCalled();
    expect(mockedDispatch).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("creates an order, clears the cart, and redirects on success", async () => {
    mockedCreateOrder.mockResolvedValue({ id: "ABC123" });

    const request = buildRequest({
      customer: "Valentin",
      phone: "+359 888 123 456",
      address: "Sofia",
      cart: JSON.stringify([{ pizzaId: 1, quantity: 2 }]),
      priority: "true",
      position: "42.6977,23.3219",
    });

    const result = await action({ request });

    expect(mockedCreateOrder).toHaveBeenCalledWith({
      customer: "Valentin",
      phone: "+359 888 123 456",
      address: "Sofia",
      cart: [{ pizzaId: 1, quantity: 2 }],
      priority: true,
      position: "42.6977,23.3219",
    });
    expect(mockedDispatch).toHaveBeenCalledWith(clearCart());
    expect(mockedRedirect).toHaveBeenCalledWith("/order/ABC123");
    expect(result).toEqual({ to: "/order/ABC123", status: 302 });
  });
});
