export type FieldState = "trusted" | "needs-review" | "rejected";
export type EvidenceSource = "direct-text" | "copied-form" | "csv-paste" | "thread-reply" | "attachment-scan";
export type FieldKey =
  | "caseId"
  | "reporterName"
  | "eventDate"
  | "followUpConsent"
  | "patientInitials"
  | "approvalBoundary"
  | "productName"
  | "lotNumber"
  | "reporterRole"
  | "qaSignoff";

export type IntakeField = {
  key: FieldKey;
  label: string;
  value: string;
  source: string;
  evidenceSource: EvidenceSource;
  state: FieldState;
  reason: string;
  confidence: "high" | "medium" | "low";
  reviewerAction: string;
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
  blockedFields: IntakeField[];
  uncertaintyFlags: string[];
  reviewerSteps: string[];
  handoffSummary: string;
  packetMarkdown: string;
  completionPercent: number;
};

export const intakeExamples = [
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
        evidenceSource: "direct-text",
        state: "trusted",
        reason: "Case identifier appears consistently in the forwarded note and copied form.",
        confidence: "high",
        reviewerAction: "Keep in packet with source note.",
      },
      {
        key: "reporterName",
        label: "Reporter",
        value: "Mira Patel",
        source: "Email body",
        evidenceSource: "direct-text",
        state: "trusted",
        reason: "Reporter is directly named with a role and does not conflict with other evidence.",
        confidence: "high",
        reviewerAction: "Keep as reporter contact, but do not start follow-up until consent is resolved.",
      },
      {
        key: "eventDate",
        label: "Event date",
        value: "Last Tuesday",
        source: "Copied form text",
        evidenceSource: "copied-form",
        state: "needs-review",
        reason: "Relative date and stale form footer make the actual event date ambiguous.",
        confidence: "low",
        reviewerAction: "Convert relative date to an absolute date from the original source before handoff.",
      },
      {
        key: "followUpConsent",
        label: "Follow-up consent",
        value: "Not granted",
        source: "Email body",
        evidenceSource: "direct-text",
        state: "needs-review",
        reason: "The note says no consent yet, so handoff should not treat outreach as approved.",
        confidence: "medium",
        reviewerAction: "Do not contact reporter or patient until consent state is confirmed by QA.",
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
        evidenceSource: "csv-paste",
        state: "trusted",
        reason: "Named reporter has no conflicting value in the thread.",
        confidence: "high",
        reviewerAction: "Keep in packet and cite the pasted CSV row.",
      },
      {
        key: "patientInitials",
        label: "Patient initials",
        value: "K.L. or K.I.",
        source: "CSV paste + later reply",
        evidenceSource: "attachment-scan",
        state: "needs-review",
        reason: "Conflicting patient initials across email and attachment.",
        confidence: "low",
        reviewerAction: "Request a clearer attachment scan before handoff.",
      },
      {
        key: "eventDate",
        label: "Event date",
        value: "Approx. early April",
        source: "CSV paste",
        evidenceSource: "csv-paste",
        state: "needs-review",
        reason: "Event date is approximate and cannot be trusted for handoff.",
        confidence: "low",
        reviewerAction: "Resolve to exact event date or mark as missing in QA packet.",
      },
      {
        key: "approvalBoundary",
        label: "Submission boundary",
        value: "Hold for QA approval",
        source: "Thread reply",
        evidenceSource: "thread-reply",
        state: "trusted",
        reason: "The human approval boundary is explicit and should travel with the packet.",
        confidence: "high",
        reviewerAction: "Keep boundary visible in every downstream packet.",
      },
    ],
  },
  {
    id: "case-1062",
    title: "Portal note with mismatched product and lot",
    channel: "Portal export + phone note",
    receivedAt: "2026-05-10 15:31",
    rawText:
      "Portal export says product Neurovia, lot NV-17, but phone note from intake desk says Neurovia XR and lot NV-71. Reporter title is listed as ward clerk, not clinician. The note asks for same-day processing but includes no QA sign-off.",
    fields: [
      {
        key: "productName",
        label: "Product",
        value: "Neurovia / Neurovia XR",
        source: "Portal export + phone note",
        evidenceSource: "thread-reply",
        state: "needs-review",
        reason: "Product formulation differs between the portal export and phone note.",
        confidence: "low",
        reviewerAction: "Confirm exact formulation with source system before handoff.",
      },
      {
        key: "lotNumber",
        label: "Lot number",
        value: "NV-17 / NV-71",
        source: "Portal export + phone note",
        evidenceSource: "attachment-scan",
        state: "needs-review",
        reason: "Lot number conflict could change downstream routing.",
        confidence: "low",
        reviewerAction: "Block handoff until the lot conflict is reconciled.",
      },
      {
        key: "reporterRole",
        label: "Reporter role",
        value: "Ward clerk",
        source: "Portal export",
        evidenceSource: "direct-text",
        state: "trusted",
        reason: "Reporter role is explicit and useful for triage expectations.",
        confidence: "medium",
        reviewerAction: "Keep role in packet so QA can set follow-up expectations.",
      },
      {
        key: "qaSignoff",
        label: "QA sign-off",
        value: "Missing",
        source: "Phone note",
        evidenceSource: "thread-reply",
        state: "rejected",
        reason: "Same-day processing request has no QA approval evidence.",
        confidence: "high",
        reviewerAction: "Reject submission readiness until QA sign-off is attached.",
      },
    ],
  },
] satisfies IntakeExample[];

export function findDuplicateFieldKeys(fields: IntakeField[]): FieldKey[] {
  const seen = new Set<FieldKey>();
  const duplicates = new Set<FieldKey>();

  for (const field of fields) {
    if (seen.has(field.key)) {
      duplicates.add(field.key);
    }
    seen.add(field.key);
  }

  return [...duplicates];
}

export function getStateCounts(fields: IntakeField[]): Record<FieldState, number> {
  return fields.reduce<Record<FieldState, number>>(
    (counts, field) => {
      counts[field.state] += 1;
      return counts;
    },
    { trusted: 0, "needs-review": 0, rejected: 0 },
  );
}

function buildHandoffMarkdown(intake: IntakeExample, trustedFields: IntakeField[], blockedFields: IntakeField[]): string {
  const trustedLines = trustedFields.map(
    (field) => `- ${field.label}: ${field.value} (${field.source}; ${field.confidence} confidence)`,
  );
  const blockedLines = blockedFields.map((field) => `- ${field.label}: ${field.reason} Action: ${field.reviewerAction}`);

  return [
    `# Review packet: ${intake.id}`,
    "",
    `Source: ${intake.channel}`,
    `Received: ${intake.receivedAt}`,
    "",
    "## Trusted for handoff",
    ...(trustedLines.length ? trustedLines : ["- None yet."]),
    "",
    "## Must resolve before handoff",
    ...(blockedLines.length ? blockedLines : ["- No open blockers."]),
    "",
    "Boundary: this packet is synthetic and stops before submission until a human reviewer resolves every blocker.",
  ].join("\n");
}

export function buildReviewPacket(intake: IntakeExample): ReviewPacket {
  const duplicateKeys = findDuplicateFieldKeys(intake.fields);
  if (duplicateKeys.length > 0) {
    throw new Error(`Duplicate field keys in ${intake.id}: ${duplicateKeys.join(", ")}`);
  }

  const populatedFields = intake.fields.filter((field) => field.value.trim().length > 0);
  const trustedForHandoff = populatedFields.filter((field) => field.state === "trusted");
  const blockedFields = populatedFields.filter((field) => field.state !== "trusted");
  const uncertaintyFlags = populatedFields
    .filter((field) => field.state === "needs-review")
    .map((field) => field.reason);
  const reviewerSteps = blockedFields.map((field) => field.reviewerAction);
  const completionPercent = Math.round((trustedForHandoff.length / Math.max(populatedFields.length, 1)) * 100);

  return {
    intake,
    populatedFields,
    trustedForHandoff,
    blockedFields,
    uncertaintyFlags,
    reviewerSteps,
    handoffSummary: `${trustedForHandoff.length} trusted fields, ${blockedFields.length} blocked fields. Do not hand off until every blocked field is resolved by a human reviewer.`,
    packetMarkdown: buildHandoffMarkdown(intake, trustedForHandoff, blockedFields),
    completionPercent,
  };
}
