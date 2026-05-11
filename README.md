# Regulated Intake Workbench

Regulated Intake Workbench is a public, synthetic-data demo for reviewing messy regulated intake before anything is trusted for handoff. The first slice focuses on the product control that matters most: populated fields and trusted fields are separate surfaces.

Live demo target: https://regulated-intake-workbench.vercel.app

Reviewer quick path:

1. Start with the first viewport metrics to see how many fields are trusted versus blocked.
2. Inspect the raw intake, populated field table, and trusted handoff table side by side.
3. Open the reviewer packet preview and confirm blocked fields remain outside the trusted output.
4. Use `docs/reviewer-packet.example.md` as the committed handoff artifact shape.

## Portfolio Signal

This project demonstrates workflow judgment for regulated operations. It does not claim to automate pharmacovigilance, compliance review, or submission decisions. It shows how a product can reduce intake friction while preserving a human approval boundary.

The portfolio signal is the control surface: each synthetic field carries provenance, confidence, state, and the exact reviewer action needed before handoff. That makes the demo about governed workflow design instead of a generic extraction dashboard.

## Stack Rationale

- Next.js App Router keeps the demo deployable on Vercel and leaves room for future server-side packet generation.
- TypeScript makes field states and handoff boundaries explicit instead of relying on presentation-only labels.
- Fixture-first data keeps the repository public and reviewable without exposing real personal, medical, or business data.
- Vitest covers the extraction boundary: populated values are not automatically trusted values.

## Local Setup

```powershell
npm install
npm run test
npm run typecheck
npm run build
npm run verify
npm run dev
```

## Decisions Made

- The first release uses deterministic synthetic fixtures rather than live model extraction. This keeps the public demo auditable and avoids pretending that model output is safe for regulated handoff.
- The UI has four separate review surfaces: raw intake, populated fields, trusted handoff fields, and a generated reviewer packet. The separation is the core product behavior.
- Every field now includes an evidence source, confidence level, review state, and reviewer action. This keeps the fixture contract explicit enough for tests and reviewer inspection.
- Uncertainty flags are generated from `needs-review` fields, while rejected fields are kept as blockers that must not enter trusted handoff output.
- No real patient, customer, or company data belongs in this repository. Any future real intake connector should make the repository private or keep all real data local.

## Verification

- `npm run test` checks that populated fields are broader than trusted handoff fields and that uncertainty flags are preserved.
- `npm run typecheck` checks the typed fixture and review-packet contract.
- `npm run build` verifies the Next.js production build with webpack, avoiding the known Turbopack path-length panic in deep Windows automation worktrees.
- `npm run verify` runs test, typecheck, and build as the repeatable release gate.
- `npm run dev` also uses webpack so local smoke checks work from the long automation worktree path.

Current quality-pass evidence:

- `npm ci` completed with 2 moderate advisories; no forced audit fix was applied because it would allow breaking dependency changes.
- `npm run test`, `npm run typecheck`, and `npm run build` are the expected pre-push checks for this fixer branch.

## Deployment

Expected deployment target: Vercel production for a public synthetic-data demo.

## Fixture Boundary

All names, products, lots, channels, and case identifiers are synthetic. The app intentionally stores fixtures in source control so reviewers can inspect the data contract. Real regulated intake would require private storage, access controls, audit logging, retention rules, and human approval workflows outside this public portfolio slice.

## Limitations And Next Improvements

- The current UI previews one active packet while summarizing all synthetic cases. A follow-up pass could add case switching without changing the fixture contract.
- There is no live model extraction, upload, or submission connector by design. Those additions should stay private until data handling, auth, and audit requirements are explicit.
- Browser accessibility checks are manual in this slice; a future pass should add automated axe or Playwright coverage if the dependency cost is justified.
