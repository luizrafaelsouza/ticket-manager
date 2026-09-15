import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, login as loginRequest } from "../api/auth";
import { ApiError, clearAuthToken, getAuthToken, setAuthToken, setOnUnauthorized } from "../api/client";
import type { User } from "../types/user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  loginError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  useEffect(() => {
    if (!getAuthToken()) {
      setIsLoading(false);
      return;
    }
    getCurrentUser()
      .then((currentUser) => setUser(currentUser))
      .catch(() => clearAuthToken())
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const response = await loginRequest({ email, password });
      setAuthToken(response.access_token);
      setUser(response.user);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Algo deu errado, tente novamente.";
      setLoginError(message);
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggingIn, loginError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
