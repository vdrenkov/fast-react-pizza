import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import SearchOrder from "../../../../features/order/SearchOrder";

describe("SearchOrder", () => {
  afterEach(() => {
    mockNavigate.mockReset();
  });

  it("does not navigate when query is empty", () => {
    render(<SearchOrder />);

    const input = screen.getByPlaceholderText("Search order #");
    fireEvent.submit(input.closest("form"));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("navigates to the order page and clears query on submit", () => {
    render(<SearchOrder />);

    const input = screen.getByPlaceholderText("Search order #");
    fireEvent.change(input, { target: { value: "ABC123" } });
    fireEvent.submit(input.closest("form"));

    expect(mockNavigate).toHaveBeenCalledWith("/order/ABC123");
    expect(input).toHaveValue("");
  });
});
