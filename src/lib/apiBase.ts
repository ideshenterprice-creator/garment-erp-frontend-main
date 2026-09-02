function isLocalPage(): boolean {
  if (typeof window !== "undefined") {
    return /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
  }
  return !process.env.VERCEL;
}

function toPublicOrigin(raw: string | undefined): string | null {
  const value = (raw ?? "").trim();
  if (!value || value.startsWith("/") || /localhost|127\.0\.0\.1/i.test(value)) {
    return null;
  }
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

export const PRODUCTION_BACKEND_ORIGIN =
  "https://chic-presence-production-9ac1.up.railway.app";

/** Railway production origin used by the same-origin `/api` proxy. */
export function resolveBackendOrigin(): string {
  const candidates = [
    process.env.API_PROXY_TARGET,
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ];
  for (const candidate of candidates) {
    const origin = toPublicOrigin(candidate);
    if (origin) return origin;
  }
  return PRODUCTION_BACKEND_ORIGIN;
}

export function getApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/$/, "");

  // Deployed UI always talks to same-origin `/api`. The Next.js proxy forwards
  // to the Railway backend so auth cookies stay first-party.
  if (!isLocalPage()) {
    return "/api";
  }

  return raw;
}

export function isLikelyJwt(token: string | null | undefined): boolean {
  return Boolean(token && token.split(".").length === 3);
}
