import { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ANNUAL_RULES, BenefitsType, WorkPhase, assessSsdi, calculateSsi, includesSsi, money, monthlyWages, titleIiLabel, titleIiType } from '@/lib/benefits';
import { useRules } from '@/contexts/rules';
import { NjSupplementChoice } from '@/components/site/NjSupplementChoice';
import { getNjSsiEstimate, type NjArrangement, NJ_2027_MIN_WAGE } from '@/lib/njSupplement';
import { Callout, Field, NumberInput, PageHeading, SelectInput, Stat, Surface } from '@/components/site/Elements';

interface Scenario {id:number;label:string;hours:number;wage:number}
const initial: Scenario[] = [{id:1,label:'Part-time',hours:15,wage:NJ_2027_MIN_WAGE},{id:2,label:'Steady schedule',hours:25,wage:NJ_2027_MIN_WAGE},{id:3,label:'Full-time',hours:40,wage:NJ_2027_MIN_WAGE}];

export function ScenarioPlanner() {
  const {year} = useRules();
  const [benefits,setBenefits] = useState<BenefitsType>('both');
  const [titleIiAmount,setTitleIiAmount] = useState(800);
  const [otherUnearned,setOtherUnearned] = useState(0);
  const [phase,setPhase] = useState<WorkPhase>('unsure');
  const [blind,setBlind] = useState(false);
  const [irwe,setIrwe] = useState(0);
  const [njArrangement,setNjArrangement] = useState<NjArrangement>('B');
  const [customNjEnabled,setCustomNjEnabled] = useState(false);
  const [customNjRate,setCustomNjRate] = useState(0);
  const [baselineHours,setBaselineHours] = useState(0);
  const [baselineWage,setBaselineWage] = useState(NJ_2027_MIN_WAGE);
  const [scenarios,setScenarios] = useState(initial);
  const hasSsi = includesSsi(benefits);
  const titleIi = titleIiType(benefits);
  const hasSsdi = titleIi !== null;
  const label = titleIi ? titleIiLabel(titleIi) : 'SSDI';
  const estimate = (hours:number,wage:number) => {
    const wages=monthlyWages(hours,wage);
    const ssdiAssessment=hasSsdi?assessSsdi(wages,titleIiAmount,phase,blind,year,titleIi==='cdb'?'CDB':'SSDI'):null;
    // SSI assumes the entered SSDI is actually payable. If it stops, SSI needs a separate recomputation.
    const ssi=hasSsi?calculateSsi({year,grossWages:wages,unearnedIncome:otherUnearned+(hasSsdi?titleIiAmount:0),irwe}):null;
    const nj = ssi ? getNjSsiEstimate(ssi,year,njArrangement,customNjEnabled?customNjRate:undefined):null;
    const income= wages+otherUnearned+(nj?.combined??ssi?.estimatedFederalSsi??0);
    const totalMin= income+(ssdiAssessment?.potentialMin||0);
    const totalMax= income+(ssdiAssessment?.potentialMax||0);
    return {wages,ssi,nj,ssdiAssessment,totalMin,totalMax};
  };
  const baseline=estimate(baselineHours,baselineWage);
  const all=scenarios.map(s=>({...s,...estimate(s.hours,s.wage)}));
  const maxBar = Math.max(1, baseline.totalMax, ...all.map(s=>s.totalMax));
  const update=(id:number, key:'hours'|'wage',value:number)=>setScenarios(rows=>rows.map(row=>row.id===id?{...row,[key]:value}:row));
  return <div className="space-y-6"><PageHeading eyebrow="PLANNING / WORK SCENARIOS" title="What if I work more?" description="Explore different schedules side by side. Compare gross pay with simplified estimates of how SSI, SSDI and CDB/DAC might respond."/>
    <Surface className="p-6 sm:p-8"><div className="mb-6 flex items-center justify-between"><h2 className="form-section-title">Your starting point</h2><span className="tag bg-[#e5f5ed] text-[#287259]">Step 1 / Set up</span></div>
      <p className="mb-4 text-xs leading-5 text-teal-800">Default hourly rates in this planner use <strong>$16.48</strong> — NJ minimum wage for most workers starting January 1, 2027. If you are planning for another year or an exempt occupation, edit the hourly rate below.</p>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><Field label="Benefits you receive"><SelectInput value={benefits} onChange={setBenefits} options={[{value:'ssi',label:'SSI only'},{value:'ssdi',label:'SSDI only'},{value:'both',label:'SSI + SSDI'},{value:'cdb',label:'CDB (DAC) only'},{value:'ssi-cdb',label:'SSI + CDB (DAC)'}]}/></Field>
        {hasSsdi && <Field label={`Monthly ${label} amount`}><NumberInput value={titleIiAmount} onChange={setTitleIiAmount} prefix="$"/></Field>}
        <Field label="Other monthly unearned income"><NumberInput value={otherUnearned} onChange={setOtherUnearned} prefix="$"/></Field>
        {hasSsi && <Field label="Potential eligible IRWE / month"><NumberInput value={irwe} onChange={setIrwe} prefix="$"/></Field>}
        {hasSsdi && <Field label={`Current ${label} work phase`}><SelectInput value={phase} onChange={setPhase} options={[{value:'unsure',label:'Not sure'},{value:'twp',label:'Within Trial Work Period'},{value:'epe',label:'36-month EPE'},{value:'post-epe',label:'After EPE'}]}/></Field>}
        {hasSsdi && <label className="flex items-center gap-3 self-end pb-3 text-[13px] font-semibold text-slate-600"><input type="checkbox" checked={blind} onChange={e=>setBlind(e.target.checked)} className="h-4 w-4 accent-[#236b51]"/> Use statutory blindness SGA amount</label>}
        <Field label="Current hours / week"><NumberInput value={baselineHours} onChange={setBaselineHours} suffix="hrs"/></Field>
        <Field label="Current hourly wage"><NumberInput value={baselineWage} onChange={setBaselineWage} prefix="$"/></Field>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-600"><strong>What counts as CDB?</strong> CDB/DAC is a Title II disability benefit paid on a parent’s record. Choose CDB, not SSDI, if that is your payment type. This planner does not model simultaneous SSDI and CDB payments.</p>
      {hasSsi && <div className="mt-5"><NjSupplementChoice year={year} arrangement={njArrangement} setArrangement={setNjArrangement} customEnabled={customNjEnabled} setCustomEnabled={setCustomNjEnabled} customRate={customNjRate} setCustomRate={setCustomNjRate}/></div>}
      {titleIi==='cdb' && <p className="mt-3 text-xs leading-5 text-slate-500">CDB is also called Disabled Adult Child (DAC) benefits. Parent-record entitlement and any SSI/Medicaid protections require separate review; this tool estimates only work-related cash effects.</p>}
      {hasSsdi && <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">{label} isn't normally reduced dollar-for-dollar. During an available TWP it generally continues; after that, SGA, grace months and work incentives affect payment eligibility. Results can therefore show a range.</p>}
    </Surface>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="section-heading">Compare your options</h2><p className="mt-1 text-xs text-slate-500">Monthly averages use 52 weeks ÷ 12. Before tax; estimated NJ SSI supplement included only where rate is known.</p></div><button onClick={()=>setScenarios(s=>s.length>=5?s:[...s,{id:Date.now(),label:`Option ${s.length+1}`,hours:20,wage:NJ_2027_MIN_WAGE}])} disabled={scenarios.length>=5} className="soft-btn disabled:opacity-50"><Plus size={15}/> Add option</button></div>
    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
      <Surface className="flex flex-col p-5 sm:p-6"><span className="tag w-fit bg-slate-100 text-slate-500">CURRENT BASELINE</span><h3 className="mt-3 font-display text-xl font-bold">Your starting point</h3><p className="mt-1 text-xs text-slate-500">{baselineHours} hrs / week at {money(baselineWage)}</p><div className="mt-7"><p className="text-xs text-slate-500">Estimated monthly total</p><div className="mt-1 font-display text-[29px] font-extrabold tracking-tight text-slate-900">{money(baseline.totalMin)}{baseline.totalMax!==baseline.totalMin && <span className="block text-base">to {money(baseline.totalMax)}</span>}</div></div><div className="mt-auto pt-8"><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div style={{width:`${100*baseline.totalMax/maxBar}%`}} className="h-full rounded-full bg-slate-300"/></div></div><div className="mt-5 text-xs leading-6 text-slate-500">Gross wages: {money(baseline.wages)}<br/>{hasSsi?`SSI illustration (NJ if known): ${money(baseline.nj?.combined??baseline.ssi!.estimatedFederalSsi)}`:'SSI not included'}<br/>{hasSsdi?`${label} depends on selected phase`:'Title II disability benefit not included'}</div></Surface>
      {all.map((s,i)=> <Surface key={s.id} className="flex flex-col p-5 sm:p-6"><div className="flex items-start justify-between gap-2"><span className="tag w-fit bg-[#e1f2e8] text-[#35795c]">OPTION {i+1}</span><button onClick={()=>setScenarios(rows=>rows.filter(row=>row.id!==s.id))} aria-label={`Remove ${s.label}`} className="rounded-lg p-1 text-slate-300 hover:bg-red-50 hover:text-red-600"><Trash2 size={15}/></button></div><input className="mt-3 w-full min-w-0 border-0 border-b border-transparent bg-transparent p-0 font-display text-xl font-bold text-slate-900 outline-none focus:border-teal-300" aria-label="Scenario name" value={s.label} onChange={e=>setScenarios(rows=>rows.map(row=>row.id===s.id?{...row,label:e.target.value}:row))}/>
        <div className="mt-4 grid grid-cols-2 gap-3"><Field label="Hours / week"><NumberInput value={s.hours} onChange={v=>update(s.id,'hours',v)} suffix="hrs"/></Field><Field label="Hourly pay"><NumberInput prefix="$" value={s.wage} onChange={v=>update(s.id,'wage',v)}/></Field></div>
        <div className="mt-6"><p className="text-xs text-slate-500">Estimated monthly total</p><div className="mt-1 font-display text-[27px] font-extrabold tracking-tight text-slate-900">{money(s.totalMin)}{s.totalMax!==s.totalMin && <span className="block text-base">to {money(s.totalMax)}</span>}</div><div className={`mt-2 flex items-center gap-1 text-xs font-bold ${s.totalMax>=baseline.totalMax?'text-emerald-700':'text-amber-700'}`}>{s.totalMax>=baseline.totalMax?<ArrowUp size={13}/>:<ArrowDown size={13}/>} {s.totalMax>=baseline.totalMax?'+':''}{money(s.totalMax-baseline.totalMax)} vs baseline (upper estimate)</div></div>
        <div className="mt-auto pt-6"><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div style={{width:`${100*s.totalMax/maxBar}%`}} className="h-full rounded-full bg-[#55b68f]"/></div><div className="mt-5 space-y-2 text-xs text-slate-500"><div className="flex justify-between gap-3"><span>Gross wages</span><strong className="text-slate-800">{money(s.wages)}</strong></div>{hasSsi && <div className="flex justify-between gap-3"><span>Estimated SSI (incl. NJ if known)</span><strong className="text-slate-800">{money(s.nj?.combined??s.ssi!.estimatedFederalSsi)}{s.nj?.combined===null?' (federal only)':''}</strong></div>}{hasSsdi&&<div className="flex justify-between gap-3"><span>{label} estimate</span><strong className="text-slate-800">{s.ssdiAssessment?.status==='generally-payable'?money(titleIiAmount):'Needs review'}</strong></div>}</div></div>
      </Surface>)}
    </div>
    <div className="grid gap-4 xl:grid-cols-2"><Callout kind="amber"><strong>Read before using results:</strong> {hasSsdi ? <>If your {label} may be suspended, the SSI calculation would also need to be rerun with the actual {label} received. This planner holds your entered {label} amount constant as SSI unearned income and does not model the complex interaction. </> : <>This is a simplified federal SSI estimate, not a payment forecast. </>} NJ supplement is illustrated for verified categories only. The 2027 NJ supplement is unknown unless a confirmed amount is entered; payment timing, self-employment and further deductions are omitted.</Callout><Callout kind="teal"><strong>What's next:</strong> Try the <Link to="/tools/twp-epe" className="font-bold underline">TWP / EPE tracker</Link> if you don't know your Title II work stage, or create an easy-to-print <Link to="/tools/report" className="font-bold underline">benefits summary</Link> for a counselor to review. Figures are estimates, not an official decision.</Callout></div>
    <div><Link to="/tools/report" className="solid-btn">Create a benefits report <ArrowRight size={15}/></Link></div>
  </div>;
}
