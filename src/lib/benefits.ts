/** Educational, individual-only estimates. See SOURCES and model limitations. */
export type RulesYear = 2026 | 2027;
export type BenefitsType = 'ssi' | 'ssdi' | 'both';
export type WorkPhase = 'twp' | 'epe' | 'post-epe' | 'unsure';
export type WorkType = 'employee' | 'self-employed';

export const ANNUAL_RULES = {
  2026: { year: 2026, fbr: 994, coupleFbr: 1491, twp: 1210, sga: 1690, blindSga: 2830, studentMonthly: 2410, studentAnnual: 9730 },
  2027: { year: 2027, fbr: 1029, coupleFbr: 1544, twp: 1270, sga: 1770, blindSga: 2950, studentMonthly: 2500, studentAnnual: 10080 },
} as const;

export const HISTORICAL_LIMITS: Record<number, {twp: number; sga: number; blindSga: number}> = {
  2017: { twp: 840, sga: 1170, blindSga: 1950 },
  2018: { twp: 850, sga: 1180, blindSga: 1970 },
  2019: { twp: 880, sga: 1220, blindSga: 2040 },
  2020: { twp: 910, sga: 1260, blindSga: 2110 },
  2021: { twp: 940, sga: 1310, blindSga: 2190 },
  2022: { twp: 970, sga: 1350, blindSga: 2260 },
  2023: { twp: 1050, sga: 1470, blindSga: 2460 },
  2024: { twp: 1110, sga: 1550, blindSga: 2590 },
  2025: { twp: 1160, sga: 1620, blindSga: 2700 },
  2026: { twp: 1210, sga: 1690, blindSga: 2830 },
  2027: { twp: 1270, sga: 1770, blindSga: 2950 },
};

export const SOURCES = [
  {label: 'SSA: 2026 Red Book amounts', url: 'https://www.ssa.gov/redbook/newfor2026.htm'},
  {label: 'SSA: 2027 COLA fact sheet', url: 'https://www.ssa.gov/cola/factsheets/2027.html'},
  {label: 'SSA: How SSI income is counted', url: 'https://www.ssa.gov/ssi/text-income-ussi.htm'},
  {label: 'SSA: Earned income exclusion', url: 'https://www.ssa.gov/redbook/eng/earned-income-exclusion.htm'},
  {label: 'SSA: Trial Work Period historical thresholds', url: 'https://www.ssa.gov/OACT/cola/twp.html'},
  {label: 'SSA: SGA historical thresholds', url: 'https://www.ssa.gov/OACT/cola/sga.html'},
  {label: 'SSA: Extended Period of Eligibility', url: 'https://www.ssa.gov/redbook/eng/epe.htm'},
  {label: 'SSA: IRWE deduction order', url: 'https://secure.ssa.gov/poms.nsf/lnx/0500820540'},
  {label: 'SSA: Section 1619(b) and Medicaid', url: 'https://www.ssa.gov/ssi/spotlights/spot-medicaid.htm'},
] as const;

export const money = (n: number) => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2, minimumFractionDigits: n % 1 === 0 ? 0 : 2}).format(n);
export const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const nonnegative = (value: number | string) => Math.max(0, Number(value) || 0);
export const monthlyWages = (hoursWeekly: number, hourlyWage: number) => round(nonnegative(hoursWeekly) * nonnegative(hourlyWage) * 52 / 12);

export interface SsiInputs { grossWages: number; unearnedIncome: number; irwe: number; year: RulesYear }
export interface SsiResult {
  grossWages: number; unearnedIncome: number; irwe: number; generalUnearnedExclusion: number;
  generalEarnedExclusion: number; earnedExclusion: number; allowableIrwe: number;
  countableUnearned: number; countableEarned: number; countableTotal: number;
  federalBenefitRate: number; estimatedFederalSsi: number; combinedGrossResources: number;
}
export function calculateSsi({grossWages, unearnedIncome, irwe, year}: SsiInputs): SsiResult {
  const earned = nonnegative(grossWages);
  const unearned = nonnegative(unearnedIncome);
  const expenses = nonnegative(irwe);
  const generalUnearnedExclusion = Math.min(20, unearned);
  const countableUnearned = unearned - generalUnearnedExclusion;
  const generalEarnedExclusion = Math.min(earned, 20 - generalUnearnedExclusion);
  const afterGeneral = earned - generalEarnedExclusion;
  const earnedExclusion = Math.min(65, afterGeneral);
  const afterFixed = afterGeneral - earnedExclusion;
  // IRWE comes after the $20 and $65 exclusions, before the 1/2 exclusion (POMS SI 00820.540).
  const allowableIrwe = Math.min(expenses, afterFixed);
  const countableEarned = round((afterFixed - allowableIrwe) / 2);
  const countableTotal = round(countableUnearned + countableEarned);
  const federalBenefitRate = ANNUAL_RULES[year].fbr;
  const estimatedFederalSsi = round(Math.max(0, federalBenefitRate - countableTotal));
  return {
    grossWages: earned, unearnedIncome: unearned, irwe: expenses,
    generalUnearnedExclusion, generalEarnedExclusion, earnedExclusion, allowableIrwe,
    countableUnearned: round(countableUnearned), countableEarned, countableTotal,
    federalBenefitRate, estimatedFederalSsi,
    combinedGrossResources: round(earned + unearned + estimatedFederalSsi)
  };
}

export interface WorkMonth { id: string; month: string; earnings: number; hours?: number }
export interface TimelineMonth extends WorkMonth {
  limit: number; sga: number; isTrialMonth: boolean; twpCount: number;
  phase: 'TWP' | 'EPE' | 'After EPE'; epeMonth: number | null;
  sgaFlag: boolean; isGracePossible: boolean;
}
const keyToIndex = (month: string) => { const [year, m] = month.split('-').map(Number); return year * 12 + (m - 1); };
const monthRules = (month: string) => HISTORICAL_LIMITS[Number(month.slice(0, 4))];

export function evaluateWorkTimeline(months: WorkMonth[], blind = false, type: WorkType = 'employee') {
  const clean = [...months]
    .filter(m => /^20\d\d-(0[1-9]|1[0-2])$/.test(m.month) && monthRules(m.month))
    .sort((a,b) => a.month.localeCompare(b.month));
  const seen = new Set<string>();
  const unique = clean.filter(m => { if (seen.has(m.month)) return false; seen.add(m.month); return true; });
  const trialMonths: number[] = [];
  let twpCompletedIndex: number | null = null;
  let graceUsed = false;
  const rows: TimelineMonth[] = unique.map(m => {
    const idx = keyToIndex(m.month);
    const limits = monthRules(m.month);
    const earnings = nonnegative(m.earnings);
    const isTrialMonth = earnings > limits.twp || (type === 'self-employed' && nonnegative(m.hours || 0) > 80);
    const withinWindow = trialMonths.filter(i => i >= idx - 59);
    const priorCount = withinWindow.length;
    const isBeforeCompletion = twpCompletedIndex === null;
    const counted = isBeforeCompletion && isTrialMonth;
    if (counted) trialMonths.push(idx);
    const twpCount = isBeforeCompletion ? Math.min(9, priorCount + (counted ? 1 : 0)) : 9;
    if (isBeforeCompletion && twpCount === 9) twpCompletedIndex = idx;
    const epeMonth = twpCompletedIndex !== null && idx > twpCompletedIndex ? idx - twpCompletedIndex : null;
    const phase: TimelineMonth['phase'] = epeMonth === null ? 'TWP' : epeMonth <= 36 ? 'EPE' : 'After EPE';
    const sga = blind ? limits.blindSga : limits.sga;
    // The cessation/grace determination is fact-specific; this is only a flag.
    const sgaFlag = phase !== 'TWP' && earnings >= sga;
    const isGracePossible = phase === 'EPE' && sgaFlag && !graceUsed;
    if (isGracePossible) graceUsed = true;
    return { ...m, earnings, limit: limits.twp, sga, isTrialMonth: counted, twpCount, phase, epeMonth, sgaFlag, isGracePossible };
  });
  const last = rows.at(-1);
  const missingMonths = unique.slice(1).some((m, i) => keyToIndex(m.month) - keyToIndex(unique[i].month) !== 1);
  const full60MonthsProvided = unique.length >= 60 && !missingMonths;
  return { rows, completedMonth: twpCompletedIndex === null ? null : `${Math.floor(twpCompletedIndex / 12)}-${String(twpCompletedIndex % 12 + 1).padStart(2, '0')}`, trialCount: last?.twpCount || 0, missingMonths, full60MonthsProvided };
}

export type SsdiAssessment = { status: 'generally-payable' | 'review' | 'not-applicable'; message: string; potentialMin: number; potentialMax: number };
export function assessSsdi(monthlyGross: number, monthlySsdi: number, phase: WorkPhase, blind: boolean, year: RulesYear): SsdiAssessment {
  const benefit = nonnegative(monthlySsdi);
  const rules = ANNUAL_RULES[year];
  if (!benefit) return {status: 'not-applicable', message: 'No SSDI benefit amount entered.', potentialMin: 0, potentialMax: 0};
  if (phase === 'twp') return {status: 'generally-payable', message: 'In an available Trial Work Period month, SSDI usually continues regardless of earnings, assuming other eligibility rules are met.', potentialMin: benefit, potentialMax: benefit};
  if (phase === 'unsure') return {status: 'review', message: 'Confirm the TWP/EPE status before estimating SSDI cash payments.', potentialMin: 0, potentialMax: benefit};
  const sga = blind ? rules.blindSga : rules.sga;
  if (monthlyGross >= sga) return {status: 'review', message: 'At or above the SGA guide. SSDI may stop or be suspended, but grace months, IRWE, subsidies, and SSA determinations can change the outcome.', potentialMin: 0, potentialMax: benefit};
  if (phase === 'post-epe') return {status: 'review', message: 'Below the SGA guide; post-EPE eligibility still depends on your SSA record and any prior cessation.', potentialMin: 0, potentialMax: benefit};
  return {status: 'generally-payable', message: 'Below the SGA guide during the EPE; SSDI is generally payable if you remain otherwise eligible.', potentialMin: benefit, potentialMax: benefit};
}

export function makeMonthList(start: string, count: number): WorkMonth[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(`${start}-01T12:00:00`);
    date.setMonth(date.getMonth() + i);
    return {id: `month-${i}`, month: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`, earnings: 0, hours: 0};
  });
}
