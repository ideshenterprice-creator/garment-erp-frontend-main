"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getMe } from "@/services/auth.service";
import { ROUTES } from "@/constants/routes";
import { isLikelyJwt } from "@/lib/apiBase";
import { refreshAccessToken } from "@/lib/refreshSession";

interface UseAuthResult {
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthResult {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(() => {
    const state = useAuthStore.getState();
    return !(state.user && isLikelyJwt(state.accessToken));
  });

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const state = useAuthStore.getState();
      if (state.user && isLikelyJwt(state.accessToken)) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const newAccessToken = await refreshAccessToken();
        const meResponse = await getMe();
        const me = meResponse.data;

        if (cancelled) return;

        setAuth(
          {
            id: me.id,
            name: me.name,
            email: me.email,
            role: me.role,
          },
          newAccessToken
        );
      } catch {
        if (cancelled) return;
        logout();
        router.replace(ROUTES.AUTH.LOGIN);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
    // Restore session once on mount (page refresh / cold load)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isLoading,
    isAuthenticated: Boolean(user && isLikelyJwt(accessToken)),
  };
}
