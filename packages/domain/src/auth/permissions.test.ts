import { describe, expect, it } from "vitest";
import { hasPermission } from "./permissions";

describe("role permissions", () => {
  it("limits tutors to assigned-workflow capabilities", () => {
    expect(hasPermission("tutor", "sessions:create")).toBe(true);
    expect(hasPermission("tutor", "billing:manage")).toBe(false);
    expect(hasPermission("admin", "billing:manage")).toBe(true);
  });
});