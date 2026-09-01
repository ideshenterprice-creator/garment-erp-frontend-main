import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isLikelyJwt } from "@/lib/apiBase";

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
