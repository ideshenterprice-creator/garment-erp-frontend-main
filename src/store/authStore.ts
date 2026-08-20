import { create } from "zustand";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEAM_MEMBER";
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  updateAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
    }),
  updateAccessToken: (token) =>
    set({
      accessToken: token,
    }),
  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),
}));
