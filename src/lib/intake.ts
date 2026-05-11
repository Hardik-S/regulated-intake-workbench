export type FieldState = "trusted" | "needs-review" | "rejected";

export type IntakeField = {
  key: string;
  label: string;
  value: string;
  source: string;
  state: FieldState;
  reason: string;
};

export type IntakeExample = {
  id: string;
  title: string;
  channel: string;
  receivedAt: string;
  rawText: string;
  fields: IntakeField[];
};

export type ReviewPacket = {
  intake: IntakeExample;
  populatedFields: IntakeField[];
  trustedForHandoff: IntakeField[];
  uncertaintyFlags: string[];
  handoffSummary: string;
};

export const intakeExamples: IntakeExample[] = [
  {
    id: "case-1048",
    title: "Forwarded safety mailbox note with partial form",
    channel: "Email + copied form",
    receivedAt: "2026-05-10 09:42",
    rawText:
      "Subject: patient called again re: nausea. Case? maybe RI-1048. Reporter is Mira Patel, clinic coordinator. Product name appears as Aleron 20mg, lot AL-9X2. Date says last Tuesday but form footer was copied from an older visit. Patient initials J.D. No consent for follow-up yet.",
    fields: [
      {
        key: "caseId",
        label: "Case ID",
        value: "RI-1048",
        source: "Subject/body cross-check",
        state: "trusted",
        reason: "Case identifier appears consistently in the forwarded note and copied form.",
      },
      {
        key: "reporterName",
        label: "Reporter",
        value: "Mira Patel",
        source: "Email body",
        state: "trusted",
        reason: "Reporter is directly named with a role and does not conflict with other evidence.",
      },
      {
        key: "eventDate",
        label: "Event date",
        value: "Last Tuesday",
        source: "Copied form text",
        state: "needs-review",
        reason: "Relative date and stale form footer make the actual event date ambiguous.",
      },
      {
        key: "followUpConsent",
        label: "Follow-up consent",
        value: "Not granted",
        source: "Email body",
        state: "needs-review",
        reason: "The note says no consent yet, so handoff should not treat outreach as approved.",
      },
    ],
  },
  {
    id: "case-1051",
    title: "CSV row pasted into email thread",
    channel: "Email + CSV paste",
    receivedAt: "2026-05-10 13:08",
    rawText:
      "CSV: Initials=K.L.; Product=Cardioval; Date=approx early April; Reporter=Samir Chen. Later reply says initials might be K.I. because attachment scan is blurry. Please get this ready for Thursday review but do not submit until QA approves.",
    fields: [
      {
        key: "reporterName",
        label: "Reporter",
        value: "Samir Chen",
        source: "CSV paste",
        state: "trusted",
        reason: "Named reporter has no conflicting value in the thread.",
      },
      {
        key: "patientInitials",
        label: "Patient initials",
        value: "K.L. or K.I.",
        source: "CSV paste + later reply",
        state: "needs-review",
        reason: "Conflicting patient initials across email and attachment.",
      },
      {
        key: "eventDate",
        label: "Event date",
        value: "Approx. early April",
        source: "CSV paste",
        state: "needs-review",
        reason: "Event date is approximate and cannot be trusted for handoff.",
      },
      {
        key: "approvalBoundary",
        label: "Submission boundary",
        value: "Hold for QA approval",
        source: "Thread reply",
        state: "trusted",
        reason: "The human approval boundary is explicit and should travel with the packet.",
      },
    ],
  },
];

export function buildReviewPacket(intake: IntakeExample): ReviewPacket {
  const populatedFields = intake.fields.filter((field) => field.value.trim().length > 0);
  const trustedForHandoff = populatedFields.filter((field) => field.state === "trusted");
  const uncertaintyFlags = populatedFields
    .filter((field) => field.state === "needs-review")
    .map((field) => field.reason);

  return {
    intake,
    populatedFields,
    trustedForHandoff,
    uncertaintyFlags,
    handoffSummary: `${trustedForHandoff.length} trusted fields, ${uncertaintyFlags.length} review flags. Do not hand off until every review flag is resolved by a human reviewer.`,
  };
}
