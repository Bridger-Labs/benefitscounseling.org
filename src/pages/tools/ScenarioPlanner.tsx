import { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ANNUAL_RULES, BenefitsType, WorkPhase, assessSsdi, calculateSsi, money, monthlyWages } from '@/lib/benefits';
import { useRules } from '@/components/site/SiteLayout';
import { Callout, Field, NumberInput, PageHeading, SelectInput, Stat, Surface } from '@/components/site/Elements';

interface Scenario {id:number;label:string;hours:number;wage:number}
const initial: Scenario[] = [{id:1,label:'Part-time',hours:15,wage:17},{id:2,label:'Steady schedule',hours:25,wage:17},{id:3,label:'Full-time',hours:40,wage:17}];

export function ScenarioPlanner() {
  const {year} = useRules();
  const [benefits,setBenefits] = useState<BenefitsType>('both');
  const [ssdi,setSsdi] = useState(800);
  const [otherUnearned,setOtherUnearned] = useState(0);
  const [phase,setPhase] = useState<WorkPhase>('unsure');
  const [blind,setBlind] = useState(false);
  const [irwe,setIrwe] = useState(0);
  const [baselineHours,setBaselineHours] = useState(0);
  const [baselineWage,setBaselineWage] = useState(17);
  const [scenarios,setScenarios] = useState(initial);
  const hasSsi = benefits !== 'ssdi'; const hasSsdi = benefits !== 'ssi';
  const estimate = (hours:number,wage:number) => {
    const wages=monthlyWages(hours,wage);
    const ssdiAssessment=hasSsdi?assessSsdi(wages,ssdi,phase,blind,year):null;
    // SSI assumes the entered SSDI is actually payable. If it stops, SSI needs a separate recomputation.
    const ssi=hasSsi?calculateSsi({year,grossWages:wages,unearnedIncome:otherUnearned+(hasSsdi?ssdi:0),irwe}):null;
    const income= wages+otherUnearned+(ssi?.estimatedFederalSsi||0);
    const totalMin= income+(ssdiAssessment?.potentialMin||0);
    const totalMax= income+(ssdiAssessment?.potentialMax||0);
    return {wages,ssi,ssdiAssessment,totalMin,totalMax};
  };
  const baseline=estimate(baselineHours,baselineWage);
  const all=scenarios.map(s=>({...s,...estimate(s.hours,s.wage)}));
  const maxBar = Math.max(1, baseline.totalMax, ...all.map(s=>s.totalMax));
  const update=(id:number, key:'hours'|'wage',value:number)=>setScenarios(rows=>rows.map(row=>row.id===id?{...row,[key]:value}:row));
  return <div className="space-y-6"><PageHeading eyebrow="PLANNING / WORK SCENARIOS" title="What if I work more?" description="Explore different schedules side by side. Compare gross pay with simplified estimates of how SSI and SSDI might respond."/>
    <Surface className="p-6 sm:p-8"><div className="mb-6 flex items-center justify-between"><h2 className="form-section-title">Your starting point</h2><span className="tag bg-[#e5f5ed] text-[#287259]">Step 1 / Set up</span></div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><Field label="Benefits you receive"><SelectInput value={benefits} onChange={setBenefits} options={[{value:'ssi',label:'SSI only'},{value:'ssdi',label:'SSDI only'},{value:'both',label:'SSI + SSDI'}]}/></Field>
        {hasSsdi && <Field label="Monthly SSDI amount"><NumberInput value={ssdi} onChange={setSsdi} prefix="$"/></Field>}
        <Field label="Other monthly unearned income"><NumberInput value={otherUnearned} onChange={setOtherUnearned} prefix="$"/></Field>
        {hasSsi && <Field label="Potential eligible IRWE / month"><NumberInput value={irwe} onChange={setIrwe} prefix="$"/></Field>}
        {hasSsdi && <Field label="Current SSDI work phase"><SelectInput value={phase} onChange={setPhase} options={[{value:'unsure',label:'Not sure'},{value:'twp',label:'Within Trial Work Period'},{value:'epe',label:'36-month EPE'},{value:'post-epe',label:'After EPE'}]}/></Field>}
        {hasSsdi && <label className="flex items-center gap-3 self-end pb-3 text-[13px] font-semibold text-slate-600"><input type="checkbox" checked={blind} onChange={e=>setBlind(e.target.checked)} className="h-4 w-4 accent-[#236b51]"/> Use statutory blindness SGA amount</label>}
        <Field label="Current hours / week"><NumberInput value={baselineHours} onChange={setBaselineHours} suffix="hrs"/></Field>
        <Field label="Current hourly wage"><NumberInput value={baselineWage} onChange={setBaselineWage} prefix="$"/></Field>
      </div>
      {hasSsdi && <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">SSDI isn't normally reduced dollar-for-dollar. During an available TWP it generally continues; after that, SGA, grace months and work incentives affect payment eligibility. Results can therefore show a range.</p>}
    </Surface>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="section-heading">Compare your options</h2><p className="mt-1 text-xs text-slate-500">Monthly averages use 52 weeks ÷ 12. Before tax, no state supplements.</p></div><button onClick={()=>setScenarios(s=>s.length>=5?s:[...s,{id:Date.now(),label:`Option ${s.length+1}`,hours:20,wage:17}])} disabled={scenarios.length>=5} className="soft-btn disabled:opacity-50"><Plus size={15}/> Add option</button></div>
    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
      <Surface className="flex flex-col p-5 sm:p-6"><span className="tag w-fit bg-slate-100 text-slate-500">CURRENT BASELINE</span><h3 className="mt-3 font-display text-xl font-bold">Your starting point</h3><p className="mt-1 text-xs text-slate-500">{baselineHours} hrs / week at {money(baselineWage)}</p><div className="mt-7"><p className="text-xs text-slate-500">Estimated monthly total</p><div className="mt-1 font-display text-[29px] font-extrabold tracking-tight text-slate-900">{money(baseline.totalMin)}{baseline.totalMax!==baseline.totalMin && <span className="block text-base">to {money(baseline.totalMax)}</span>}</div></div><div className="mt-auto pt-8"><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div style={{width:`${100*baseline.totalMax/maxBar}%`}} className="h-full rounded-full bg-slate-300"/></div></div><div className="mt-5 text-xs leading-6 text-slate-500">Gross wages: {money(baseline.wages)}<br/>{hasSsi?`Federal SSI (illustrative): ${money(baseline.ssi!.estimatedFederalSsi)}`:'SSI not included'}<br/>{hasSsdi?'SSDI depends on selected phase':'SSDI not included'}</div></Surface>
      {all.map((s,i)=> <Surface key={s.id} className="flex flex-col p-5 sm:p-6"><div className="flex items-start justify-between gap-2"><span className="tag w-fit bg-[#e1f2e8] text-[#35795c]">OPTION {i+1}</span><button onClick={()=>setScenarios(rows=>rows.filter(row=>row.id!==s.id))} aria-label={`Remove ${s.label}`} className="rounded-lg p-1 text-slate-300 hover:bg-red-50 hover:text-red-600"><Trash2 size={15}/></button></div><input className="mt-3 w-full min-w-0 border-0 border-b border-transparent bg-transparent p-0 font-display text-xl font-bold text-slate-900 outline-none focus:border-teal-300" aria-label="Scenario name" value={s.label} onChange={e=>setScenarios(rows=>rows.map(row=>row.id===s.id?{...row,label:e.target.value}:row))}/>
        <div className="mt-4 grid grid-cols-2 gap-3"><Field label="Hours / week"><NumberInput value={s.hours} onChange={v=>update(s.id,'hours',v)} suffix="hrs"/></Field><Field label="Hourly pay"><NumberInput prefix="$" value={s.wage} onChange={v=>update(s.id,'wage',v)}/></Field></div>
        <div className="mt-6"><p className="text-xs text-slate-500">Estimated monthly total</p><div className="mt-1 font-display text-[27px] font-extrabold tracking-tight text-slate-900">{money(s.totalMin)}{s.totalMax!==s.totalMin && <span className="block text-base">to {money(s.totalMax)}</span>}</div><div className={`mt-2 flex items-center gap-1 text-xs font-bold ${s.totalMax>=baseline.totalMax?'text-emerald-700':'text-amber-700'}`}>{s.totalMax>=baseline.totalMax?<ArrowUp size={13}/>:<ArrowDown size={13}/>} {s.totalMax>=baseline.totalMax?'+':''}{money(s.totalMax-baseline.totalMax)} vs baseline (upper estimate)</div></div>
        <div className="mt-auto pt-6"><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div style={{width:`${100*s.totalMax/maxBar}%`}} className="h-full rounded-full bg-[#55b68f]"/></div><div className="mt-5 space-y-2 text-xs text-slate-500"><div className="flex justify-between gap-3"><span>Gross wages</span><strong className="text-slate-800">{money(s.wages)}</strong></div>{hasSsi && <div className="flex justify-between gap-3"><span>Estimated federal SSI</span><strong className="text-slate-800">{money(s.ssi!.estimatedFederalSsi)}</strong></div>}{hasSsdi&&<div className="flex justify-between gap-3"><span>SSDI estimate</span><strong className="text-slate-800">{s.ssdiAssessment?.status==='generally-payable'?money(ssdi):'Needs review'}</strong></div>}</div></div>
      </Surface>)}
    </div>
    <div className="grid gap-4 xl:grid-cols-2"><Callout kind="amber"><strong>Read before using results:</strong> If your SSDI may be suspended, the SSI calculation would also need to be rerun with the actual SSDI received. This planner holds your entered SSDI amount constant as SSI unearned income and does not model the complex interaction. State supplements, payment timing, self-employment and deductions beyond entered IRWE are omitted.</Callout><Callout kind="teal"><strong>What's next:</strong> Try the <Link to="/tools/twp-epe" className="font-bold underline">TWP / EPE tracker</Link> if you don't know your SSDI work stage, or create an easy-to-print <Link to="/tools/report" className="font-bold underline">benefits summary</Link> for a counselor to review. Figures are estimates, not an official decision.</Callout></div>
    <div><Link to="/tools/report" className="solid-btn">Create a benefits report <ArrowRight size={15}/></Link></div>
  </div>;
}
