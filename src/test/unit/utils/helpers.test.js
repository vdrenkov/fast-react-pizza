import { afterEach, describe, expect, it, vi } from "vitest";

import { calcMinutesLeft, formatCurrency, formatDate } from "../../../utils/helpers";

describe("helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("formats currency consistently", () => {
    const value = 12.5;
    const expected = new Intl.NumberFormat("en", {
      style: "currency",
      currency: "EUR",
    }).format(value);

    expect(formatCurrency(value)).toBe(expected);
  });

  it("formats date consistently", () => {
    const dateStr = "2026-02-27T10:30:00.000Z";
    const expected = new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));

    expect(formatDate(dateStr)).toBe(expected);
  });

  it("calculates remaining minutes from now", () => {
    const now = new Date("2026-02-27T10:00:00.000Z").getTime();
    vi.spyOn(Date, "now").mockReturnValue(now);

    expect(calcMinutesLeft("2026-02-27T10:07:00.000Z")).toBe(7);
    expect(calcMinutesLeft("2026-02-27T09:58:00.000Z")).toBe(-2);
  });
});
