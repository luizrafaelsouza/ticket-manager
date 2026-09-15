import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { apiClient, ApiError, clearAuthToken, getAuthToken, setAuthToken, setOnUnauthorized } from "./client";

describe("apiClient", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    setOnUnauthorized(null);
    vi.unstubAllGlobals();
  });

  it("getAuthToken/setAuthToken/clearAuthToken read and write to localStorage", () => {
    expect(getAuthToken()).toBeNull();
    setAuthToken("abc");
    expect(getAuthToken()).toBe("abc");
    clearAuthToken();
    expect(getAuthToken()).toBeNull();
  });

  it("attaches the Authorization header when a token is saved", async () => {
    setAuthToken("meu-token");
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await apiClient.get("/api/tickets");

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect((options?.headers as Headers).get("Authorization")).toBe("Bearer meu-token");
  });

  it("does not attach Authorization when there is no saved token", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await apiClient.get("/api/tickets");

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect((options?.headers as Headers).has("Authorization")).toBe(false);
  });

  it("calls the onUnauthorized handler when an authenticated call returns 401", async () => {
    setAuthToken("meu-token");
    const onUnauthorized = vi.fn();
    setOnUnauthorized(onUnauthorized);
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "Invalid or expired token" }), { status: 401 }),
    );

    await expect(apiClient.get("/api/tickets")).rejects.toBeInstanceOf(ApiError);

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("does not call onUnauthorized when the call is anonymous (e.g. login with wrong password)", async () => {
    const onUnauthorized = vi.fn();
    setOnUnauthorized(onUnauthorized);
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "Invalid email or password" }), { status: 401 }),
    );

    await expect(apiClient.post("/api/auth/login", { email: "x", password: "y" })).rejects.toBeInstanceOf(
      ApiError,
    );

    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("propagates the error message from the API's 'detail'", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "Ticket not found" }), { status: 404 }),
    );

    await expect(apiClient.get("/api/tickets/nao-existe")).rejects.toMatchObject({
      status: 404,
      message: "Ticket not found",
    });
  });
});
