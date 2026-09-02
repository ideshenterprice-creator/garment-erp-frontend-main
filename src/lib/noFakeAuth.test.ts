import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { getApiBaseUrl, isLikelyJwt, PRODUCTION_BACKEND_ORIGIN, resolveBackendOrigin } from "@/lib/apiBase";

describe("production auth wiring", () => {
  it("does not ship a hardcoded demo login", () => {
    const source = readFileSync("src/app/(auth)/login/page.tsx", "utf8");
    expect(source).not.toContain("abhishek@gmail.com");
    expect(source).not.toContain("temp-access-token");
    expect(source).not.toContain("ff_auth");
    expect(source).toContain("login(values.email, values.password)");
  });

  it("rejects non-JWT session tokens", () => {
    expect(isLikelyJwt("temp-access-token-admin")).toBe(false);
    expect(isLikelyJwt("a.b.c")).toBe(true);
  });
});

describe("getApiBaseUrl", () => {
  const originalApi = process.env.NEXT_PUBLIC_API_URL;
  const originalVercel = process.env.VERCEL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalApi;
    if (originalVercel === undefined) {
      delete process.env.VERCEL;
    } else {
      process.env.VERCEL = originalVercel;
    }
  });

  it("keeps localhost URLs off Vercel", () => {
    delete process.env.VERCEL;
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:5000/api";
    expect(getApiBaseUrl()).toBe("http://localhost:5000/api");
  });

  it("uses same-origin /api on Vercel when the public URL is localhost", () => {
    process.env.VERCEL = "1";
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:5000/api";
    expect(getApiBaseUrl()).toBe("/api");
  });

  it("uses same-origin /api on Vercel even when a public API URL is set", () => {
    process.env.VERCEL = "1";
    process.env.NEXT_PUBLIC_API_URL = "https://chic-presence.up.railway.app/api";
    expect(getApiBaseUrl()).toBe("/api");
  });
});

describe("resolveBackendOrigin", () => {
  const keys = ["API_PROXY_TARGET", "BACKEND_URL", "NEXT_PUBLIC_API_URL"] as const;
  const originals = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  afterEach(() => {
    for (const key of keys) {
      const value = originals[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("ignores localhost API URLs and falls back to Railway", () => {
    delete process.env.API_PROXY_TARGET;
    delete process.env.BACKEND_URL;
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:5001/api";
    expect(resolveBackendOrigin()).toBe(PRODUCTION_BACKEND_ORIGIN);
  });

  it("uses the Railway host from NEXT_PUBLIC_API_URL", () => {
    delete process.env.API_PROXY_TARGET;
    delete process.env.BACKEND_URL;
    process.env.NEXT_PUBLIC_API_URL = "https://chic-presence.up.railway.app/api";
    expect(resolveBackendOrigin()).toBe("https://chic-presence.up.railway.app");
  });
});
