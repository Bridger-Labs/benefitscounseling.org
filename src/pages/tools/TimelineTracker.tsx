import { useState } from 'react';
import { ArrowDownToLine, CalendarDays, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { ANNUAL_RULES, evaluateWorkTimeline, makeMonthList, money, WorkMonth, WorkType } from '@/lib/benefits';
import { useRules } from '@/components/site/SiteLayout';
import { Callout, Field, NumberInput, PageHeading, SelectInput, Stat, Surface, SourceLink } from '@/components/site/Elements';

export function TimelineTracker() {
  const {year}=useRules();
  const [start,setStart]=useState('2026-01');
  const [months,setMonths]=useState<WorkMonth[]>(makeMonthList('2026-01',12));
  const [blind,setBlind]=useState(false);
  const [workType,setWorkType]=useState<WorkType>('employee');
  const evalResult = evaluateWorkTimeline(months,blind,workType);
  const completed = evalResult.completedMonth;
  const countedMonths = evalResult.rows.filter(m=>m.isTrialMonth);
  const last = evalResult.rows.at(-1);
  const updateMonth=(id:string,key:'month'|'earnings'|'hours',value:string|number) => setMonths(rows=>rows.map(row=>row.id===id?{...row,[key]:value}:row));
  const load=(count:number)=>setMonths(makeMonthList(start,count));
  const add=()=>{
    const lastMonth=[...months].sort((a,b)=>a.month.localeCompare(b.month)).at(-1)?.month ?? start;
    const d=new Date(`${lastMonth}-01T12:00:00`);d.setMonth(d.getMonth()+1);
    const next=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    setMonths(rows=>[...rows,{id:`custom-${Date.now()}`,month:next,earnings:0,hours:0}]);
  };
  const exportCsv=()=>{
    const head=['Month','Gross earnings','Self-employment hours','Phase','TWP month','TWP count','EPE month','SGA guide','SGA review flag'];
    const lines=[head.join(','),...evalResult.rows.map(row=>[row.month,row.earnings,row.hours||0,row.phase,row.isTrialMonth?'Yes':'No',row.twpCount,row.epeMonth??'',row.sga,row.sgaFlag?'Review':''].join(','))];
    const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='twp-epe-illustration.csv';a.click();URL.revokeObjectURL(url);
  };
  return <div className="space-y-6"><PageHeading eyebrow="CALCULATORS / SSDI" title="Trial Work Period & EPE tracker" description="Enter your work history to identify possible TWP service months and see when the 36-month Extended Period of Eligibility may begin. This is an illustrative timeline, not an SSA work determination."/>
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="TWP months identified" value={`${evalResult.trialCount} of 9`} detail="Within the history entered" accent="teal"/><Stat label="Possible ninth TWP month" value={completed||'Not reached'} detail="EPE generally begins the following month"/><Stat label="Last recorded phase" value={last?.phase??'No data'} detail={last?.epeMonth?`EPE month ${last.epeMonth}`:'Subject to complete work history'} accent="purple"/></div>
    <Surface className="p-6 sm:p-7"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="form-section-title">Work history settings</h2><p className="mt-1 text-xs text-slate-500">Use gross wages for employees; net earnings and hours for self-employment are more complex.</p></div><CalendarDays className="text-teal-600" size={22}/></div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Field label="Type of work"><SelectInput value={workType} onChange={setWorkType} options={[{value:'employee',label:'Employee wages'},{value:'self-employed',label:'Self-employment (simplified)'}]}/></Field><Field label="Start month for new rows"><input className="field-input" type="month" min="2017-01" max="2027-12" value={start} onChange={e=>setStart(e.target.value)}/></Field>
        <div className="flex flex-wrap items-end gap-2"><button className="soft-btn" onClick={()=>load(12)}><RotateCcw size={15}/> 12 months</button><button className="soft-btn" onClick={()=>load(60)}>60 months</button></div>
        <label className="flex items-center gap-3 self-end pb-3 text-[13px] font-semibold text-slate-600"><input className="h-4 w-4 accent-[#236b51]" type="checkbox" checked={blind} onChange={e=>setBlind(e.target.checked)}/> Statutory blindness SGA guide</label>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-[#f5f9f7] px-4 py-3 text-xs text-slate-600"><strong className="block text-sm text-[#246b50]">{money(ANNUAL_RULES[year].twp)}</strong> {year} TWP trigger (earnings must exceed)</div><div className="rounded-xl bg-[#f5f9f7] px-4 py-3 text-xs text-slate-600"><strong className="block text-sm text-[#246b50]">{money(blind?ANNUAL_RULES[year].blindSga:ANNUAL_RULES[year].sga)}</strong> {year} SGA guide</div><div className="rounded-xl bg-[#f5f9f7] px-4 py-3 text-xs text-slate-600"><strong className="block text-sm text-[#246b50]">9 / 60 months</strong> Rolling TWP evaluation window</div></div>
    </Surface>
    <Surface className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-4"><div><h2 className="form-section-title">Monthly work record</h2><p className="mt-1 text-xs text-slate-500">A zero means no earnings. Enter all months, including those with no work.</p></div><div className="flex flex-wrap gap-2"><button className="soft-btn" onClick={add}><Plus size={15}/> Add month</button><button className="soft-btn" onClick={exportCsv}><ArrowDownToLine size={15}/> Export CSV</button></div></div>
      <div className="overflow-x-auto"><table className="data-table min-w-[700px]"><thead><tr><th>Month</th><th>Gross earnings</th>{workType==='self-employed'&&<th>Self-employed hours</th>}<th>Work stage</th><th>TWP count</th><th>Work review</th><th><span className="sr-only">Remove</span></th></tr></thead><tbody>
        {evalResult.rows.map(row=><tr key={row.id}><td><input className="field-input h-9 w-[152px] text-xs" aria-label="Work month" type="month" min="2017-01" max="2027-12" value={row.month} onChange={e=>updateMonth(row.id,'month',e.target.value)}/></td><td><div className="w-[135px]"><NumberInput prefix="$" value={row.earnings} onChange={v=>updateMonth(row.id,'earnings',v)}/></div></td>{workType==='self-employed'&&<td><div className="w-[100px]"><NumberInput value={row.hours||0} onChange={v=>updateMonth(row.id,'hours',v)} suffix="hr"/></div></td>}
          <td><span className={`tag ${row.phase==='TWP'?'bg-teal-50 text-teal-800':row.phase==='EPE'?'bg-violet-50 text-violet-800':'bg-slate-100 text-slate-600'}`}>{row.phase}{row.epeMonth?` · ${row.epeMonth}`:''}</span></td>
          <td><span className="text-xs font-bold text-slate-800">{row.twpCount}/9</span>{row.isTrialMonth&&<span className="ml-2 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">counts</span>}</td>
          <td>{row.sgaFlag?<span className="text-xs font-bold text-amber-700">At/above SGA · review{row.isGracePossible?' grace':''}</span>:<span className="text-xs text-slate-400">—</span>}</td><td><button className="p-2 text-slate-400 hover:text-rose-600" aria-label={`Remove ${row.month}`} onClick={()=>setMonths(s=>s.filter(x=>x.id!==row.id))}><Trash2 size={15}/></button></td></tr>)}
      </tbody></table></div>
      <div className="border-t border-slate-100 bg-[#fbfcfb] px-6 py-4 text-xs text-slate-500">{countedMonths.length} counted service month(s) in the entered period. Any month with earnings <strong>over</strong> the applicable TWP limit counts for an employee. {workType==='self-employed'?'Self-employment also considers working more than 80 hours/month; the rules are more nuanced.':''}</div>
    </Surface>
    <div className="grid gap-4 lg:grid-cols-2"><Callout kind="amber"><strong>Incomplete history risk:</strong> {evalResult.missingMonths?'There are gaps in your entered months. ':'This estimate uses only the months entered. '}For a reliable rolling 60-month assessment, you need the relevant full history and SSA's official TWP records. A completed TWP, prior entitlement, work subsidies, unreported work or missing months can change results. {evalResult.full60MonthsProvided?'You have entered at least 60 consecutive months, but these still need SSA verification.':''}</Callout><Callout kind="teal"><strong>After month nine:</strong> The EPE lasts 36 consecutive months. First-time SGA during EPE can trigger an SSA cessation determination and a three-month grace period. This table flags SGA; it <strong>does not determine payable months</strong>. <SourceLink href="https://www.ssa.gov/redbook/eng/epe.htm">Read SSA EPE policy</SourceLink>.</Callout></div>
  </div>;
}
