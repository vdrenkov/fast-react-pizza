import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../services/apiRestaurant", () => ({
  updateOrder: vi.fn(),
}));

import { action } from "../../../../features/order/UpdateOrder";
import { updateOrder } from "../../../../services/apiRestaurant";

const mockedUpdateOrder = vi.mocked(updateOrder);

describe("UpdateOrder action", () => {
  afterEach(() => {
    mockedUpdateOrder.mockReset();
  });

  it("marks an order as priority", async () => {
    mockedUpdateOrder.mockResolvedValue(undefined);

    const result = await action({ params: { id: "ABC123" } });

    expect(mockedUpdateOrder).toHaveBeenCalledWith("ABC123", {
      priority: true,
    });
    expect(result).toBeNull();
  });
});
