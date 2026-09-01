import { AxiosError } from "axios";

interface BackendErrorBody {
  success?: false;
  message?: string;
  code?: string;
  error?: {
    code?: string;
    message?: string;
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as BackendErrorBody | undefined;
    if (data?.error?.message) {
      return data.error.message;
    }
    if (data?.message) {
      return data.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
