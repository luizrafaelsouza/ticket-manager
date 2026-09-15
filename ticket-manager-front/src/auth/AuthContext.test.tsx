import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "./useAuth";
import { getCurrentUser, login } from "../api/auth";
import { ApiError, apiClient, getAuthToken, setAuthToken } from "../api/client";
import type { AuthResponse, User } from "../types/user";

vi.mock("../api/auth", () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
}));

const support: User = {
  id: "carlos-support",
  name: "Carlos",
  email: "carlos@ticketmanager.local",
  role: "SUPPORT",
};

function Probe() {
  const { user, isLoading, loginError, login: doLogin, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.name : "nenhum"}</span>
      <span data-testid="error">{loginError ?? ""}</span>
      <button onClick={() => doLogin("carlos@ticketmanager.local", "Aa12345678")}>entrar</button>
      <button onClick={logout}>sair</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("with no saved token, finishes loading with no user and without calling the API", async () => {
    renderProbe();

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("user")).toHaveTextContent("nenhum");
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("with a saved token, rehydrates via GET /api/auth/me", async () => {
    setAuthToken("token-valido");
    vi.mocked(getCurrentUser).mockResolvedValue(support);

    renderProbe();

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Carlos"));
  });

  it("if rehydrate fails (invalid/expired token), clears the token and does not authenticate", async () => {
    setAuthToken("token-invalido");
    vi.mocked(getCurrentUser).mockRejectedValue(new ApiError(401, "Invalid or expired token"));

    renderProbe();

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("user")).toHaveTextContent("nenhum");
    expect(getAuthToken()).toBeNull();
  });

  it("successful login stores the token and authenticates the user", async () => {
    const response: AuthResponse = { access_token: "novo-token", token_type: "bearer", user: support };
    vi.mocked(login).mockResolvedValue(response);

    renderProbe();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Carlos"));
    expect(getAuthToken()).toBe("novo-token");
  });

  it("login error shows the generic message and does not authenticate", async () => {
    vi.mocked(login).mockRejectedValue(new ApiError(401, "Invalid email or password"));

    renderProbe();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent(/invalid email or password/i),
    );
    expect(screen.getByTestId("user")).toHaveTextContent("nenhum");
  });

  it("the 'sign out' button clears the session", async () => {
    setAuthToken("token-valido");
    vi.mocked(getCurrentUser).mockResolvedValue(support);

    renderProbe();
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Carlos"));

    await userEvent.click(screen.getByRole("button", { name: /sair/i }));

    expect(screen.getByTestId("user")).toHaveTextContent("nenhum");
    expect(getAuthToken()).toBeNull();
  });

  it("when an authenticated API call returns 401, the session is cleared automatically", async () => {
    setAuthToken("token-valido");
    vi.mocked(getCurrentUser).mockResolvedValue(support);

    renderProbe();
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Carlos"));

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ detail: "Invalid or expired token" }), { status: 401 }),
        ),
    );

    await expect(apiClient.get("/api/tickets")).rejects.toBeInstanceOf(ApiError);

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("nenhum"));
    expect(getAuthToken()).toBeNull();
  });
});
