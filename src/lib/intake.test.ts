import { describe, expect, it } from "vitest";
import { buildReviewPacket, intakeExamples } from "./intake";

describe("buildReviewPacket", () => {
  it("keeps populated fields separate from trusted handoff fields", () => {
    const packet = buildReviewPacket(intakeExamples[0]);

    expect(packet.populatedFields.length).toBeGreaterThan(packet.trustedForHandoff.length);
    expect(packet.trustedForHandoff.map((field) => field.key)).toEqual(["caseId", "reporterName"]);
    expect(packet.populatedFields.find((field) => field.key === "eventDate")?.state).toBe("needs-review");
  });

  it("surfaces uncertainty flags from messy intake evidence", () => {
    const packet = buildReviewPacket(intakeExamples[1]);

    expect(packet.uncertaintyFlags).toContain("Conflicting patient initials across email and attachment.");
    expect(packet.uncertaintyFlags).toContain("Event date is approximate and cannot be trusted for handoff.");
  });
});
