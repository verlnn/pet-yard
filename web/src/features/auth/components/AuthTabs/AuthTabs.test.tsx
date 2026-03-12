import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthTabs from "./AuthTabs";

describe("AuthTabs", () => {
  it("calls onChange when a tab is clicked", () => {
    const handleChange = vi.fn();

    render(<AuthTabs mode="login" onChange={handleChange} />);

    fireEvent.click(screen.getByRole("tab", { name: "회원가입" }));

    expect(handleChange).toHaveBeenCalledWith("signup");
  });
});
