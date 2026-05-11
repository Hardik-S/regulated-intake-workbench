# Regulated Intake Workbench

Regulated Intake Workbench is a public, synthetic-data demo for reviewing messy regulated intake before anything is trusted for handoff. The first slice focuses on the product control that matters most: populated fields and trusted fields are separate surfaces.

## Portfolio Signal

This project demonstrates workflow judgment for regulated operations. It does not claim to automate pharmacovigilance, compliance review, or submission decisions. It shows how a product can reduce intake friction while preserving a human approval boundary.

## Stack Rationale

- Next.js App Router keeps the demo deployable on Vercel and leaves room for future server-side packet generation.
- TypeScript makes field states and handoff boundaries explicit instead of relying on presentation-only labels.
- Fixture-first data keeps the repository public and reviewable without exposing real personal, medical, or business data.
- Vitest covers the extraction boundary: populated values are not automatically trusted values.

## Local Setup

```powershell
npm install
npm run test
npm run build
npm run dev
```

## Decisions Made

- The first release uses deterministic synthetic fixtures rather than live model extraction. This keeps the public demo auditable and avoids pretending that model output is safe for regulated handoff.
- The UI has three separate review surfaces: raw intake, populated fields, and trusted handoff packet. The separation is the core product behavior.
- Uncertainty flags are generated from `needs-review` fields and must be resolved by a human reviewer before handoff.
- No real patient, customer, or company data belongs in this repository. Any future real intake connector should make the repository private or keep all real data local.

## Verification

- `npm run test` checks that populated fields are broader than trusted handoff fields and that uncertainty flags are preserved.
- `npm run build` verifies the Next.js production build.

## Deployment

Expected deployment target: Vercel production for a public synthetic-data demo.
