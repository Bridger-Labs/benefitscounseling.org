import { useState } from 'react';
import { ArrowRight, Calculator, CheckCircle2, Info, RotateCcw } from 'lucide-react';
import { ANNUAL_RULES, calculateSsi, money } from '@/lib/benefits';
import { useRules } from '@/components/site/SiteLayout';
import { Callout, Field, NumberInput, PageHeading, SourceLink, Stat, Surface } from '@/components/site/Elements';
import { Link } from 'react-router-dom';

export function SsiCalculator() {
  const {year} = useRules();
  const [wages,setWages] = useState(1200);
  const [unearned,setUnearned] = useState(0);
  const [irwe,setIrwe] = useState(0);
  const result = calculateSsi({year,grossWages:wages,unearnedIncome:unearned,irwe});
  const steps = [
    {label:'Gross earned income (wages)',value:money(result.grossWages)},
    {label:'Unused $20 exclusion applied to wages',value:`− ${money(result.generalEarnedExclusion)}`},
    {label:'Standard earned income exclusion',value:`− ${money(result.earnedExclusion)}`},
    {label:'Potential eligible IRWE exclusion',value:`− ${money(result.allowableIrwe)}`},
    {label:'Half of remaining earned income',value:money(result.countableEarned),emphasize:true},
    {label:'Countable unearned income after $20 exclusion',value:money(result.countableUnearned)},
  ];
  return <div className="space-y-6"><PageHeading eyebrow="CALCULATORS / SSI" title="SSI payment calculator" description="See how monthly wages and other income may change your federal SSI payment. Adjust the inputs and the math updates instantly." aside={<div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-800"><CheckCircle2 size={15}/> {year} federal rules</div>}/>
    <div className="grid gap-5 xl:grid-cols-[minmax(310px,0.9fr)_minmax(450px,1.1fr)]">
      <Surface className="self-start p-6 sm:p-8"><div className="mb-6 flex items-center justify-between"><div><h2 className="form-section-title">Your monthly income</h2><p className="mt-1 text-xs text-slate-500">For one eligible adult, before taxes.</p></div><span className="tool-icon tool-icon-mint"><Calculator size={22}/></span></div>
        <div className="space-y-6"><Field label="Gross wages per month" help="Your pay before taxes, from a job. Self-employment uses different income rules."><NumberInput prefix="$" value={wages} onChange={setWages}/></Field>
          <Field label="Other countable unearned income / month" help="For example, SSDI or other Social Security payments. Do not include SSI itself."><NumberInput prefix="$" value={unearned} onChange={setUnearned}/></Field>
          <Field label="Potential eligible IRWE / month" help="Optional. Enter only impairment-related work expenses SSA may approve. This is not a determination of eligibility."><NumberInput prefix="$" value={irwe} onChange={setIrwe}/></Field>
          <div className="border-t border-slate-100 pt-5"><button className="soft-btn w-full" onClick={()=>{setWages(0);setUnearned(0);setIrwe(0)}}><RotateCcw size={15}/> Clear inputs</button></div>
        </div>
      </Surface>
      <div className="space-y-5"><Surface className="overflow-hidden"><div className="bg-[#163f3a] px-7 py-7 text-white"><p className="text-xs font-semibold text-[#b2e8ce]">ESTIMATED FEDERAL SSI PAYMENT</p><div className="mt-1 font-display text-[48px] font-extrabold tracking-tight sm:text-[56px]">{money(result.estimatedFederalSsi)}<span className="ml-2 text-base font-medium text-white/60">/ month</span></div><p className="mt-1 text-xs text-[#c5ddd5]">Based on the {year} individual FBR of {money(ANNUAL_RULES[year].fbr)}</p></div>
        <div className="grid gap-3 p-5 sm:grid-cols-2"><Stat label="Total countable income" value={money(result.countableTotal)} detail="After federal income exclusions"/><Stat label="Gross wages + unearned + SSI" value={money(result.combinedGrossResources)} detail="Illustrative total, before taxes" accent="teal"/></div></Surface>
        <Surface className="p-6 sm:p-7"><div className="flex items-center justify-between gap-3"><h2 className="form-section-title">How we calculated it</h2><span className="rounded-full bg-[#eff7f2] px-3 py-1.5 text-[11px] font-bold text-[#48896b]">SHOW THE MATH</span></div><div className="mt-5 divide-y divide-slate-100">{steps.map(step=><div className="flex items-center justify-between gap-3 py-3" key={step.label}><span className={`text-[13px] ${step.emphasize?'font-bold text-slate-800':'text-slate-500'}`}>{step.label}</span><strong className={`whitespace-nowrap text-[13px] ${step.emphasize?'text-teal-700':'text-slate-800'}`}>{step.value}</strong></div>)}</div><div className="mt-4 rounded-xl bg-[#f4f8f6] px-4 py-4"><div className="flex justify-between gap-3 text-[13px] font-bold text-slate-800"><span>{money(result.federalBenefitRate)} − {money(result.countableTotal)}</span><span className="text-teal-700">= {money(result.estimatedFederalSsi)}</span></div></div></Surface>
      </div>
    </div>
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]"><Callout kind="amber"><strong>Important:</strong> This is a simplified federal SSI illustration, not a payment forecast. State supplements, living arrangements, deemed income, student exclusions, PASS, Blind Work Expenses, Medicaid, resource rules, and retrospective accounting are not modeled. A zero cash estimate does not automatically mean Medicaid ends.</Callout><Callout kind="teal"><strong>Official rule:</strong> The $20 exclusion goes to unearned income first, then any unused part to wages. After the $65 exclusion and qualifying IRWE, half the remaining earnings count. <SourceLink href="https://www.ssa.gov/redbook/eng/earned-income-exclusion.htm">Read SSA's explanation</SourceLink>.</Callout></div>
    <div className="flex flex-wrap items-center justify-between gap-4"><Link to="/tools/scenarios" className="solid-btn">Try different hours & wages <ArrowRight size={16}/></Link><div className="flex items-center gap-2 text-xs text-slate-500"><Info size={15}/> Only the standard single-person federal calculation is included.</div></div>
  </div>;
}
