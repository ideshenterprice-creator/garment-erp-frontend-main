export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/$/, "");
}

export function isLikelyJwt(token: string | null | undefined): boolean {
  return Boolean(token && token.split(".").length === 3);
}
