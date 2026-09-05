import { describe, expect, it } from "vitest";
import { readSetCookies, rewriteSetCookieForFrontend } from "@/lib/proxyCookies";

describe("rewriteSetCookieForFrontend", () => {
  it("turns a Railway SameSite=None cookie into a first-party Lax cookie", () => {
    const rewritten = rewriteSetCookieForFrontend(
      "refreshToken=abc.def.ghi; Max-Age=604800; Path=/; Expires=Wed, 09 Sep 2026 12:00:00 GMT; HttpOnly; Secure; SameSite=None; Domain=up.railway.app"
    );

    expect(rewritten).toContain("refreshToken=abc.def.ghi");
    expect(rewritten).toContain("SameSite=Lax");
    expect(rewritten).toContain("Secure");
    expect(rewritten).toContain("HttpOnly");
    expect(rewritten).toContain("Path=/");
    expect(rewritten).toContain("Max-Age=604800");
    expect(rewritten).toContain("Expires=Wed, 09 Sep 2026 12:00:00 GMT");
    expect(rewritten).not.toContain("Domain=");
    expect(rewritten).not.toContain("SameSite=None");
  });

  it("preserves an empty logout cookie", () => {
    const rewritten = rewriteSetCookieForFrontend(
      "refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
    );
    expect(rewritten.startsWith("refreshToken=;")).toBe(true);
    expect(rewritten).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  });
});

describe("readSetCookies", () => {
  it("falls back to a single Set-Cookie header", () => {
    const headers = new Headers();
    headers.set(
      "set-cookie",
      "refreshToken=token; Path=/; Expires=Wed, 09 Sep 2026 12:00:00 GMT; HttpOnly"
    );
    expect(readSetCookies(headers)).toHaveLength(1);
    expect(readSetCookies(headers)[0]).toContain("refreshToken=token");
  });
});
