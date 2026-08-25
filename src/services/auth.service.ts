import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { User } from "@/types";

export interface LoginResponse {
  accessToken: string;
  user: Pick<User, "id" | "name" | "email" | "role">;
}

export interface RefreshResponse {
  accessToken: string;
}

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", {
    email,
    password,
  });
  return response.data;
}

export async function logout(): Promise<ApiResponse<{ message: string }>> {
  const response = await api.post<ApiResponse<{ message: string }>>(
    "/auth/logout"
  );
  return response.data;
}

export async function refreshToken(): Promise<ApiResponse<RefreshResponse>> {
  const response = await api.post<ApiResponse<RefreshResponse>>(
    "/auth/refresh"
  );
  return response.data;
}

export async function getMe(): Promise<ApiResponse<User>> {
  const response = await api.get<ApiResponse<User>>("/auth/me");
  return response.data;
}

export async function acceptInvite(
  token: string,
  password: string,
  confirmPassword: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await api.post<ApiResponse<{ message: string }>>(
    "/auth/accept-invite",
    { token, password, confirmPassword }
  );
  return response.data;
}
