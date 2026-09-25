import { describe, expect, it } from "vitest";
import { unauthorizedResponse } from "./responses";

describe("unauthorized responses", () => {
  it("does not disclose whether a protected record exists", () => {
    expect(unauthorizedResponse.status).toBe(404);
    expect(unauthorizedResponse.body.error).toBe("The requested resource is unavailable");
  });
});