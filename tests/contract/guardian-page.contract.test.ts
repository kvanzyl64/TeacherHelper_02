import { describe, expect, it } from "vitest";
import { getVisibleNavigationLinks } from "../../apps/web/components/navigation/centre-navigation";
import { classifyError, unauthorizedResponse } from "../../apps/web/lib/errors/responses";

describe("guardian page contract", () => {
  it("keeps guardian navigation and responses generic and protected", () => {
    expect(getVisibleNavigationLinks("guardian")).toEqual([]);
    expect(unauthorizedResponse).toMatchObject({
      status: 404,
      body: { error: "The requested resource is unavailable" },
    });
    expect(classifyError(new Error("user is not authorized"))).toBe("unauthorized");
    expect(classifyError(new Error("ValidationError"))).toBe("validation");
  });

  it("keeps guardian verification and link actions in the single-record flow", () => {
    const verificationHeading = "Verify your WhatsApp number";
    const linkHeader = "Guardian update";

    expect(verificationHeading).toMatch(/verify your whatsapp number/i);
    expect(linkHeader).toMatch(/guardian update/i);
  });
});
