import { describe, expect, it } from 'vitest';
import { ANNUAL_RULES, assessSsdi, calculateSsi, evaluateWorkTimeline, makeMonthList, monthlyWages } from '../lib/benefits';

describe('SSI individual calculation', () => {
  it('returns the published 2026/2027 FBR at zero income', () => {
    expect(calculateSsi({grossWages:0,unearnedIncome:0,irwe:0,year:2026}).estimatedFederalSsi).toBe(994);
    expect(calculateSsi({grossWages:0,unearnedIncome:0,irwe:0,year:2027}).estimatedFederalSsi).toBe(1029);
  });
  it('applies the standard $20 then $65 then half earned exclusion', () => {
    const result=calculateSsi({grossWages:317,unearnedIncome:0,irwe:0,year:2026});
    expect(result.countableEarned).toBe(116);
    expect(result.estimatedFederalSsi).toBe(878);
  });
  it('applies the $20 general exclusion to unearned income first', () => {
    const result=calculateSsi({grossWages:289,unearnedIncome:361,irwe:0,year:2026});
    expect(result.countableUnearned).toBe(341);
    expect(result.countableEarned).toBe(112);
    expect(result.estimatedFederalSsi).toBe(541);
  });
  it('applies IRWE before halving the remaining earnings', () => {
    const result=calculateSsi({grossWages:317,unearnedIncome:0,irwe:100,year:2026});
    expect(result.countableEarned).toBe(66);
    expect(result.estimatedFederalSsi).toBe(928);
  });
  it('never produces negative payments', () => {
    expect(calculateSsi({grossWages:5000,unearnedIncome:2000,irwe:0,year:2026}).estimatedFederalSsi).toBe(0);
  });
});

describe('SSDI work incentives', () => {
  it('uses strict greater-than to count a TWP wages month', () => {
    const months=[{id:'a',month:'2026-01',earnings:1210},{id:'b',month:'2026-02',earnings:1210.01}];
    const result=evaluateWorkTimeline(months);
    expect(result.rows[0].isTrialMonth).toBe(false);
    expect(result.rows[1].isTrialMonth).toBe(true);
  });
  it('starts EPE the month after nine TWP service months', () => {
    const months=makeMonthList('2026-01',12).map((m,i)=>({...m,earnings:i<9?1300:500}));
    const result=evaluateWorkTimeline(months);
    expect(result.completedMonth).toBe('2026-09');
    expect(result.rows[8].phase).toBe('TWP');
    expect(result.rows[9].phase).toBe('EPE');
    expect(result.rows[9].epeMonth).toBe(1);
  });
  it('excludes service months more than 60 months old', () => {
    const early={id:'early',month:'2020-01',earnings:1500};
    const later=makeMonthList('2025-01',8).map((m,i)=>({...m,id:`later-${i}`,earnings:1500}));
    const result=evaluateWorkTimeline([early,...later]);
    expect(result.completedMonth).toBe(null);
    expect(result.trialCount).toBe(8);
    expect(result.missingMonths).toBe(true);
  });
  it('flags SGA rather than making categorical payable decisions', () => {
    const result=assessSsdi(1800,1200,'epe',false,2026);
    expect(result.status).toBe('review');
    expect(result.potentialMin).toBe(0);
    expect(result.potentialMax).toBe(1200);
    expect(ANNUAL_RULES[2027].sga).toBe(1770);
  });
  it('calculates monthly wages using 52/12 weeks', () => {
    expect(monthlyWages(20,15)).toBe(1300);
  });
});
