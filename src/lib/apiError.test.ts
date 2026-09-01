import { describe, expect, it } from "vitest";
import { getMemberInitials } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import { AxiosError } from "axios";

describe("getMemberInitials", () => {
  it("returns two-letter initials", () => {
    expect(getMemberInitials("Raj Sharma")).toBe("RS");
  });
});

describe("getApiErrorMessage", () => {
  it("reads nested backend error messages", () => {
    const error = new AxiosError("fail");
    error.response = {
      data: { error: { message: "Access token required" } },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: { headers: {} as never },
    };
    expect(getApiErrorMessage(error)).toBe("Access token required");
  });

  it("reads top-level message", () => {
    const error = new AxiosError("fail");
    error.response = {
      data: { message: "Route not found" },
      status: 404,
      statusText: "Not Found",
      headers: {},
      config: { headers: {} as never },
    };
    expect(getApiErrorMessage(error)).toBe("Route not found");
  });
});
