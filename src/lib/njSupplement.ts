import { ANNUAL_RULES, type RulesYear, type SsiResult, money, round } from './benefits';

/** SSA POMS SI 01415.058, NJ optional supplements effective January 1, 2026.
 * These individual rates assume federal living arrangement A (or C for category B),
 * and are NOT applicable to couples, VTR/FLA B, Medicaid institutions, or all recipients.
 * Do not extrapolate them to 2027. */
export const NJ_2026_INDIVIDUAL = {
  B: { label: 'Living alone or with others (NJ category B)', amount: 31.25 },
  A: { label: 'Congregate care (NJ category A)', amount: 150.05 },
  C: { label: 'Living only with an ineligible spouse (NJ category C)', amount: 152.99 },
  I: { label: 'Licensed residential health care facility (NJ category I)', amount: 210.05 },
  Z: { label: 'No NJ supplement (NJ category Z)', amount: 0 },
} as const;

export type NjArrangement = keyof typeof NJ_2026_INDIVIDUAL | 'unsure';
export const NJ_2027_MIN_WAGE = 16.48; // NJDOL effective 2027-01-01 for most workers
export const NJ_2026_MIN_WAGE = 15.92;

export function getNjSsiEstimate(result: SsiResult, year: RulesYear, arrangement: NjArrangement, verifiedCustom?: number) {
  const knownRate = year === 2026 && arrangement !== 'unsure' ? NJ_2026_INDIVIDUAL[arrangement].amount : null;
  const rate = verifiedCustom !== undefined ? Math.max(0, verifiedCustom) : knownRate;
  const source = verifiedCustom !== undefined ? 'user-entered' : knownRate !== null ? 'verified-2026' : 'unknown';
  const combined = rate === null ? null : round(Math.max(0, ANNUAL_RULES[year].fbr + rate - result.countableTotal));
  return { rate, source, combined, federal: result.estimatedFederalSsi,
    /** Difference is illustrative, not a separate SSA payment component. */
    supplementPortion: combined === null ? null : round(Math.max(0, combined - result.estimatedFederalSsi)),
    explanation: rate === null
      ? 'No official NJ supplemental rate for this year/arrangement has been verified here. Showing federal SSI only; actual NJ amount may differ.'
      : `${money(rate)} is the ${source === 'user-entered' ? 'manually entered' : 'published 2026'} NJ supplement standard used in this example. The actual supplement depends on SSA living-arrangement coding and other eligibility factors.`,
  };
}
