import { describe, expect, it } from "vitest";
import { resolveTenantContext } from "./tenant-context";

describe("tenant context", () => {
  it("rejects a requested centre without an active membership", () => {
    expect(() => resolveTenantContext({
      userId: "user-a",
      requestedCentreId: "centre-b",
      requestId: "request-1",
      memberships: [{ centreId: "centre-a", userId: "user-a", role: "admin", status: "active" }],
    })).toThrow("workspace is unavailable");
  });
});