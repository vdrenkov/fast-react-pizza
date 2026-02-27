import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Button from "../../../ui/Button";

describe("Button", () => {
  it("respects disabled prop on button actions", () => {
    const onClick = vi.fn();
    render(
      <Button type="primary" disabled onClick={onClick}>
        Order now
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Order now" });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps backward compatibility with isDisabled prop", () => {
    render(
      <Button type="secondary" isDisabled>
        Legacy disabled
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Legacy disabled" })).toBeDisabled();
  });

  it("triggers click when enabled", () => {
    const onClick = vi.fn();
    render(
      <Button type="small" onClick={onClick}>
        Add
      </Button>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
