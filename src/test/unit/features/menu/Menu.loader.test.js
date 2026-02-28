import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../services/apiRestaurant", () => ({
  getMenu: vi.fn(),
}));

import { loader } from "../../../../features/menu/Menu";
import { getMenu } from "../../../../services/apiRestaurant";

const mockedGetMenu = vi.mocked(getMenu);

describe("Menu loader", () => {
  afterEach(() => {
    mockedGetMenu.mockReset();
  });

  it("returns the loaded menu", async () => {
    const menu = [{ id: 1, name: "Margherita" }];
    mockedGetMenu.mockResolvedValue(menu);

    const result = await loader();

    expect(result).toEqual(menu);
    expect(mockedGetMenu).toHaveBeenCalledTimes(1);
  });
});
