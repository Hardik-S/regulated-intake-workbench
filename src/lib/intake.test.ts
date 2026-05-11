import { describe, expect, it } from "vitest";
import { buildReviewPacket, findDuplicateFieldKeys, getStateCounts, intakeExamples, type IntakeExample } from "./intake";

describe("buildReviewPacket", () => {
  it("keeps populated fields separate from trusted handoff fields", () => {
    const packet = buildReviewPacket(intakeExamples[0]);

    expect(packet.populatedFields.length).toBeGreaterThan(packet.trustedForHandoff.length);
    expect(packet.trustedForHandoff.map((field) => field.key)).toEqual(["caseId", "reporterName"]);
    expect(packet.populatedFields.find((field) => field.key === "eventDate")?.state).toBe("needs-review");
    expect(packet.blockedFields.map((field) => field.key)).toEqual(["eventDate", "followUpConsent"]);
  });

  it("surfaces uncertainty flags from messy intake evidence", () => {
    const packet = buildReviewPacket(intakeExamples[1]);

    expect(packet.uncertaintyFlags).toContain("Conflicting patient initials across email and attachment.");
    expect(packet.uncertaintyFlags).toContain("Event date is approximate and cannot be trusted for handoff.");
  });

  it("generates a handoff packet that keeps unresolved fields out of trusted output", () => {
    const packet = buildReviewPacket(intakeExamples[2]);

    expect(packet.packetMarkdown).toContain("# Review packet: case-1062");
    expect(packet.packetMarkdown).toContain("Reporter role: Ward clerk");
    expect(packet.packetMarkdown).not.toContain("Lot number: NV-17 / NV-71");
    expect(packet.packetMarkdown).toContain("Lot number: Lot number conflict could change downstream routing.");
    expect(packet.completionPercent).toBe(25);
  });

  it("counts trusted, review, and rejected states for reviewer readiness", () => {
    const counts = getStateCounts(intakeExamples[2].fields);

    expect(counts).toEqual({ trusted: 1, "needs-review": 2, rejected: 1 });
  });

  it("rejects duplicate field keys so conflicting evidence cannot collapse in the UI", () => {
    const brokenIntake: IntakeExample = {
      ...intakeExamples[0],
      fields: [...intakeExamples[0].fields, { ...intakeExamples[0].fields[0], value: "RI-9999" }],
    };

    expect(findDuplicateFieldKeys(brokenIntake.fields)).toEqual(["caseId"]);
    expect(() => buildReviewPacket(brokenIntake)).toThrow("Duplicate field keys");
  });
});
