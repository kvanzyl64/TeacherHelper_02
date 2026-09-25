import { describe, expect, it } from "vitest";
import { stateGraphs, transitionState } from "./transitions";

describe("state transitions", () => {
  it("rejects skipping session review", () => {
    expect(() => transitionState(stateGraphs.session, "draft", "approved")).toThrow();
    expect(transitionState(stateGraphs.session, "submitted", "approved")).toBe("approved");
  });
});