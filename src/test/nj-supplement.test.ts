import { describe, expect, it } from 'vitest';
import { calculateSsi } from '../lib/benefits';
import { getNjSsiEstimate, NJ_2026_INDIVIDUAL, NJ_2027_MIN_WAGE } from '../lib/njSupplement';
import { buildBenefitsReport } from '../lib/report';

describe('New Jersey SSI supplement (educational)', () => {
  const zero26=calculateSsi({year:2026,grossWages:0,unearnedIncome:0,irwe:0});
  const zero27=calculateSsi({year:2027,grossWages:0,unearnedIncome:0,irwe:0});
  it('uses the published 2026 code B individual rate, but does not invent 2027 rates', () => {
    expect(NJ_2026_INDIVIDUAL.B.amount).toBe(31.25);
    expect(getNjSsiEstimate(zero26,2026,'B')).toMatchObject({rate:31.25,combined:1025.25,source:'verified-2026'});
    expect(getNjSsiEstimate(zero27,2027,'B')).toMatchObject({rate:null,combined:null,source:'unknown'});
  });
  it('allows an explicitly confirmed 2027 rate, without inheriting 2026', () => {
    expect(getNjSsiEstimate(zero27,2027,'B',40)).toMatchObject({rate:40,combined:1069,source:'user-entered'});
  });
  it('does not pay negative cash amounts or add the NJ standard as an unearned income item', () => {
    const estimate=calculateSsi({year:2026,grossWages:2400,unearnedIncome:0,irwe:0});
    const nj=getNjSsiEstimate(estimate,2026,'B');
    expect(nj.combined).toBeGreaterThanOrEqual(0);
    expect(nj.combined).toBeLessThanOrEqual(1025.25);
  });
  it('uses verified NJ wage default for 2027',()=>expect(NJ_2027_MIN_WAGE).toBe(16.48));
});

describe('benefits report NJ integration',()=>{
  const input={benefitType:'ssi' as const,year:2026 as const,hours:0,wage:16.48,titleIiAmount:0,otherUnearned:0,irwe:0,phase:'unsure' as const,blind:false,njArrangement:'B' as const};
  it('shows combined state and federal estimate when the 2026 standard is known',()=>{
    expect(buildBenefitsReport(input).estimatedCombinedSsi).toBe(1025.25);
  });
  it('does not invent a 2027 combined total',()=>{
    expect(buildBenefitsReport({...input,year:2027}).estimatedCombinedSsi).toBeNull();
  });
});
