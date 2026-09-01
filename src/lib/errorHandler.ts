export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong."
): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          error?: {
            message?: string;
          };
        };
      };
    };
    return (
      axiosError.response?.data?.error?.message ||
      axiosError.response?.data?.message ||
      fallback
    );
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
