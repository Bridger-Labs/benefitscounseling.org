import { ANNUAL_RULES, BenefitsType, RulesYear, WorkPhase, assessSsdi, calculateSsi, monthlyWages, money } from './benefits';

export interface ReportInput {
  benefitType: BenefitsType; year: RulesYear; hours: number; wage: number;
  ssdi: number; otherUnearned: number; irwe: number; blind: boolean; phase: WorkPhase;
  currentSsi?: number; additionalBenefits?: string[]; notes?: string;
}
export interface ReportSection { heading: string; paragraphs: string[] }

export function buildBenefitsReport(input: ReportInput) {
  const { benefitType, year, phase, blind } = input;
  const grossWages = monthlyWages(input.hours, input.wage);
  const hasSsi = benefitType !== 'ssdi';
  const hasSsdi = benefitType !== 'ssi';
  const ssdi = hasSsdi ? input.ssdi : 0;
  const unearned = input.otherUnearned + ssdi;
  const ssi = hasSsi ? calculateSsi({year, grossWages, unearnedIncome: unearned, irwe: input.irwe}) : null;
  const ssdiAssessment = hasSsdi ? assessSsdi(grossWages, ssdi, phase, blind, year) : null;
  const limits = ANNUAL_RULES[year];
  const sections: ReportSection[] = [
    {
      heading: 'Your situation at a glance',
      paragraphs: [
        `Benefits selected: ${benefitType === 'both' ? 'SSI and SSDI (concurrent)' : benefitType.toUpperCase()}. Analysis year: ${year}.`,
        `Proposed work: ${input.hours} hours/week at ${money(input.wage)}/hour, an average of ${money(grossWages)} gross wages per month (52 weeks ÷ 12 months). This is before taxes.`,
        `Other reported monthly unearned income: ${money(input.otherUnearned)}${hasSsdi ? `; entered SSDI amount: ${money(ssdi)}` : ''}.`,
      ]
    },
  ];
  if (ssi) sections.push({
    heading: 'Estimated federal SSI payment',
    paragraphs: [
      `For ${year}, the individual federal benefit rate is ${money(limits.fbr)}. Using the standard $20 general exclusion, the $65 earned income exclusion, and the half-of-remaining-earnings rule, the estimated countable earned income is ${money(ssi.countableEarned)} and countable unearned income is ${money(ssi.countableUnearned)}.`,
      `Potential eligible impairment-related work expense exclusion used in this illustration: ${money(ssi.allowableIrwe)} (SSA must approve the expense).`,
      `Illustrative federal SSI payment: ${money(ssi.estimatedFederalSsi)}/month. This excludes state supplements, family deeming, in-kind support and maintenance, student exclusions, PASS, BWE, payment timing, and other eligibility details.`,
    ]
  });
  if (ssi && input.currentSsi !== undefined) sections.push({
    heading: 'Current payment compared with this estimate',
    paragraphs: [
      `Current SSI cash payment you entered: ${money(input.currentSsi)}. Illustrative new federal SSI payment: ${money(ssi.estimatedFederalSsi)}. Difference: ${money(ssi.estimatedFederalSsi - input.currentSsi)} per month.`,
      'This comparison is not a prediction of your next check. Actual federal/state components and retrospective accounting may create a different result or effective month.',
    ]
  });
  if (ssdiAssessment) sections.push({
    heading: 'SSDI and work incentives',
    paragraphs: [
      `For ${year}, the Trial Work Period service-month amount is more than ${money(limits.twp)}. The SGA guide is ${money(blind ? limits.blindSga : limits.sga)}/month for the selected disability category.`,
      ssdiAssessment.message,
      phase === 'unsure' ? 'The SSDI work phase is unknown. SSA work history is needed to determine remaining TWP months, EPE dates, possible grace periods and current eligibility.' : `Selected work phase: ${phase === 'twp' ? 'TWP' : phase === 'epe' ? '36-month EPE' : 'After the EPE'}. This is user-reported and has not been verified against an SSA record.`,
    ]
  });
  const otherBenefits: Record<string, string> = {
    medicaid: 'Medicaid: Earnings do not always end coverage. If you receive SSI, ask about SSI Section 1619(b), state Medicaid programs and any Medicaid Buy-In options. State-specific eligibility must be reviewed.',
    medicare: 'Medicare: Working may allow continued Medicare after the SSDI TWP under separate eligibility provisions. Premium assistance and work incentives require an individual review.',
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
  return { sections, grossWages, estimatedSsi: ssi?.estimatedFederalSsi, ssdiAssessment, generated: new Date().toLocaleDateString('en-US'), year };
}

export function reportAsText(input: ReportInput) {
  const report = buildBenefitsReport(input);
  return ['BENEFITS COUNSELING | EDUCATIONAL BENEFITS REPORT', `Generated: ${report.generated}`, 'Not an SSA determination. No identifying information was collected.', '',
    ...report.sections.flatMap(section => [section.heading.toUpperCase(), ...section.paragraphs, '']),
    'OFFICIAL SOURCES', 'https://www.ssa.gov/redbook/', 'https://www.ssa.gov/ssi/text-income-ussi.htm', 'https://www.ssa.gov/redbook/eng/epe.htm'
  ].join('\n');
}
