import { describe, expect, it } from "vitest";
import { canAccessProtectedObject, createProtectedObjectPath } from "./protected-path";

describe("protected object paths", () => {
  it("requires both centre and record scope", () => {
    const object = createProtectedObjectPath({ centreId: "centre-a", recordType: "resource", recordId: "record-a" });
    expect(canAccessProtectedObject({ object, centreId: "centre-a", authorizedRecordId: "record-a" })).toBe(true);
    expect(canAccessProtectedObject({ object, centreId: "centre-b", authorizedRecordId: "record-a" })).toBe(false);
    expect(canAccessProtectedObject({ object, centreId: "centre-a", authorizedRecordId: "record-b" })).toBe(false);
  });
});