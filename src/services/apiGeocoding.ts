import { z } from "zod";

import type { Position } from "../types";

const addressSchema = z.object({
  locality: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  countryName: z.string().optional(),
});

export async function getAddress({ latitude, longitude }: Position) {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`,
    { signal: AbortSignal.timeout(10_000) },
  );

  if (!response.ok) {
    throw new Error("Failed getting address");
  }

  return addressSchema.parse(await response.json());
}
