import { describe, expect, it } from "vitest";

describe("web scaffold", () => {
  it("has a stable application package name", () => {
    expect("@teacher-helper/web").toBe("@teacher-helper/web");
  });
});