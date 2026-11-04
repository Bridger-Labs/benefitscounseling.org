import { useState } from 'react';
import { ArrowRight, Calculator, CheckCircle2, Info, RotateCcw } from 'lucide-react';
import { ANNUAL_RULES, calculateSsi, money } from '@/lib/benefits';
import { useRules } from '@/contexts/rules';
import { Callout, Field, NumberInput, PageHeading, SourceLink, Stat, Surface } from '@/components/site/Elements';
import { Link } from 'react-router-dom';
import { NjSupplementChoice } from '@/components/site/NjSupplementChoice';
import { getNjSsiEstimate, type NjArrangement } from '@/lib/njSupplement';

export function SsiCalculator() {
  const {year} = useRules();
  const [wages,setWages] = useState(1200);
  const [njArrangement,setNjArrangement] = useState<NjArrangement>('B');
  const [customNjEnabled,setCustomNjEnabled] = useState(false);
  const [customNjRate,setCustomNjRate] = useState(0);
  const [unearned,setUnearned] = useState(0);
  const [irwe,setIrwe] = useState(0);
  const result = calculateSsi({year,grossWages:wages,unearnedIncome:unearned,irwe});
  const nj = getNjSsiEstimate(result,year,njArrangement,customNjEnabled?customNjRate:undefined);
  const steps = [
    {label:'Gross earned income (wages)',value:money(result.grossWages)},
    {label:'Unused $20 exclusion applied to wages',value:`− ${money(result.generalEarnedExclusion)}`},
    {label:'Standard earned income exclusion',value:`− ${money(result.earnedExclusion)}`},
    {label:'Potential eligible IRWE exclusion',value:`− ${money(result.allowableIrwe)}`},
    {label:'Half of remaining earned income',value:money(result.countableEarned),emphasize:true},
    {label:'Countable unearned income after $20 exclusion',value:money(result.countableUnearned)},
  ];
  return <div className="space-y-6"><PageHeading eyebrow="CALCULATORS / SSI" title="SSI payment calculator" description="See how monthly wages and other income may change federal SSI and, where verified, the NJ state supplement. Adjust the inputs and the math updates instantly." aside={<div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-800"><CheckCircle2 size={15}/> {year} federal rules</div>}/>
    <div className="grid gap-5 xl:grid-cols-[minmax(310px,0.9fr)_minmax(450px,1.1fr)]">
      <Surface className="self-start p-6 sm:p-8"><div className="mb-6 flex items-center justify-between"><div><h2 className="form-section-title">Your monthly income</h2><p className="mt-1 text-xs text-slate-500">For one eligible adult, before taxes.</p></div><span className="tool-icon tool-icon-mint"><Calculator size={22}/></span></div>
        <div className="space-y-6"><Field label="Gross wages per month" help="Your pay before taxes, from a job. Self-employment uses different income rules."><NumberInput prefix="$" value={wages} onChange={setWages}/></Field>
          <Field label="Other countable unearned income / month" help="For example, SSDI, CDB (DAC), or other countable Social Security payments. Do not include SSI itself."><NumberInput prefix="$" value={unearned} onChange={setUnearned}/></Field>
          <Field label="Potential eligible IRWE / month" help="Optional. Enter only impairment-related work expenses SSA may approve. This is not a determination of eligibility."><NumberInput prefix="$" value={irwe} onChange={setIrwe}/></Field>
          <NjSupplementChoice year={year} arrangement={njArrangement} setArrangement={setNjArrangement} customEnabled={customNjEnabled} setCustomEnabled={setCustomNjEnabled} customRate={customNjRate} setCustomRate={setCustomNjRate}/>
          <div className="border-t border-slate-100 pt-5"><button className="soft-btn w-full" onClick={()=>{setWages(0);setUnearned(0);setIrwe(0)}}><RotateCcw size={15}/> Clear inputs</button></div>
        </div>
      </Surface>
      <div className="space-y-5"><Surface className="overflow-hidden"><div className="bg-[#163f3a] px-7 py-7 text-white"><p className="text-xs font-semibold text-[#b2e8ce]">ESTIMATED FEDERAL SSI PAYMENT</p><div className="mt-1 font-display text-[48px] font-extrabold tracking-tight sm:text-[56px]">{money(result.estimatedFederalSsi)}<span className="ml-2 text-base font-medium text-white/60">/ month</span></div><p className="mt-1 text-xs text-[#c5ddd5]">Based on the {year} individual FBR of {money(ANNUAL_RULES[year].fbr)}</p><div className="mt-5 border-t border-white/20 pt-4"><p className="text-xs font-semibold text-[#b2e8ce]">NJ SSI total (illustrative)</p><p className="mt-1 text-2xl font-bold">{nj.combined===null?"Not yet calculable":money(nj.combined)} <span className="text-sm font-normal text-white/70">{nj.combined===null?"— state rate unverified":"/ month"}</span></p></div></div>
        <div className="grid gap-3 p-5 sm:grid-cols-2"><Stat label="Total countable income" value={money(result.countableTotal)} detail="After federal income exclusions"/><Stat label="Gross wages + unearned + estimated SSI" value={money(result.grossWages+result.unearnedIncome+(nj.combined??result.estimatedFederalSsi))} detail={nj.combined===null?"Federal SSI only — NJ component unknown":"Includes illustrated NJ SSI total; before taxes"} accent="teal"/></div></Surface>
        <Surface className="p-6 sm:p-7"><div className="flex items-center justify-between gap-3"><h2 className="form-section-title">How we calculated it</h2><span className="rounded-full bg-[#eff7f2] px-3 py-1.5 text-[11px] font-bold text-[#48896b]">SHOW THE MATH</span></div><div className="mt-5 divide-y divide-slate-100">{steps.map(step=><div className="flex items-center justify-between gap-3 py-3" key={step.label}><span className={`text-[13px] ${step.emphasize?'font-bold text-slate-800':'text-slate-500'}`}>{step.label}</span><strong className={`whitespace-nowrap text-[13px] ${step.emphasize?'text-teal-700':'text-slate-800'}`}>{step.value}</strong></div>)}</div><div className="mt-4 rounded-xl bg-[#f4f8f6] px-4 py-4"><div className="flex justify-between gap-3 text-[13px] font-bold text-slate-800"><span>{money(result.federalBenefitRate)} − {money(result.countableTotal)}</span><span className="text-teal-700">= {money(result.estimatedFederalSsi)}</span></div></div></Surface>
      </div>
    </div>
    <p className="text-xs text-slate-600">{nj.explanation}</p>
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]"><Callout kind="amber"><strong>Important:</strong> This is a simplified SSI illustration, not a payment forecast. NJ supplement categories are modeled for eligible individuals using the verified 2026 rates, not the full SSA determination. Other living arrangements, deemed income, student exclusions, PASS, Blind Work Expenses, Medicaid, resource rules, and retrospective accounting are not modeled. A zero cash estimate does not automatically mean Medicaid ends.</Callout><Callout kind="teal"><strong>Official rule:</strong> The $20 exclusion goes to unearned income first, then any unused part to wages. After the $65 exclusion and qualifying IRWE, half the remaining earnings count. <SourceLink href="https://www.ssa.gov/redbook/eng/earned-income-exclusion.htm">Read SSA's explanation</SourceLink>.</Callout></div>
    <div className="flex flex-wrap items-center justify-between gap-4"><Link to="/tools/scenarios" className="solid-btn">Try different hours & wages <ArrowRight size={16}/></Link><div className="flex items-center gap-2 text-xs text-slate-500"><Info size={15}/> Single-person income estimate; additional NJ and SSA rules may apply.</div></div>
  </div>;
}
