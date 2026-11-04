import { getNjSsiEstimate, type NjArrangement } from './njSupplement';
import { ANNUAL_RULES, BenefitsType, RulesYear, WorkPhase, assessSsdi, benefitsTypeLabel, calculateSsi, includesSsi, monthlyWages, money, titleIiLabel, titleIiType } from './benefits';

export interface ReportInput {
  benefitType: BenefitsType; year: RulesYear; hours: number; wage: number;
  titleIiAmount: number; otherUnearned: number; irwe: number; blind: boolean; phase: WorkPhase;
  currentSsi?: number; additionalBenefits?: string[]; notes?: string; njArrangement?: NjArrangement; njVerifiedRate?: number;
}
export interface ReportSection { heading: string; paragraphs: string[] }

export function buildBenefitsReport(input: ReportInput) {
  const { benefitType, year, phase, blind } = input;
  const grossWages = monthlyWages(input.hours, input.wage);
  const hasSsi = includesSsi(benefitType);
  const titleIi = titleIiType(benefitType);
  const hasSsdi = titleIi !== null;
  const label = titleIi ? titleIiLabel(titleIi) : 'SSDI';
  const titleIiAmount = hasSsdi ? input.titleIiAmount : 0;
  const unearned = input.otherUnearned + titleIiAmount;
  const ssi = hasSsi ? calculateSsi({year, grossWages, unearnedIncome: unearned, irwe: input.irwe}) : null;
  const nj = ssi ? getNjSsiEstimate(ssi,year,input.njArrangement??'unsure',input.njVerifiedRate):null;
  const titleIiAssessment = hasSsdi ? assessSsdi(grossWages, titleIiAmount, phase, blind, year, titleIi==='cdb'?'CDB':'SSDI') : null;
  const limits = ANNUAL_RULES[year];
  const sections: ReportSection[] = [
    {
      heading: 'Your situation at a glance',
      paragraphs: [
        `Benefits selected: ${benefitsTypeLabel(benefitType)}. Analysis year: ${year}.`,
        `Proposed work: ${input.hours} hours/week at ${money(input.wage)}/hour, an average of ${money(grossWages)} gross wages per month (52 weeks ÷ 12 months). This is before taxes.`,
        `Other reported monthly unearned income: ${money(input.otherUnearned)}${hasSsdi ? `; entered ${label} amount: ${money(titleIiAmount)}` : ''}.`,
      ]
    },
  ];
  if (ssi) sections.push({
    heading: 'Estimated federal SSI payment',
    paragraphs: [
      `For ${year}, the individual federal benefit rate is ${money(limits.fbr)}. Using the standard $20 general exclusion, the $65 earned income exclusion, and the half-of-remaining-earnings rule, the estimated countable earned income is ${money(ssi.countableEarned)} and countable unearned income is ${money(ssi.countableUnearned)}.`,
      `Potential eligible impairment-related work expense exclusion used in this illustration: ${money(ssi.allowableIrwe)} (SSA must approve the expense).`,
      `Illustrative federal SSI payment: ${money(ssi.estimatedFederalSsi)}/month. NJ-adjusted illustration: ${nj?.combined===null?"not available until NJ supplement rate is verified":money(nj?.combined??ssi.estimatedFederalSsi)}.`,
      nj?.explanation??"",
      `This excludes additional living-arrangement rules, family deeming, in-kind support and maintenance, student exclusions, PASS, BWE, payment timing, and other eligibility details.`,
    ]
  });
  if (ssi && input.currentSsi !== undefined) sections.push({
    heading: 'Current payment compared with this estimate',
    paragraphs: [
      `Current SSI cash payment you entered: ${money(input.currentSsi)}. Illustrative new SSI: ${nj?.combined===null ? "federal only " + money(ssi.estimatedFederalSsi) + " (NJ supplement unavailable)" : money(nj?.combined??ssi.estimatedFederalSsi)}. ${nj?.combined===null?"A combined-payment difference cannot be calculated until the NJ rate is verified.":"Difference: " + money((nj?.combined??ssi.estimatedFederalSsi) - input.currentSsi) + " per month."}`,
      'This comparison is not a prediction of your next check. Actual federal/state components and retrospective accounting may create a different result or effective month.',
    ]
  });
  if (titleIiAssessment) sections.push({
    heading: `${label} and work incentives`,
    paragraphs: [
      `For ${year}, the Trial Work Period service-month amount is more than ${money(limits.twp)}. The SGA guide is ${money(blind ? limits.blindSga : limits.sga)}/month for the selected disability category.`,
      titleIiAssessment.message,
      phase === 'unsure' ? 'The work-incentive phase is unknown. SSA work history is needed to determine remaining TWP months, EPE dates, possible grace periods and current eligibility.' : `Selected work phase: ${phase === 'twp' ? 'TWP' : phase === 'epe' ? '36-month EPE' : 'After the EPE'}. This is user-reported and has not been verified against an SSA record.`,
    ]
  });
  if (titleIi === 'cdb') sections.push({
    heading: 'CDB (Disabled Adult Child) considerations',
    paragraphs: [
      'Childhood Disability Benefits (CDB, also called DAC) are based on a qualifying parent’s Social Security record; eligibility is different from disability benefits based on your own work record. A qualifying disability beginning before age 22 and other conditions matter.',
      'SSA permits a Trial Work Period and a 36-month Extended Period of Eligibility for qualifying CDB beneficiaries, but past work, prior entitlement, any marriage or parent-record changes need individual review.',
      ...(hasSsi ? ['If you also receive SSI, the CDB amount generally counts as unearned income in the simplified SSI estimate. Certain DAC-related Medicaid protections may apply; this tool does not determine them.'] : ['If you have Medicaid, ask a counselor to check the special DAC Medicaid group under Social Security Act §1634(c), when applicable. This tool does not determine eligibility.']),
      'A person entitled to more than one Title II benefit (for example, SSDI on their own work record and CDB on a parent’s record) requires a separate dual-entitlement analysis; this report models only one Title II cash amount.'
    ],
  });
  const otherBenefits: Record<string, string> = {
    medicaid: 'Medicaid: Earnings do not always end coverage. If you receive SSI, ask about SSI Section 1619(b), state Medicaid programs and any Medicaid Buy-In options. State-specific eligibility must be reviewed.',
    medicare: 'Medicare: Working may allow continued Medicare after a Title II disability TWP under separate eligibility provisions. Premium assistance and work incentives require an individual review.',
    snap: 'SNAP / food assistance: Earned income and household circumstances can change eligibility and benefit amounts. Contact your state SNAP agency to review the applicable budget.',
    housing: 'Housing assistance: Earnings may affect income-based rent contributions and program eligibility. Speak with your housing authority or case manager before assuming a new rent amount.',
  };
  if (input.additionalBenefits?.length) sections.push({
    heading: 'Other benefits to review',
    paragraphs: input.additionalBenefits.filter(b=>otherBenefits[b]).map(b=>otherBenefits[b]),
  });
  sections.push({
    heading: 'Important considerations',
    paragraphs: [
      'Report work, wages, and relevant changes to Social Security promptly. Keep pay stubs and written records of the report.',
      ...(hasSsi ? ['SSI payment timing and retrospective monthly accounting can cause the actual payment month to differ from this same-month illustration. Medicaid eligibility may continue under section 1619(b) even if earned income reduces federal SSI to zero.'] : []),
      ...(hasSsdi ? ['IRWE, employer subsidies, special conditions, self-employment rules, the three-month cessation grace period, and prior eligibility events can affect an actual SSA decision. Medicare continuation also has separate rules.'] : []),
      'For a personalized determination, request a Benefits Summary and Analysis from a certified work incentives counselor or confirm details directly with SSA.',
    ]
  });
  sections.push({
    heading: 'Suggested next steps',
    paragraphs: [
      'Gather your most recent benefit verification letter, pay stubs, work history, and any notices about TWP or EPE dates.',
      'Verify whether any work expenses, subsidies, state supplement, or additional income exclusions apply.',
      'Ask a qualified benefits counselor to review these assumptions before making an employment or benefits decision.',
      ...(input.notes?.trim() ? [`Your notes: ${input.notes.trim()}`] : []),
    ]
  });
  return { sections, grossWages, estimatedSsi: ssi?.estimatedFederalSsi, estimatedCombinedSsi:nj?.combined, titleIiAssessment, generated: new Date().toLocaleDateString('en-US'), year };
}

export function reportAsText(input: ReportInput) {
  const report = buildBenefitsReport(input);
  return ['BENEFITS COUNSELING | EDUCATIONAL BENEFITS REPORT', `Generated: ${report.generated}`, 'Not an SSA determination. No identifying information was collected.', '',
    ...report.sections.flatMap(section => [section.heading.toUpperCase(), ...section.paragraphs, '']),
    'OFFICIAL SOURCES', 'https://www.ssa.gov/redbook/', 'https://www.ssa.gov/ssi/text-income-ussi.htm', 'https://www.ssa.gov/redbook/eng/epe.htm', 'https://secure.ssa.gov/poms.nsf/lnx/0300203080'
  ].join('\n');
}
