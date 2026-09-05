const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "content-encoding",
]);

export { HOP_BY_HOP };

export function readSetCookies(headers: Headers): string[] {
  if (typeof headers.getSetCookie === "function") {
    const listed = headers.getSetCookie();
    if (listed.length > 0) {
      return listed;
    }
  }
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

export function rewriteSetCookieForFrontend(raw: string): string {
  const parts = raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const nameValue = parts[0];
  if (!nameValue) return raw;

  const eq = nameValue.indexOf("=");
  if (eq <= 0) return raw;

  const name = nameValue.slice(0, eq);
  const value = nameValue.slice(eq + 1);

  const attributes = new Map<string, string | true>();
  for (const part of parts.slice(1)) {
    const attrEq = part.indexOf("=");
    if (attrEq === -1) {
      attributes.set(part.toLowerCase(), true);
    } else {
      attributes.set(part.slice(0, attrEq).trim().toLowerCase(), part.slice(attrEq + 1).trim());
    }
  }

  const pieces = [`${name}=${value}`, "Path=/", "HttpOnly", "Secure", "SameSite=Lax"];
  const maxAge = attributes.get("max-age");
  if (typeof maxAge === "string") {
    pieces.push(`Max-Age=${maxAge}`);
  }
  const expires = attributes.get("expires");
  if (typeof expires === "string") {
    pieces.push(`Expires=${expires}`);
  }

  return pieces.join("; ");
}
