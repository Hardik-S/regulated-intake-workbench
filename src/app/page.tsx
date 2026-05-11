import { buildReviewPacket, intakeExamples, type IntakeField } from "../lib/intake";

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
            <th>Evidence</th>
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
              <td>{field.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Home() {
  const packets = intakeExamples.map(buildReviewPacket);
  const activePacket = packets[0];

  return (
    <main>
      <section className="hero">
        <div>
          <h1>Regulated Intake Workbench</h1>
          <p>
            A review-first console for messy regulated intake: populate fields quickly, but hand off only
            what a human reviewer has marked as trusted.
          </p>
        </div>
        <aside aria-label="Approval boundary">
          <strong>No auto-submit boundary</strong>
          <span>Every fixture stops at review. The product demonstrates controls, not autonomous regulated decisions.</span>
        </aside>
      </section>

      <section className="caseGrid" aria-label="Synthetic intake examples">
        {packets.map((packet) => (
          <article className="caseCard" key={packet.intake.id}>
            <span>{packet.intake.channel}</span>
            <h2>{packet.intake.title}</h2>
            <p>{packet.handoffSummary}</p>
          </article>
        ))}
      </section>

      <section className="workspace">
        <div className="sourcePanel">
          <div className="panelHeader">
            <span>Raw intake</span>
            <strong>{activePacket.intake.id}</strong>
          </div>
          <p>{activePacket.intake.rawText}</p>
        </div>

        <div className="reviewPanel">
          <div className="panelHeader">
            <span>Populated fields</span>
            <strong>{activePacket.populatedFields.length} captured</strong>
          </div>
          <FieldTable fields={activePacket.populatedFields} />
        </div>

        <div className="reviewPanel trustedPanel">
          <div className="panelHeader">
            <span>Trusted handoff packet</span>
            <strong>{activePacket.trustedForHandoff.length} approved</strong>
          </div>
          <FieldTable fields={activePacket.trustedForHandoff} />
        </div>

        <aside className="flags">
          <div className="panelHeader">
            <span>Uncertainty flags</span>
            <strong>{activePacket.uncertaintyFlags.length} open</strong>
          </div>
          <ul>
            {activePacket.uncertaintyFlags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}
