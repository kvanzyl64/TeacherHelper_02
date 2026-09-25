import { describe, expect, it } from "vitest";
import {
  approveSession,
  createSessionRecord,
  getGuardianVisibleFields,
  rejectSession,
  submitSession,
} from "../../packages/domain/src/sessions/session-service";
import { createAccessLink, isAccessLinkActive, revokeAccessLink } from "../../packages/domain/src/guardian-links/access-link-service";

describe("session delivery integration", () => {
  it("approves and exposes only permitted fields for a guardian view", () => {
    const session = createSessionRecord({
      centreId: "centre-a",
      studentId: "student-1",
      tutorUserId: "tutor-1",
      occurredAt: new Date("2026-09-24T08:00:00Z"),
      durationMinutes: 40,
      subject: "Maths",
      topics: ["fractions"],
      attendance: "present",
      notes: "Strong progress.",
      homework: "Complete worksheet 3.",
      nextFocus: "Practice decimals.",
      visibility: { notes: true, homework: true, nextFocus: true },
    });

    const submitted = submitSession(session);
    const approved = approveSession(submitted);
    const visible = getGuardianVisibleFields(approved);

    expect(submitted.reviewStatus).toBe("submitted");
    expect(approved.reviewStatus).toBe("approved");
    expect(visible.notes).toBe("Strong progress.");
    expect(visible.homework).toBe("Complete worksheet 3.");
    expect(visible.subject).toBeUndefined();
  });

  it("revokes a link when a session is rejected or a guardian is no longer eligible", () => {
    const session = createSessionRecord({
      centreId: "centre-a",
      studentId: "student-1",
      tutorUserId: "tutor-1",
      occurredAt: new Date("2026-09-24T08:00:00Z"),
      durationMinutes: 45,
      subject: "Science",
      topics: ["photosynthesis"],
      attendance: "present",
      notes: "Good work.",
      homework: "Revise the diagram.",
      nextFocus: "Test next week.",
      visibility: { notes: true, homework: true },
    });
    const submitted = submitSession(session);
    const rejected = rejectSession(submitted, "needs_follow_up");
    const link = createAccessLink({
      centreId: "centre-a",
      guardianId: "guardian-1",
      studentId: "student-1",
      recordType: "session",
      recordId: rejected.id,
      token: "revoked-link-token",
      now: new Date("2026-09-25T10:00:00Z"),
    });

    expect(rejected.reviewStatus).toBe("rejected");
    expect(isAccessLinkActive(revokeAccessLink(link, "session_rejected"), new Date("2026-09-25T12:00:00Z"))).toBe(false);
  });
});
