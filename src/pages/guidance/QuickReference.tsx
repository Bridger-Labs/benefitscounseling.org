import { useState } from 'react';
import { ANNUAL_RULES, HISTORICAL_LIMITS, money } from '@/lib/benefits';
import { NJ_2026_INDIVIDUAL, NJ_2026_MIN_WAGE, NJ_2027_MIN_WAGE } from '@/lib/njSupplement';
import { Callout, Field, PageHeading, SelectInput, SourceLink, Surface } from '@/components/site/Elements';

// SSA published federal SSI individual/couple maximums; historical amounts are for reference,
// not a substitute for SSA's income, living-arrangement, and payment-timing determinations.
const HISTORICAL_FBR:Record<number,{individual:number;couple:number}> = {
  2017:{individual:735,couple:1103},2018:{individual:750,couple:1125},
  2019:{individual:771,couple:1157},2020:{individual:783,couple:1175},
  2021:{individual:794,couple:1191},2022:{individual:841,couple:1261},
  2023:{individual:914,couple:1371},2024:{individual:943,couple:1415},
  2025:{individual:967,couple:1450},2026:{individual:994,couple:1491},
  2027:{individual:1029,couple:1544},
};
const years=Object.keys(HISTORICAL_LIMITS).map(Number).sort((a,b)=>b-a);
export function QuickReference(){
  const [year,setYear]=useState(2027);
  const federal=HISTORICAL_FBR[year];
  const work=HISTORICAL_LIMITS[year];
  const recent=year===2026?ANNUAL_RULES[2026]:year===2027?ANNUAL_RULES[2027]:null;
  const rows:[string,string,string][]=[
    ['SSI maximum (federal, individual)',money(federal.individual),'SSI'],
    ['SSI maximum (federal, couple)',money(federal.couple),'SSI'],
    ['NJ minimum wage (most workers)',year===2027?money(NJ_2027_MIN_WAGE)+'/hour':year===2026?money(NJ_2026_MIN_WAGE)+'/hour':'Not included','NJ employment'],
    ['NJ SSI supplement (individual, category B)',year===2026?money(NJ_2026_INDIVIDUAL.B.amount):'Not verified here','SSI; specific living arrangements'],
    ['TWP monthly wage trigger','More than '+money(work.twp),'SSDI / CDB'],
    ['SGA, nonblind',money(work.sga),'SSDI / CDB'],
    ['SGA, statutory blindness',money(work.blindSga),'SSDI / CDB'],
    ['SSI student earned income exclusion (monthly)',recent?money(recent.studentMonthly):'Not included','Eligible students'],
    ['SSI student earned income exclusion (annual)',recent?money(recent.studentAnnual):'Not included','Eligible students'],
  ];
  return <div className="space-y-6"><PageHeading eyebrow="GUIDANCE / YEARLY RULES" title="Quick reference" description="Select any year from 2017 through 2027. Historical TWP, SGA and federal SSI maximums are shown for that year, rather than today's amounts."/>
    <Surface className="p-6"><div className="max-w-[250px]"><Field label="Reference year"><SelectInput<number> value={year} onChange={setYear} options={years.map(value=>({label:String(value),value}))}/></Field></div>
      <div className="mt-5 overflow-x-auto"><table className="data-table"><thead><tr><th>Threshold / standard</th><th>{year}</th><th>Applies to</th></tr></thead><tbody>{rows.map(([label,value,applies])=><tr key={label}><td className="font-semibold">{label}</td><td className="whitespace-nowrap font-bold text-[#225b46]">{value}</td><td>{applies}</td></tr>)}</tbody></table></div>
    </Surface><Callout kind="amber">New Jersey's SSI supplement varies by living arrangement. The displayed 2026 category B amount is <strong>not</strong> a universal flat payment. Other NJ supplement years are not shown unless verified. This table is for reference; SSI calculator scenarios remain limited to their supported rules years.</Callout>
    <p className="text-sm text-slate-600">Official sources: <SourceLink href="https://www.ssa.gov/oact/cola/SSIamts.html">Historical federal SSI maximums</SourceLink> · <SourceLink href="https://www.ssa.gov/OACT/cola/twp.html">Historical TWP amounts</SourceLink> · <SourceLink href="https://www.ssa.gov/OACT/cola/sga.html">Historical SGA amounts</SourceLink> · <SourceLink href="https://secure.ssa.gov/poms.nsf/lnx/0501415058">NJ supplement (2026)</SourceLink> · <SourceLink href="https://www.nj.gov/labor/lwdhome/press/2026/20260929_min_wage.shtml">2027 NJ minimum wage</SourceLink>.</p>
  </div>;
}
