import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { cartItem, order, pizza } from "../src/test/fixtures";

import type { Page } from "@playwright/test";

const menu = [
  pizza,
  { ...pizza, id: 2, name: "Carbonara", unitPrice: 16 },
  { ...pizza, id: 3, name: "Sold out special", soldOut: true },
];

test.beforeEach(async ({ page }) => {
  await page.route("**/api/menu", async (route) => {
    await route.fulfill({ json: { data: menu } });
  });
  await page.route("**/api/order/ABC123", async (route) => {
    await route.fulfill({ json: { data: order } });
  });
});

test("browseMenu_addAndAdjustItems_calculatesCart", async ({ page }) => {
  await page.goto("/menu");
  await expect(
    page.getByRole("heading", { name: "The pizza menu." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add Sold out special to cart" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Add Margherita to cart" }).click();
  await page
    .getByRole("button", { name: "Increase Margherita quantity" })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Cart summary" }),
  ).toContainText("€24.00");
  await page.getByRole("link", { name: "Open cart" }).click();
  await expect(page.getByRole("heading", { name: "Your cart." })).toBeVisible();
  await page
    .getByRole("button", { name: "Decrease Margherita quantity" })
    .click();
  await expect(
    page.getByLabel("Margherita quantity", { exact: true }),
  ).toHaveText("1");
  await page.getByRole("button", { name: "Remove Margherita" }).click();
  await expect(
    page.getByRole("heading", { name: "Your cart is empty." }),
  ).toBeVisible();
});

test("clearCart_populatedCart_showsEmptyState", async ({ page }) => {
  await addPizza(page);
  await page.getByRole("link", { name: "Open cart" }).click();
  await page.getByRole("button", { name: "Clear cart" }).click();
  await expect(
    page.getByRole("heading", { name: "Your cart is empty." }),
  ).toBeVisible();
});

test("checkout_validDetails_createsOneOrder", async ({ page }) => {
  const requests: unknown[] = [];
  await page.route("**/api/order", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ json: { data: { id: "ABC123" } } });
  });
  await openCheckout(page);
  await fillCheckout(page);
  await page.getByLabel("Make it a priority").check();
  await page.getByRole("button", { name: "Place demo order · €14.40" }).click();
  await expect(
    page.getByRole("heading", { name: "Order #ABC123" }),
  ).toBeVisible();
  expect(requests).toEqual([
    {
      customer: "Demo Guest",
      phone: "+359 888 123 456",
      address: "1 Demo Street, Sofia",
      priority: true,
      position: "",
      cart: [cartItem],
    },
  ]);
  await page.getByRole("link", { name: "Your cart", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your cart is empty." }),
  ).toBeVisible();
});

test("checkout_invalidPhone_keepsFormAndCart", async ({ page }) => {
  await openCheckout(page);
  await fillCheckout(page);
  await page.getByLabel("Phone number").fill("123");
  await page.getByRole("button", { name: /Place demo order/ }).click();
  await expect(
    page.getByText("Enter a phone number with 7 to 15 digits."),
  ).toBeVisible();
  await expect(page.getByLabel("Phone number")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByLabel("First name")).toHaveValue("Demo Guest");
  await expect(
    page.getByRole("complementary", { name: "Cart summary" }),
  ).toContainText("1 pizza");
});

test("checkout_serviceFailure_preservesDetailsForRetry", async ({ page }) => {
  await page.route("**/api/order", async (route) => {
    await route.fulfill({ status: 503, json: { message: "Unavailable" } });
  });
  await openCheckout(page);
  await fillCheckout(page);
  await page.getByRole("button", { name: /Place demo order/ }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Failed creating your order",
  );
  await expect(page.getByLabel("Delivery address")).toHaveValue(
    "1 Demo Street, Sofia",
  );
  await expect(
    page.getByRole("button", { name: /Place demo order/ }),
  ).toBeEnabled();
});

test("priorityUpdate_success_revalidatesOrder", async ({ page }) => {
  let priority = false;
  await page.route("**/api/order/ABC123", async (route) => {
    if (route.request().method() === "PATCH") {
      expect(route.request().postDataJSON()).toEqual({ priority: true });
      priority = true;
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fulfill({
      json: { data: { ...order, priority, priorityPrice: priority ? 2.4 : 0 } },
    });
  });
  await page.goto("/order/ABC123");
  await page.getByRole("button", { name: "Make priority" }).click();
  await expect(page.getByRole("button", { name: "Make priority" })).toHaveCount(
    0,
  );
  await expect(page.getByText("€14.40")).toBeVisible();
});

test("priorityUpdate_failure_keepsOrderVisible", async ({ page }) => {
  await page.route("**/api/order/ABC123", async (route) => {
    await route.fulfill(
      route.request().method() === "PATCH"
        ? { status: 503 }
        : { json: { data: order } },
    );
  });
  await page.goto("/order/ABC123");
  await page.getByRole("button", { name: "Make priority" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Failed updating your order",
  );
  await expect(
    page.getByRole("heading", { name: "Order #ABC123" }),
  ).toBeVisible();
});

test("menu_serviceFailure_offersRecovery", async ({ page }) => {
  await page.route("**/api/menu", async (route) => {
    await route.fulfill({ status: 503 });
  });
  await page.goto("/menu");
  await expect(page.getByRole("alert")).toContainText("Failed getting menu");
  await page.unroute("**/api/menu");
  await page.route("**/api/menu", async (route) => {
    await route.fulfill({ json: { data: menu } });
  });
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "The pizza menu." }),
  ).toBeVisible();
});

test("menu_malformedResponse_showsRecoverableError", async ({ page }) => {
  await page.route("**/api/menu", async (route) => {
    await route.fulfill({ json: { data: [{ id: 1 }] } });
  });
  await page.goto("/menu");
  await expect(page.getByRole("alert")).toContainText(
    "menu is temporarily unavailable",
  );
});

test("navigation_unknownPage_showsNotFound", async ({ page }) => {
  await page.goto("/not-a-page");
  await expect(
    page.getByRole("heading", { name: "This page is off the menu." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to menu" }).click();
  await expect(
    page.getByRole("heading", { name: "The pizza menu." }),
  ).toBeVisible();
});

test("searchOrder_unknownId_showsLookupError", async ({ page }) => {
  await page.route("**/api/order/MISSING", async (route) => {
    await route.fulfill({ status: 404 });
  });
  await page.goto("/");
  await page.getByLabel("Order number").fill(" MISSING ");
  await page.getByRole("button", { name: "Find order" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Couldn't find order #MISSING",
  );
});

test("location_permissionDenied_allowsManualAddress", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition(
          _success: PositionCallback,
          failure: PositionErrorCallback,
        ) {
          failure({ code: 1, message: "Denied" } as GeolocationPositionError);
        },
      },
    });
  });
  await openCheckout(page);
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(
    page.getByText("There was a problem getting your address.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByLabel("Delivery address").fill("1 Demo Street, Sofia");
  await expect(
    page.getByRole("button", { name: /Place demo order/ }),
  ).toBeEnabled();
});

test("location_zeroCoordinates_acceptsSuggestion", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition(success: PositionCallback) {
          success({
            coords: { latitude: 0, longitude: 0 },
          } as GeolocationPosition);
        },
      },
    });
  });
  await page.route("**/reverse-geocode-client?*", async (route) => {
    await route.fulfill({
      json: { city: "Demo City", countryName: "Demo Country" },
    });
  });
  await openCheckout(page);
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByLabel("Delivery address")).toHaveValue(
    "Demo City, Demo Country",
  );
  await expect(page.locator('input[name="position"]')).toHaveValue("0,0");
});

test("keyboard_startOrdering_trimsName", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("What should we call you?")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.getByLabel("What should we call you?").fill("  Demo Guest  ");
  await page.getByLabel("What should we call you?").press("Enter");
  await expect(
    page.getByRole("heading", { name: "The pizza menu." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add Margherita to cart" }).click();
  await page.getByRole("link", { name: "Open cart" }).click();
  await expect(
    page.getByRole("heading", { name: "Your cart, Demo Guest." }),
  ).toBeVisible();
});

test("accessibility_corePages_haveNoViolationsOrOverflow", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await checkAccessibility(page);
  await page.screenshot({
    path: testInfo.outputPath("home.png"),
    fullPage: true,
  });
  await addPizza(page);
  await checkAccessibility(page);
  await page.screenshot({
    path: testInfo.outputPath("menu.png"),
    fullPage: true,
  });
  await page.getByRole("link", { name: "Open cart" }).click();
  await checkAccessibility(page);
  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await checkAccessibility(page);
  await page.screenshot({
    path: testInfo.outputPath("checkout.png"),
    fullPage: true,
  });
  await page.goto("/order/ABC123");
  await expect(
    page.getByRole("heading", { name: "Order #ABC123" }),
  ).toBeVisible();
  await checkAccessibility(page);
  expect(errors).toEqual([]);
});

async function addPizza(page: Page) {
  await page.goto("/menu");
  await page.getByRole("button", { name: "Add Margherita to cart" }).click();
}

async function openCheckout(page: Page) {
  await addPizza(page);
  await page.getByRole("link", { name: "Open cart" }).click();
  await page.getByRole("link", { name: "Continue to checkout" }).click();
}

async function fillCheckout(page: Page) {
  await page.getByLabel("First name").fill("Demo Guest");
  await page.getByLabel("Phone number").fill("+359 888 123 456");
  await page.getByLabel("Delivery address").fill("1 Demo Street, Sofia");
}

async function checkAccessibility(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= globalThis.innerWidth,
    ),
  ).toBe(true);
}
