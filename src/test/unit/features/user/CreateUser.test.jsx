import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import CreateUser from "../../../../features/user/CreateUser";
import { updateName } from "../../../../features/user/userSlice";

describe("CreateUser", () => {
  afterEach(() => {
    mockDispatch.mockReset();
    mockNavigate.mockReset();
  });

  it("does not dispatch or navigate for an empty username", () => {
    const { container } = render(<CreateUser />);

    fireEvent.submit(container.querySelector("form"));

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("dispatches username and navigates to menu when submitted", () => {
    render(<CreateUser />);

    fireEvent.change(screen.getByPlaceholderText("Your full name"), {
      target: { value: "Valentin" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Start ordering" }));

    expect(mockDispatch).toHaveBeenCalledWith(updateName("Valentin"));
    expect(mockNavigate).toHaveBeenCalledWith("/menu");
  });
});
