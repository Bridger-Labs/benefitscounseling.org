import { useState } from 'react';
import { ArrowDownToLine, FileDown, FileText, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import { BenefitsType, WorkPhase, money } from '@/lib/benefits';
import { ReportInput, buildBenefitsReport, reportAsText } from '@/lib/report';
import { useRules } from '@/components/site/SiteLayout';
import { Callout, Field, NumberInput, PageHeading, SelectInput, Surface } from '@/components/site/Elements';

export function BenefitsReport() {
  const {year}=useRules();
  const [benefitType,setBenefitType]=useState<BenefitsType>('both');
  const [hours,setHours]=useState(20);
  const [wage,setWage]=useState(17);
  const [ssdi,setSsdi]=useState(800);
  const [otherUnearned,setOtherUnearned]=useState(0);
  const [irwe,setIrwe]=useState(0);
  const [phase,setPhase]=useState<WorkPhase>('unsure');
  const [blind,setBlind]=useState(false);
  const [notes,setNotes]=useState('');
  const [hasCurrentSsi,setHasCurrentSsi]=useState(false);
  const [currentSsi,setCurrentSsi]=useState(500);
  const [additionalBenefits,setAdditionalBenefits]=useState<string[]>([]);
  const hasSsdi=benefitType!=='ssi';const hasSsi=benefitType!=='ssdi';
  const input:ReportInput={benefitType,year,hours,wage,ssdi,otherUnearned,irwe,phase,blind,notes,currentSsi:hasCurrentSsi && hasSsi?currentSsi:undefined,additionalBenefits};
  const report=buildBenefitsReport(input);
  const download=()=>{const blob=new Blob([reportAsText(input)],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`benefits-summary-${year}.txt`;a.click();URL.revokeObjectURL(url);};
  return <div className="space-y-6"><div className="no-print"><PageHeading eyebrow="PLANNING / REPORT BUILDER" title="Your benefits summary" description="Create an easy-to-read educational report based on your benefits and a possible work schedule. Sections assemble automatically as you enter information." aside={<div className="flex items-center gap-2 rounded-full bg-[#e8f6ed] px-3 py-2 text-xs font-bold text-[#267353]"><ShieldCheck size={15}/> Stays in this browser tab</div>}/></div>
    <div className="grid gap-5 xl:grid-cols-[minmax(310px,0.85fr)_minmax(500px,1.15fr)]">
      <Surface className="self-start p-6 sm:p-7 no-print"><div className="mb-6"><h2 className="form-section-title">1. Tell us about the situation</h2><p className="mt-1 text-xs leading-5 text-slate-500">No name, DOB, SSN or account information is requested.</p></div>
        <div className="space-y-5"><Field label="Benefits received"><SelectInput value={benefitType} onChange={setBenefitType} options={[{value:'ssi',label:'SSI only'},{value:'ssdi',label:'SSDI only'},{value:'both',label:'SSI and SSDI'}]}/></Field>
          {hasSsdi&&<><Field label="Monthly SSDI cash benefit"><NumberInput prefix="$" value={ssdi} onChange={setSsdi}/></Field><Field label="SSDI work phase"><SelectInput value={phase} onChange={setPhase} options={[{value:'unsure',label:'Not sure / needs verification'},{value:'twp',label:'Available Trial Work Period'},{value:'epe',label:'36-month Extended Period of Eligibility'},{value:'post-epe',label:'After the EPE'}]}/></Field><label className="flex items-center gap-2 text-[13px] text-slate-600"><input type="checkbox" checked={blind} onChange={e=>setBlind(e.target.checked)} className="h-4 w-4 accent-[#236b51]"/> Use statutory blindness SGA amount</label></>}
          <Field label="Other monthly unearned income"><NumberInput prefix="$" value={otherUnearned} onChange={setOtherUnearned}/></Field>
          {hasSsi&&<Field label="Potential qualifying work expenses (IRWE)"><NumberInput prefix="$" value={irwe} onChange={setIrwe}/></Field>}
          {hasSsi&&<div className="space-y-3 rounded-xl bg-[#f7faf8] px-4 py-4"><label className="flex items-center gap-2 text-[13px] font-semibold text-slate-600"><input type="checkbox" checked={hasCurrentSsi} onChange={e=>setHasCurrentSsi(e.target.checked)} className="h-4 w-4 accent-[#236b51]"/> I know my current monthly SSI cash amount</label>{hasCurrentSsi&&<Field label="Current SSI payment"><NumberInput prefix="$" value={currentSsi} onChange={setCurrentSsi}/></Field>}</div>}
          <div className="border-t border-slate-100 pt-5"><h3 className="mb-4 form-section-title">2. Explore employment</h3><div className="grid grid-cols-2 gap-4"><Field label="Hours per week"><NumberInput value={hours} onChange={setHours} suffix="hrs"/></Field><Field label="Hourly wage"><NumberInput prefix="$" value={wage} onChange={setWage}/></Field></div></div>
          <div className="border-t border-slate-100 pt-5"><h3 className="mb-3 form-section-title">3. Other benefits (optional)</h3><p className="mb-4 text-xs leading-5 text-slate-500">These will add relevant review topics without predicting an exact payment.</p><div className="grid grid-cols-2 gap-3">{[{id:'medicaid',label:'Medicaid'},{id:'medicare',label:'Medicare'},{id:'snap',label:'SNAP'},{id:'housing',label:'Housing help'}].map(item=><label key={item.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-slate-700"><input className="h-4 w-4 accent-[#236b51]" type="checkbox" checked={additionalBenefits.includes(item.id)} onChange={e=>setAdditionalBenefits(old=>e.target.checked?[...old,item.id]:old.filter(x=>x!==item.id))}/>{item.label}</label>)}</div></div>
          <div className="border-t border-slate-100 pt-5"><Field label="Notes or questions for a counselor (optional)"><textarea rows={4} maxLength={2000} className="field-input h-auto resize-y py-3 font-normal leading-6" placeholder="E.g., I have an accommodation expense that might qualify as IRWE..." value={notes} onChange={e=>setNotes(e.target.value)}/></Field></div>
        </div>
      </Surface>
      <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3 no-print"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#49866e]"><Sparkles size={16}/> Live report preview</div><div className="flex flex-wrap gap-2"><button className="soft-btn" onClick={download}><ArrowDownToLine size={15}/> Download text</button><button className="solid-btn" onClick={()=>window.print()}><Printer size={15}/> Print / save PDF</button></div></div>
        <article className="surface print-report overflow-hidden bg-white"><div className="bg-[#173f3d] px-7 py-7 text-white sm:px-9"><div className="mb-5 flex items-center gap-2 text-xs font-semibold text-[#b2e8ce]"><FileText size={16}/> BENEFITSCOUNSELING.ORG</div><h2 className="font-display text-[29px] font-extrabold leading-tight tracking-tight sm:text-[34px]">Benefits summary<br/>& work scenario</h2><p className="mt-4 text-xs text-[#c5ddd5]">Generated {report.generated} · {year} rules · Educational estimate only</p></div>
          <div className="border-b border-slate-100 px-7 py-6 sm:px-9"><div className="grid grid-cols-2 gap-5"><div><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Projected monthly wages</p><p className="mt-2 font-display text-[27px] font-extrabold text-[#19543f]">{money(report.grossWages)}</p></div>{hasSsi?<div><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Estimated federal SSI</p><p className="mt-2 font-display text-[27px] font-extrabold text-[#19543f]">{money(report.estimatedSsi||0)}</p></div>:<div><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">SSDI cash status</p><p className="mt-2 text-[13px] font-bold text-[#19543f]">{report.ssdiAssessment?.status==='generally-payable'?'Generally payable*':'SSA review needed'}</p></div>}</div></div>
          <div className="space-y-7 px-7 py-8 sm:px-9">{report.sections.map((section,i)=><section key={section.heading}><div className="mb-3 flex items-center gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e2f3e9] text-xs font-extrabold text-[#39765d]">{String(i+1).padStart(2,'0')}</div><h3 className="font-display text-[16px] font-extrabold text-slate-900">{section.heading}</h3></div><div className="space-y-2 pl-10">{section.paragraphs.map((p,j)=><p key={j} className="text-[13px] leading-6 text-slate-600">{p}</p>)}</div></section>)}
            <div className="border-t border-slate-200 pt-5 text-[11px] leading-5 text-slate-400"><strong>Not an official benefits determination.</strong> Federal educational estimates only. This document does not collect or verify SSA earnings records and should be reviewed by a qualified work incentives counselor. Sources: ssa.gov/redbook and ssa.gov/ssi.</div>
          </div>
        </article>
      </div>
    </div><div className="no-print"><Callout kind="amber"><strong>Privacy & accuracy:</strong> We don't save this report to a server. Text entered in this tool stays in the tab, except when you choose to print or download it. Do not enter identifiers or sensitive medical details. Official SSA determinations can differ substantially from this illustration.</Callout></div>
    <div className="no-print flex items-center gap-2 text-xs text-slate-500"><FileDown size={15}/> Use “Print / save PDF” in your browser's print dialog to generate a PDF.</div>
  </div>;
}
