import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "./LoginPage";
import { AuthProvider } from "../auth/AuthContext";
import { login } from "../api/auth";
import { ApiError } from "../api/client";
import type { AuthResponse } from "../types/user";

vi.mock("../api/auth", () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
}));

function renderLoginPage() {
  return render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("blocks submission when fields are empty", async () => {
    renderLoginPage();

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your password/i)).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("sends email and password when submitting a valid form", async () => {
    const response: AuthResponse = {
      access_token: "token-123",
      token_type: "bearer",
      user: { id: "carlos-support", name: "Carlos", email: "carlos@ticketmanager.local", role: "SUPPORT" },
    };
    vi.mocked(login).mockResolvedValue(response);

    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email/i), "carlos@ticketmanager.local");
    await userEvent.type(screen.getByLabelText(/password/i), "changeme123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith({
      email: "carlos@ticketmanager.local",
      password: "changeme123",
    });
  });

  it("shows a generic error message when login fails", async () => {
    vi.mocked(login).mockRejectedValue(new ApiError(401, "Invalid email or password"));

    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email/i), "carlos@ticketmanager.local");
    await userEvent.type(screen.getByLabelText(/password/i), "senhaerrada");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });
});
