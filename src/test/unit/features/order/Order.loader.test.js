import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../services/apiRestaurant", () => ({
  getOrder: vi.fn(),
}));

import { loader } from "../../../../features/order/Order";
import { getOrder } from "../../../../services/apiRestaurant";

const mockedGetOrder = vi.mocked(getOrder);

describe("Order loader", () => {
  afterEach(() => {
    mockedGetOrder.mockReset();
  });

  it("loads order by route param id", async () => {
    const order = { id: "ABC123" };
    mockedGetOrder.mockResolvedValue(order);

    const request = new Request("http://localhost/order/ABC123");
    const result = await loader({ params: { id: "ABC123" }, request });

    expect(result).toEqual(order);
    expect(mockedGetOrder).toHaveBeenCalledWith("ABC123", request.signal);
  });

  it("propagates service errors", async () => {
    mockedGetOrder.mockRejectedValue(new Error("Couldn't find order #404"));

    await expect(
      loader({
        params: { id: "404" },
        request: new Request("http://localhost/order/404"),
      }),
    ).rejects.toThrow("Couldn't find order #404");
  });
});
