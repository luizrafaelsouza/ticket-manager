import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "./Navbar";
import { AuthProvider } from "../../auth/AuthContext";
import { getAuthToken, setAuthToken } from "../../api/client";
import { getCurrentUser } from "../../api/auth";
import type { User } from "../../types/user";

vi.mock("../../api/auth", () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
}));

const support: User = {
  id: "carlos-support",
  name: "Carlos",
  email: "carlos@ticketmanager.local",
  role: "SUPPORT",
};

function renderNavbar() {
  return render(
    <AuthProvider>
      <Navbar />
    </AuthProvider>,
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the logged-in user's name and role", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(support);
    setAuthToken("fake-token");

    renderNavbar();

    expect(await screen.findByText(/carlos — support/i)).toBeInTheDocument();
  });

  it("the 'Sign out' button clears the session", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(support);
    setAuthToken("fake-token");

    renderNavbar();
    await screen.findByText(/carlos — support/i);

    await userEvent.click(screen.getByRole("button", { name: /sign out/i }));

    expect(screen.queryByText(/carlos — support/i)).not.toBeInTheDocument();
    expect(getAuthToken()).toBeNull();
  });
});
