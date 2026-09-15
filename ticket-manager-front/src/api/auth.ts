import { apiClient } from "./client";
import type { AuthResponse, LoginPayload, User } from "../types/user";

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/api/auth/login", payload);
}

export function getCurrentUser(): Promise<User> {
  return apiClient.get<User>("/api/auth/me");
}
