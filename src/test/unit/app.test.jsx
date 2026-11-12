import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { addItem, clearCart } from "../../features/cart/cartSlice";
import { updateName } from "../../features/user/userSlice";
import { routes } from "../../routes";
import store from "../../store";
import { cartItem, order, pizza } from "../fixtures";

let router;

beforeEach(() => {
  store.dispatch(clearCart());
  store.dispatch(updateName(""));
  vi.spyOn(globalThis, "scrollTo").mockImplementation(() => {});
  vi.spyOn(globalThis, "fetch").mockImplementation(async (url, options) => {
    if (String(url).endsWith("/menu")) {
      return Response.json({
        data: [pizza, { ...pizza, id: 2, name: "Sold out", soldOut: true }],
      });
    }

    if (options?.method === "POST") {
      return Response.json({ data: { id: "ABC123" } });
    }

    return Response.json({ data: order });
  });
});

afterEach(() => {
  cleanup();
  router?.dispose();
  vi.restoreAllMocks();
});

describe("ordering application", () => {
  it("menu_addChangeAndRemovePizza_updatesCartSummary", async () => {
    const user = renderRoute("/menu");
    await user.click(
      await screen.findByRole("button", { name: "Add Margherita to cart" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Increase Margherita quantity" }),
    );
    expect(screen.getByRole("complementary")).toHaveTextContent("€24.00");
    await user.click(screen.getByRole("link", { name: "Open cart" }));
    expect(
      await screen.findByRole("heading", { name: "Your cart." }),
    ).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Decrease Margherita quantity" }),
    );
    expect(
      screen.getByLabelText("Margherita quantity", { exact: true }),
    ).toHaveTextContent("1");
    await user.click(screen.getByRole("button", { name: "Remove Margherita" }));
    expect(
      screen.getByRole("heading", { name: "Your cart is empty." }),
    ).toBeVisible();
  });

  it("home_namedCustomer_continuesToMenu", async () => {
    store.dispatch(updateName("Demo Guest"));
    const user = renderRoute("/");
    await user.click(
      screen.getByRole("link", { name: /Continue ordering, Demo Guest/ }),
    );
    expect(
      await screen.findByRole("heading", { name: "The pizza menu." }),
    ).toBeVisible();
  });

  it("menu_soldOutPizza_hidesAddButton", async () => {
    renderRoute("/menu");

    expect(
      await screen.findByRole("heading", { name: "Sold out" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Add Sold out to cart" }),
    ).not.toBeInTheDocument();
  });

  it("home_newCustomer_showsWelcomeForm", () => {
    renderRoute("/");
    expect(screen.getByLabelText("What should we call you?")).toBeVisible();
  });

  it.each([
    [12, 2, 14],
    [13, 3, 16],
    [15, 3, 18],
  ])(
    "checkout_priorityPrice%s_matchesConfirmedTotal",
    async (price, priorityPrice, total) => {
      const item = { ...cartItem, unitPrice: price, totalPrice: price };
      vi.mocked(globalThis.fetch)
        .mockResolvedValueOnce(Response.json({ data: { id: order.id } }))
        .mockResolvedValue(
          Response.json({
            data: {
              ...order,
              cart: [item],
              orderPrice: price,
              priority: true,
              priorityPrice,
            },
          }),
        );
      store.dispatch(addItem(item));
      const user = renderRoute("/order/new");
      expect(
        screen.getByRole("button", { name: `Place order · €${price}.00` }),
      ).toBeVisible();
      await user.type(screen.getByLabelText("First name"), "Demo Guest");
      await user.type(screen.getByLabelText("Phone number"), "+359888123456");
      await user.type(
        screen.getByLabelText("Delivery address"),
        "1 Demo Street",
      );
      await user.click(
        screen.getByLabelText("Make it a priority", { exact: false }),
      );
      await user.click(
        screen.getByRole("button", { name: `Place order · €${total}.00` }),
      );
      expect(
        await screen.findByRole("heading", { name: "Order #ABC123" }),
      ).toBeVisible();
      expect(screen.getByText(`€${total}.00`)).toBeVisible();
      expect(store.getState().cart.cart).toEqual([]);
    },
  );

  it("checkout_invalidPhone_showsAccessibleError", async () => {
    store.dispatch(addItem(cartItem));
    const user = renderRoute("/order/new");
    await user.type(screen.getByLabelText("First name"), "Demo");
    await user.type(screen.getByLabelText("Phone number"), "123");
    await user.type(screen.getByLabelText("Delivery address"), "Demo Street");
    await user.click(screen.getByRole("button", { name: /Place order/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "check the highlighted details",
    );
    expect(screen.getByLabelText("Phone number")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("checkout_networkFailure_preservesDetailsAndCart", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new TypeError("Offline"));
    store.dispatch(addItem(cartItem));
    const user = renderRoute("/order/new");

    await user.type(screen.getByLabelText("First name"), "Demo Guest");
    await user.type(screen.getByLabelText("Phone number"), "+359888123456");
    await user.type(screen.getByLabelText("Delivery address"), "1 Demo Street");
    await user.click(screen.getByRole("button", { name: /Place order/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Check your connection",
    );
    expect(screen.getByLabelText("First name")).toHaveValue("Demo Guest");
    expect(screen.getByLabelText("Delivery address")).toHaveValue(
      "1 Demo Street",
    );
    expect(store.getState().cart.cart).toEqual([cartItem]);
  });

  it("checkout_emptyCart_showsMenuLink", () => {
    renderRoute("/order/new");
    expect(
      screen.getByRole("link", { name: /Explore the menu/ }),
    ).toBeVisible();
  });

  it("order_refreshStatus_reloadsOrder", async () => {
    const user = renderRoute("/order/ABC123");
    await user.click(
      await screen.findByRole("button", { name: "Refresh status" }),
    );
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(2));
    expect(
      screen.getByRole("heading", { name: /minutes to go/ }),
    ).toBeVisible();
  });

  it("order_delivered_hidesPriorityUpgrade", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      Response.json({
        data: {
          ...order,
          status: "delivered",
          priority: true,
          priorityPrice: 2,
        },
      }),
    );
    renderRoute("/order/ABC123");
    expect(
      await screen.findByRole("heading", { name: "Enjoy every slice." }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Make priority" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("€14.00")).toBeVisible();
  });

  it("order_priorityUpgrade_updatesStatusAndTotal", async () => {
    let priority = false;
    vi.mocked(globalThis.fetch).mockImplementation(
      async (_requestUrl, options) => {
        if (options?.method === "PATCH") {
          priority = true;
          return new Response(null, { status: 204 });
        }

        return Response.json({
          data: { ...order, priority, priorityPrice: priority ? 2 : 0 },
        });
      },
    );
    const user = renderRoute("/order/ABC123");

    expect(
      await screen.findByText("Skip the queue for an extra €2.00."),
    ).toBeVisible();
    await user.click(
      await screen.findByRole("button", { name: "Make priority" }),
    );

    expect(
      await screen.findAllByText("Priority", { exact: true }),
    ).toHaveLength(2);
    expect(screen.getByText("€14.00")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Make priority" }),
    ).not.toBeInTheDocument();
  });

  it("navigation_unknownRoute_showsRecoveryLink", async () => {
    renderRoute("/missing");
    expect(
      await screen.findByRole("heading", {
        name: "This page is off the menu.",
      }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Back to menu" })).toHaveAttribute(
      "href",
      "/menu",
    );
  });

  it("menu_emptyResponse_showsEmptyMessage", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(Response.json({ data: [] }));
    renderRoute("/menu");
    expect(
      await screen.findByText(/The menu is empty right now/),
    ).toBeVisible();
  });

  it("menu_networkFailure_showsActionableError", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new TypeError("Offline"));
    renderRoute("/menu");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Check your connection",
    );
  });
});

function renderRoute(path) {
  router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
  return userEvent.setup();
}
