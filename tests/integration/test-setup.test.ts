import { describe, expect, it } from "vitest";
import { isLocalDatabaseUrl } from "./test-setup";

describe("integration database safety", () => {
  it("rejects deployment database URLs", () => {
    expect(isLocalDatabaseUrl("postgresql://app@staging.example/teacher_helper_staging")).toBe(false);
    expect(isLocalDatabaseUrl("postgresql://app@localhost/teacher_helper_dev")).toBe(true);
  });
});