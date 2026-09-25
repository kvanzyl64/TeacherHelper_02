import { describe, expect, it } from "vitest";
import { createIsolatedTenantFixtures } from "../../../packages/test-support/src/tenant-fixtures";

describe("tenant isolation fixtures", () => {
  it("keeps tenant identities disjoint", () => {
    const fixtures = createIsolatedTenantFixtures();
    expect(fixtures.centreA.centreId).not.toBe(fixtures.centreB.centreId);
    expect(fixtures.centreA.userId).not.toBe(fixtures.centreB.userId);
  });
});