# BenefitsCounseling.org

An accessible, independent **work-incentives education toolkit** for people receiving SSI, SSDI, or both. Built from the existing Vite + React + TypeScript + Tailwind/shadcn project and ready for Vercel's static hosting. This is an educational prototype, **not** an SSA-affiliated service or official payment/eligibility system.

## What's included

| Route | Tool |
|---|---|
| `/` | Dashboard with current rules, tools, and key distinctions |
| `/tools/ssi` | Single-person federal SSI payment illustration (wages, unearned income, potential IRWE) |
| `/tools/twp-epe` | Monthly TWP tracker / indicative 36-month EPE timeline with annual thresholds and CSV export |
| `/tools/scenarios` | Compare hours, wages, simplified SSI estimates, and conditional SSDI estimates |
| `/tools/report` | Dynamic benefits summary with current SSI comparison, optional Medicaid/Medicare/SNAP/housing notes, browser print-to-PDF and text export |
| `/tools/smart-goals` | Existing SMART goals worksheet retained |
| `/learn` | Plain-language guidance, caveats and primary SSA sources |

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm ci
npm run dev
npm run test
npm run build
```

The original package-lock and dependencies are preserved; no new package is needed for the new tools. Vite's build output is `dist/`.

## Deploy on Vercel

1. Push the contents of this folder into the existing GitHub repository (create a new branch for review).
2. In Vercel, choose **Add New Project → Import Git Repository**, then select the repository.
3. Choose **Vite**, install command `npm ci`, build command `npm run build`, and output directory `dist` (normally auto-detected).
4. Deploy, test deep links (`/tools/ssi`, `/tools/report`) and confirm that the `vercel.json` rewrite is applied.
5. After validation, attach `benefitscounseling.org` in the Vercel domain settings and update DNS as prompted by Vercel.
6. Disable any former GitHub Pages workflow that is no longer required; do not maintain two competing deploy targets.

The `vercel.json` single-page-app rewrite allows directly opening client-side routes. No environment variables, database, auth, or API keys are required for this version.

## Safety and model boundaries

- **2026 and 2027 rates** come from SSA's published Red Book and COLA factsheets. See `src/lib/benefits.ts` for source URLs and the centrally defined rate tables.
- The SSI tool applies the $20 general income exclusion to unearned income first, then any unused amount to wages, subtracts $65 from wages, subtracts possible IRWE, then excludes half the balance. See SSA's income exclusion rules and POMS SI 00820.540. Federal individual FBR only.
- No SSI state supplement, couple/spouse/deeming, living arrangement, student earned-income exclusion, PASS, Blind Work Expenses, actual Medicaid/Medicare eligibility, or retrospective monthly accounting is modeled.
- The SSDI work tracker marks potential trial work service months and EPE dates, but **does not make benefit payable/termination decisions**. It must be reconciled with SSA's record. Actual SGA decisions involve adjustments, grace months, work patterns, and possible cessation history.
- Self-employment rules are more complex than the earnings-hours inputs shown. For real client advice, review records with a CPWIC/WIPA practitioner or SSA.
- A scenario that estimates SSDI as non-payable assumes nothing about what SSA will actually decide. When SSDI is uncertain the planner shows a **range**; SSI isn't automatically recomputed for a suspended SSDI scenario.
- Everything is calculated **in the browser** and there is no backend storage or tracking code in this project. The original SMART goals tool may save its worksheet into browser localStorage; other new tools use in-memory React state. Browser downloads, printing and third-party browser extensions may store information outside the app.
- Never request or store Social Security numbers, full DOBs, medical records, or other unnecessary identifying data in public calculator forms.

## Sources

- [2026 Red Book amounts](https://www.ssa.gov/redbook/newfor2026.htm)
- [2027 SSA COLA factsheet](https://www.ssa.gov/cola/factsheets/2027.html)
- [SSI income examples](https://www.ssa.gov/ssi/text-income-ussi.htm)
- [SSI earned income exclusion](https://www.ssa.gov/redbook/eng/earned-income-exclusion.htm)
- [SSI IRWE exclusion order](https://secure.ssa.gov/poms.nsf/lnx/0500820540)
- [Trial Work Period historical thresholds](https://www.ssa.gov/oact/cola/twp.html)
- [SGA historical thresholds](https://www.ssa.gov/oact/cola/sga.html)
- [SSDI Extended Period of Eligibility](https://www.ssa.gov/redbook/eng/epe.htm)

## Recommended next iteration (before public launch)

1. Have a practicing CPWIC/WIP independently review each rule and 2026/2027 example case.
2. Improve work-history intake to use SSA certified earnings histories, official TWP/EPE dates, 3-month grace window and IRWE/subsidy decision flags.
3. Add state-specific SSI and Medicaid guidance as separate validated rules modules.
4. Add accessible printable reports with clear section attribution; test screen readers and mobile forms.
5. Consider a privacy-preserving encrypted save function only after a documented data security, consent, deletion and retention design.

**This is an MVP for testing with counselors and beneficiaries, not a replacement for individualized benefits counseling.**
