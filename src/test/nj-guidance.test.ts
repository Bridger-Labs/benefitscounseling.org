import { describe, expect, it } from 'vitest';
import { NJ_COUNTIES, getNjCountyAgency } from '../lib/njCounties';
import { evaluateWorkTimeline, HISTORICAL_LIMITS } from '../lib/benefits';

describe('New Jersey county contacts', () => {
  it('covers each of the 21 New Jersey counties once', () => {
    expect(NJ_COUNTIES).toHaveLength(21);
    expect(new Set(NJ_COUNTIES.map(c => c.county)).size).toBe(21);
    expect(NJ_COUNTIES.every(c => c.agency && c.phone && c.address && c.fax && c.hours)).toBe(true);
  });
  it("selects Camden's county social services agency, not an SSA office", () => {
    expect(getNjCountyAgency('Camden')?.phone).toBe('856-225-8800');
    expect(getNjCountyAgency('Camden')?.fax).toBe('856-225-7797');
    expect(getNjCountyAgency('Camden')?.hours).toContain('8:30 AM');
    expect(getNjCountyAgency('Gloucester')?.fax).toBe('856-256-2214');
    expect(getNjCountyAgency('Not a county')).toBeUndefined();
  });
});

describe('historical SSA work thresholds', () => {
  it('applies 2022 TWP and SGA values to 2022 months', () => {
    expect(HISTORICAL_LIMITS[2022]).toEqual({twp:970,sga:1350,blindSga:2260});
    const result = evaluateWorkTimeline([
      {id:'at',month:'2022-01',earnings:970},
      {id:'over',month:'2022-02',earnings:971},
      {id:'new',month:'2023-01',earnings:1000},
    ]);
    expect(result.rows.map(r=>r.limit)).toEqual([970,970,1050]);
    expect(result.rows.map(r=>r.isTrialMonth)).toEqual([false,true,false]);
    expect(result.rows.map(r=>r.sga)).toEqual([1350,1350,1470]);
  });
  it('uses the 2022 blind SGA guide for 2022 blind work history', () => {
    expect(evaluateWorkTimeline([{id:'a',month:'2022-05',earnings:1500}],true).rows[0].sga).toBe(2260);
  });
});
