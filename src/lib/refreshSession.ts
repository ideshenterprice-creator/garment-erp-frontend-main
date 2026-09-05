import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { getApiBaseUrl } from "@/lib/apiBase";

interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}

let inFlight: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const refreshResponse = await axios.post<RefreshResponse>(
      `${getApiBaseUrl()}/auth/refresh`,
      {},
      { withCredentials: true, timeout: 30_000 }
    );
    const newToken = refreshResponse.data?.data?.accessToken;
    if (!newToken) {
      throw new Error("No access token in refresh response");
    }
    useAuthStore.getState().updateAccessToken(newToken);
    return newToken;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
