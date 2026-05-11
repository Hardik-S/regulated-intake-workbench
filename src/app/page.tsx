import { buildReviewPacket, getStateCounts, intakeExamples, type IntakeField, type ReviewPacket } from "../lib/intake";

const stateLabels: Record<IntakeField["state"], string> = {
  trusted: "Trusted for handoff",
  "needs-review": "Needs human review",
  rejected: "Rejected",
};

function FieldTable({ fields }: { fields: IntakeField[] }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
            <th>State</th>
            <th>Confidence</th>
            <th>Evidence</th>
            <th>Reviewer action</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.key}>
              <td>
                <strong>{field.label}</strong>
                <span>{field.source}</span>
              </td>
              <td>{field.value}</td>
              <td>
                <mark className={field.state}>{stateLabels[field.state]}</mark>
              </td>
              <td>{field.confidence}</td>
              <td>{field.reason}</td>
              <td>{field.reviewerAction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CaseCard({ packet }: { packet: ReviewPacket }) {
  const counts = getStateCounts(packet.populatedFields);

  return (
    <article className="caseCard">
      <span>{packet.intake.channel}</span>
      <h2>{packet.intake.title}</h2>
      <p>{packet.handoffSummary}</p>
      <div className="caseMeta" aria-label={`${packet.intake.id} review state counts`}>
        <strong>{packet.intake.id}</strong>
        <em>{packet.completionPercent}% trusted</em>
        <em>{counts["needs-review"]} review</em>
        <em>{counts.rejected} rejected</em>
      </div>
    </article>
  );
}

export default function Home() {
  const packets = intakeExamples.map(buildReviewPacket);
  const activePacket = packets[0];
  const totals = packets.reduce(
    (summary, packet) => {
      summary.trusted += packet.trustedForHandoff.length;
      summary.blocked += packet.blockedFields.length;
      summary.steps += packet.reviewerSteps.length;
      return summary;
    },
    { trusted: 0, blocked: 0, steps: 0 },
  );

  return (
    <main>
      <section className="hero">
        <div>
          <h1>Regulated Intake Workbench</h1>
          <p>
            A review-first console for messy regulated intake: populate fields quickly, but hand off only
            what a human reviewer has marked as trusted.
          </p>
          <div className="heroMetrics" aria-label="Review readiness summary">
            <strong>{packets.length} synthetic cases</strong>
            <strong>{totals.trusted} trusted fields</strong>
            <strong>{totals.blocked} blocked fields</strong>
            <strong>{totals.steps} reviewer actions</strong>
          </div>
        </div>
        <aside aria-label="Approval boundary">
          <strong>No auto-submit boundary</strong>
          <span>Every fixture stops at review. The product demonstrates controls, not autonomous regulated decisions.</span>
        </aside>
      </section>

      <section className="caseGrid" aria-label="Synthetic intake examples">
        {packets.map((packet) => (
          <CaseCard packet={packet} key={packet.intake.id} />
        ))}
      </section>

      <section className="workflow" aria-label="Review workflow">
        <div>
          <span>1</span>
          <strong>Capture messy intake</strong>
          <p>Preserve source channel, received time, and raw text before any normalization.</p>
        </div>
        <div>
          <span>2</span>
          <strong>Separate populated from trusted</strong>
          <p>Every field keeps evidence source, confidence, state, and reviewer action.</p>
        </div>
        <div>
          <span>3</span>
          <strong>Stop before handoff</strong>
          <p>Generated packets include trusted fields and unresolved blockers, not submission claims.</p>
        </div>
      </section>

      <section className="workspace">
        {packets.map((packet) => (
          <section className="caseWorkspace" key={packet.intake.id} aria-label={`${packet.intake.id} review workspace`}>
            <div className="sourcePanel">
              <div className="panelHeader">
                <span>Raw intake</span>
                <strong>{packet.intake.id}</strong>
              </div>
              <p>{packet.intake.rawText}</p>
            </div>

            <div className="reviewPanel">
              <div className="panelHeader">
                <span>Populated fields</span>
                <strong>{packet.populatedFields.length} captured</strong>
              </div>
              <FieldTable fields={packet.populatedFields} />
            </div>

            <div className="reviewPanel trustedPanel">
              <div className="panelHeader">
                <span>Trusted handoff packet</span>
                <strong>{packet.trustedForHandoff.length} approved</strong>
              </div>
              <FieldTable fields={packet.trustedForHandoff} />
            </div>

            <aside className="flags">
              <div className="panelHeader">
                <span>Uncertainty flags</span>
                <strong>{packet.uncertaintyFlags.length} open</strong>
              </div>
              <ul>
                {packet.uncertaintyFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
                {packet.blockedFields.length === 0 ? <li>No blockers for this synthetic case.</li> : null}
              </ul>
            </aside>
          </section>
        ))}

        <section className="packetPanel" aria-label="Synthetic reviewer packet preview">
          <div className="panelHeader">
            <span>Reviewer packet preview</span>
            <strong>{activePacket.intake.id}</strong>
          </div>
          <pre>{activePacket.packetMarkdown}</pre>
        </section>
      </section>
    </main>
  );
}
