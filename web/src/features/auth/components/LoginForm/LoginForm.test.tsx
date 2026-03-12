import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  it("validates email and submits when valid", async () => {
    const handleSubmit = vi.fn();

    render(<LoginForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: "invalid" }
    });
    fireEvent.change(screen.getByLabelText("비밀번호"), {
      target: { value: "pass1234" }
    });

    const form = screen.getByRole("button", { name: "로그인" }).closest("form");
    if (!form) {
      throw new Error("form not found");
    }

    fireEvent.submit(form);

    expect(await screen.findByText("이메일 형식을 확인해주세요.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: "user@test.com" }
    });

    fireEvent.submit(form);

    expect(handleSubmit).toHaveBeenCalledWith("user@test.com", "pass1234");
  });
});
