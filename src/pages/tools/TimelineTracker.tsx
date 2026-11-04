import { HISTORICAL_LIMITS } from '@/lib/benefits';
import { useState } from 'react';
import { ArrowDownToLine, CalendarDays, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { ANNUAL_RULES, applyRecurringWages, evaluateWorkTimeline, makeMonthList, money, WorkMonth, WorkType } from '@/lib/benefits';
import { useRules } from '@/contexts/rules';
import { Callout, Field, NumberInput, PageHeading, SelectInput, Stat, Surface, SourceLink } from '@/components/site/Elements';

export function TimelineTracker() {
  const {year}=useRules();
  const [start,setStart]=useState('2026-01');
  const [months,setMonths]=useState<WorkMonth[]>(makeMonthList('2026-01',12));
  const [blind,setBlind]=useState(false);
  const [workType,setWorkType]=useState<WorkType>('employee');
  const [benefitType,setBenefitType]=useState<'ssdi'|'cdb'>('ssdi');
  const [recurringGross, setRecurringGross] = useState<number>(0);
  const evalResult = evaluateWorkTimeline(months,blind,workType);
  const unsupportedMonths = months.filter(row => !/^20\d{2}-(0[1-9]|1[0-2])$/.test(row.month) || !Object.prototype.hasOwnProperty.call(HISTORICAL_LIMITS, Number(row.month.slice(0,4))));
  const completed = evalResult.completedMonth;
  const countedMonths = evalResult.rows.filter(m=>m.isTrialMonth);
  const last = evalResult.rows.at(-1);
  const updateMonth=(id:string,key:'month'|'earnings'|'hours',value:string|number) => setMonths(rows=>rows.map(row=> {
    if (row.id !== id) return row;
    if (key === 'month') return {...row, month: String(value)};
    if (key === 'hours') return {...row, hours: Number(value)};
    return {...row, earnings: Number(value), wageOverride: Number(value) !== recurringGross};
  }));
  const updateRecurringGross=(value:number)=>{
    setRecurringGross(value);
    setMonths(rows=>applyRecurringWages(rows,value));
  };
  const fillAllMonths=()=>setMonths(rows=>applyRecurringWages(rows,recurringGross,true));
  const load=(count:number)=>setMonths(applyRecurringWages(makeMonthList(start,count),recurringGross,true));
  const add=()=>{
    const lastMonth=[...months].sort((a,b)=>a.month.localeCompare(b.month)).at(-1)?.month ?? start;
    const d=new Date(`${lastMonth}-01T12:00:00`);d.setMonth(d.getMonth()+1);
    const next=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    setMonths(rows=>[...rows,{id:`custom-${Date.now()}`,month:next,earnings:recurringGross,hours:0,wageOverride:false}]);
  };
  const exportCsv=()=>{
    const head=['Month','Gross earnings','Self-employment hours','TWP trigger for month','SGA guide for month','Phase','TWP month','TWP count','EPE month','SGA review flag'];
    const lines=[head.join(','),...evalResult.rows.map(row=>[row.month,row.earnings,row.hours||0,row.limit,row.sga,row.phase,row.isTrialMonth?'Yes':'No',row.twpCount,row.epeMonth??'',row.sgaFlag?'Review':''].join(','))];
    const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='twp-epe-illustration.csv';a.click();URL.revokeObjectURL(url);
  };
  return <div className="space-y-6"><PageHeading eyebrow="CALCULATORS / SSDI + CDB" title="Trial Work Period & EPE tracker" description="Track work history for SSDI or Childhood Disability Benefits (CDB / DAC, also a Title II disability benefit). See possible TWP service months and when the 36-month EPE may begin. This is illustrative, not an SSA determination."/>
    <p className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">Want to fill every <strong>Gross earnings</strong> cell at once? Enter <a href="#recurring-wages" className="font-bold underline">Recurring gross monthly wages</a> in Work history settings below, then edit exceptions in individual months.</p>
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="TWP months identified" value={`${evalResult.trialCount} of 9`} detail="Within the history entered" accent="teal"/><Stat label="Possible ninth TWP month" value={completed||'Not reached'} detail="EPE generally begins the following month"/><Stat label="Last recorded phase" value={last?.phase??'No data'} detail={last?.epeMonth?`EPE month ${last.epeMonth}`:'Subject to complete work history'} accent="purple"/></div>
    <Surface className="p-6 sm:p-7"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="form-section-title">Work history settings</h2><p className="mt-1 text-xs text-slate-500">Each row uses SSA thresholds for that row’s calendar year (2017–2027), even if the header year differs. Self-employment is more complex.</p></div><CalendarDays className="text-teal-600" size={22}/></div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Field label="Benefit you receive"><SelectInput value={benefitType} onChange={setBenefitType} options={[{value:'ssdi',label:'SSDI'},{value:'cdb',label:'CDB (Disabled Adult Child / DAC)'}]}/></Field><Field label="Type of work"><SelectInput value={workType} onChange={setWorkType} options={[{value:'employee',label:'Employee wages'},{value:'self-employed',label:'Self-employment (simplified)'}]}/></Field><Field label="Start month for new rows"><input className="field-input" type="month" min="2017-01" max="2027-12" value={start} onChange={e=>setStart(e.target.value)}/></Field>
        <div className="flex flex-wrap items-end gap-2"><button className="soft-btn" onClick={()=>load(12)}><RotateCcw size={15}/> 12 months</button><button className="soft-btn" onClick={()=>load(60)}>60 months</button></div>
        <label className="flex items-center gap-3 self-end pb-3 text-[13px] font-semibold text-slate-600"><input className="h-4 w-4 accent-[#236b51]" type="checkbox" checked={blind} onChange={e=>setBlind(e.target.checked)}/> Statutory blindness SGA guide</label>
      </div>
      {workType === 'employee' && <div id="recurring-wages" className="mt-6 scroll-mt-28 rounded-xl border border-teal-100 bg-[#f5faf7] p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-4"><div className="min-w-[200px] flex-1"><Field label="Recurring gross monthly wages" help="Enter once to automatically populate all non-overridden months. Changes to individual months are preserved."><NumberInput prefix="$" value={recurringGross} onChange={updateRecurringGross}/></Field></div><button className="soft-btn" onClick={fillAllMonths} title="Replace even months you edited manually"><RotateCcw size={15}/> Replace all monthly wages</button></div>
        <p className="mt-3 text-xs leading-5 text-slate-600">A changed month is an override. You can always edit a month after filling the table; changing the recurring amount won't overwrite your exceptions.</p>
      </div>}
      <div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-[#f5f9f7] px-4 py-3 text-xs text-slate-600"><strong className="block text-sm text-[#246b50]">{money(ANNUAL_RULES[year].twp)}</strong> {year} TWP trigger (earnings must exceed)</div><div className="rounded-xl bg-[#f5f9f7] px-4 py-3 text-xs text-slate-600"><strong className="block text-sm text-[#246b50]">{money(blind?ANNUAL_RULES[year].blindSga:ANNUAL_RULES[year].sga)}</strong> {year} SGA guide</div><div className="rounded-xl bg-[#f5f9f7] px-4 py-3 text-xs text-slate-600"><strong className="block text-sm text-[#246b50]">9 / 60 months</strong> Rolling TWP evaluation window</div></div>
    </Surface>
    <Surface className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-4"><div><h2 className="form-section-title">Monthly work record</h2><p className="mt-1 text-xs text-slate-500">Empty fields mean $0. Recurring wages fill the table, while individual months can be changed.</p></div><div className="flex flex-wrap gap-2"><button className="soft-btn" onClick={add}><Plus size={15}/> Add month</button><button className="soft-btn" onClick={exportCsv}><ArrowDownToLine size={15}/> Export CSV</button></div></div>
      {unsupportedMonths.length > 0 && <div role="alert" className="mx-6 mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{unsupportedMonths.length} month(s) fall outside the supported historical range (2017–2027) or have invalid dates; they are excluded from the calculation. Correct those dates before using the estimate.</div>}
      <div className="overflow-x-auto"><table className="data-table min-w-[980px]"><thead><tr><th>Month</th><th>Gross earnings</th>{workType==='self-employed'&&<th>Self-employed hours</th>}<th>TWP trigger (month year)</th><th>SGA guide (month year)</th><th>Work stage</th><th>TWP count</th><th>Work review</th><th><span className="sr-only">Remove</span></th></tr></thead><tbody>
        {evalResult.rows.map(row=><tr key={row.id}><td><input className="field-input h-9 w-[152px] text-xs" aria-label="Work month" type="month" min="2017-01" max="2027-12" value={row.month} onChange={e=>updateMonth(row.id,'month',e.target.value)}/></td><td><div className="w-[152px]"><NumberInput prefix="$" value={row.earnings} onChange={v=>updateMonth(row.id,'earnings',v)}/>{workType==='employee' && row.wageOverride && <div className="mt-1 flex items-center justify-between gap-1 text-[10px] text-teal-700"><span>Custom month</span><button className="underline hover:text-teal-900" onClick={()=>setMonths(rows=>rows.map(m=>m.id===row.id?{...m, earnings:recurringGross,wageOverride:false}:m))}>Use recurring</button></div>}</div></td>{workType==='self-employed'&&<td><div className="w-[100px]"><NumberInput value={row.hours||0} onChange={v=>updateMonth(row.id,'hours',v)} suffix="hr"/></div></td>}
          <td className="whitespace-nowrap text-xs font-semibold text-slate-700">&gt; {money(row.limit)}</td><td className="whitespace-nowrap text-xs font-semibold text-slate-700">{money(row.sga)}</td>
          <td><span className={`tag ${row.phase==='TWP'?'bg-teal-50 text-teal-800':row.phase==='EPE'?'bg-violet-50 text-violet-800':'bg-slate-100 text-slate-600'}`}>{row.phase}{row.epeMonth?` · ${row.epeMonth}`:''}</span></td>
          <td><span className="text-xs font-bold text-slate-800">{row.twpCount}/9</span>{row.isTrialMonth&&<span className="ml-2 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">counts</span>}</td>
          <td>{row.sgaFlag?<span className="text-xs font-bold text-amber-700">At/above SGA · review{row.isGracePossible?' grace':''}</span>:<span className="text-xs text-slate-400">—</span>}</td><td><button className="p-2 text-slate-400 hover:text-rose-600" aria-label={`Remove ${row.month}`} onClick={()=>setMonths(s=>s.filter(x=>x.id!==row.id))}><Trash2 size={15}/></button></td></tr>)}
      </tbody></table></div>
      <div className="border-t border-slate-100 bg-[#fbfcfb] px-6 py-4 text-xs text-slate-500">{countedMonths.length} counted service month(s) in the entered period. For employees, wages must exceed the TWP trigger for that month’s year to count. See <SourceLink href="https://www.ssa.gov/OACT/cola/twp.html">historical TWP</SourceLink> and <SourceLink href="https://www.ssa.gov/OACT/cola/sga.html">historical SGA</SourceLink>. {workType==='self-employed'?'Self-employment also considers working more than 80 hours/month; the rules are more nuanced.':''}</div>
    </Surface>
    <div className="grid gap-4 lg:grid-cols-2"><Callout kind="amber"><strong>Incomplete history risk:</strong> {evalResult.missingMonths?'There are gaps in your entered months. ':'This estimate uses only the months entered. '}For a reliable rolling 60-month assessment, you need the relevant full history and SSA's official TWP records. Repeated wages are a planning shortcut, not verified earnings. A completed TWP, prior entitlement, work subsidies, unreported work or missing months can change results. {evalResult.full60MonthsProvided?'You have entered at least 60 consecutive months, but these still need SSA verification.':''}</Callout><Callout kind="teal"><strong>After month nine:</strong> The EPE lasts 36 consecutive months. First-time SGA during EPE can trigger an SSA cessation determination and a three-month grace period. This table flags SGA; it <strong>does not determine payable months</strong>. <SourceLink href="https://www.ssa.gov/redbook/eng/epe.htm">Read SSA EPE policy</SourceLink>.</Callout></div>
  </div>;
}
