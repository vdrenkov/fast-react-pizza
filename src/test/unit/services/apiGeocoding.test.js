import { afterEach, describe, expect, it, vi } from "vitest";

import { getAddress } from "../../../services/apiGeocoding";

describe("apiGeocoding", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns address data for valid coordinates", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ city: "Sofia", countryName: "Bulgaria" }),
    });

    const address = await getAddress({ latitude: 42.6977, longitude: 23.3219 });

    expect(address).toEqual({ city: "Sofia", countryName: "Bulgaria" });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=42.6977&longitude=23.3219",
    );
  });

  it("throws when reverse geocoding fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false });

    await expect(
      getAddress({ latitude: 42.6977, longitude: 23.3219 }),
    ).rejects.toThrow("Failed getting address");
  });
});
