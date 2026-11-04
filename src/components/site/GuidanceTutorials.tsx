import { useState } from 'react';
import { ClipboardCheck, MapPin, Phone, ShieldAlert } from 'lucide-react';
import { Callout, SourceLink, Surface } from '@/components/site/Elements';
import { getNjCountyAgency, NJ_COUNTIES, NJ_COUNTY_DIRECTORY_URL } from '@/lib/njCounties';

type Program = 'ssi' | 'title-ii' | 'snap' | 'familycare';

const REPORTING_GUIDES: Record<Program, {label: string; heading: string; when: string; summary: string; steps: string[]; source: string; action: string; href: string}> = {
  ssi: {
    label: 'SSI', heading: 'Report monthly wages for SSI', when: 'Report wages by the 6th day of the following month, unless SSA confirms your employer reports them automatically.',
    summary: 'SSI wage reporting goes to Social Security—not your NJ county agency. Report other income and changes as SSA instructs.',
    steps: ['Collect pay stubs for wages received during the month, including pay dates and gross amounts.', 'Sign in to my Social Security to report wages, or use the approved SSA Mobile Wage Reporting app or phone option.', 'Report wages by the 6th day of the next month; if an employer, job, or reporting method changes, tell SSA.', 'Keep the confirmation and pay stubs. If you have older unreported wages, contact SSA for instructions.'],
    source: 'https://www.ssa.gov/ssi/reporting/wages', action: 'Open SSA wage reporting', href: 'https://www.ssa.gov/ssi/reporting/wages'
  },
  'title-ii': {
    label: 'SSDI / CDB (DAC)', heading: 'Report work for SSDI or CDB (DAC)', when: 'Notify SSA promptly when work begins, ends, or your hours or wages change.',
    summary: 'SSDI and CDB are Title II benefits. Work activity is reported to SSA, not NJ county offices. The SSI monthly wage deadline is not a substitute for Title II work reporting.',
    steps: ['Tell SSA when you start or stop work, change employers, become self-employed, or change your wages or hours.', 'Gather employer information, start dates, gross pay stubs, and any disability-related work expenses or special job supports.', 'Use my Social Security when available or contact SSA and ask to submit a work report.', 'Keep a copy of the report or confirmation. Ask for your official Trial Work Period and EPE status if you are uncertain.'],
    source: 'https://www.ssa.gov/disability/reporting/wages', action: 'Read SSA work-reporting steps', href: 'https://www.ssa.gov/disability/reporting/wages'
  },
  snap: {
    label: 'NJ SNAP', heading: 'Report employment and income changes for NJ SNAP', when: 'Some changes must be reported within 10 days; follow your county agency notice for your household’s requirements.',
    summary: 'NJ SNAP updates can be reported through MyNJHelps or your County Social Service Agency. This is separate from reporting to SSA.',
    steps: ['Review your SNAP notice to confirm which changes your household must report.', 'Gather pay stubs and your case information; new jobs and certain income changes may need reporting.', 'Use your MyNJHelps account or contact the County Social Service Agency shown below.', 'Save the submission confirmation and respond to any requests for verification or interim reports.'],
    source: 'https://www.nj.gov/humanservices/njsnap/recipients/stay/', action: 'Report changes at MyNJHelps', href: 'https://www.mynjhelps.gov/'
  },
  familycare: {
    label: 'NJ FamilyCare / Medicaid', heading: 'Report income changes for NJ FamilyCare / Medicaid', when: 'New Jersey advises notifying NJ FamilyCare within 10 days of income or household changes that may affect eligibility.',
    summary: 'Your NJ FamilyCare program and case type determine who handles the change. The county agency below can help with county-managed cases; otherwise use NJ FamilyCare customer service.',
    steps: ['Collect new wage information, employer details, and any change to household income or address.', 'Call NJ FamilyCare at 1-800-701-0710 (TTY 711) or your county agency if they administer your case.', 'Ask how the change affects your specific Medicaid category, especially if you receive SSI or CDB/DAC.', 'Keep proof you reported. Do not assume that an SSI cash change automatically ends Medicaid.'],
    source: 'https://www.nj.gov/humanservices/dmahs/individuals-families/familycare/', action: 'NJ FamilyCare information', href: 'https://www.nj.gov/humanservices/dmahs/individuals-families/familycare/'
  }
};

const extraGuides = [
  {title:'Which wages count, and what documents should I keep?', steps:['Keep pay stubs showing gross wages, pay dates, and pay-period dates.','Track monthly hours, job changes, pay raises, bonuses, and any self-employment activity.','Keep copies of SSA and NJ notices, wage reports, and submission confirmations.','For Title II TWP work history, ask SSA to verify its recorded service months.'], source:'https://www.ssa.gov/faqs/en/questions/KA-01412.html'},
  {title:'What is a Trial Work Period (TWP)?', steps:['For SSDI and CDB, the TWP may allow nine qualifying service months in a rolling 60-month period.','Use the TWP earnings threshold for the year in which each month occurred; SSI does not have a TWP.','Self-employment has different tests, including hours.','After a completed TWP, an EPE may begin; an SSA work review is still required.'], source:'https://www.ssa.gov/OACT/cola/twp.html'},
  {title:'What happens to NJ Medicaid if I work?', steps:['Working does not always end Medicaid for people who receive SSI or CDB.','SSI Section 1619(b) and special DAC Medicaid protections are different rules.','Ask about the eligibility category on your NJ FamilyCare case before assuming coverage ends.','Verify the result with NJ FamilyCare or a certified work incentives counselor.'], source:'https://www.nj.gov/humanservices/ddd/individuals/apply-for-services/medicaid/'},
];

export function GuidanceTutorials() {
  const [program, setProgram] = useState<Program>('ssi');
  const [county, setCounty] = useState('');
  const guide = REPORTING_GUIDES[program];
  const agency = getNjCountyAgency(county);
  return <section className="space-y-5" aria-labelledby="nj-guidance-title">
    <div><div className="eyebrow mb-2">NEW JERSEY / STEP-BY-STEP</div><h2 id="nj-guidance-title" className="section-heading">Guidance & tutorials</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Choose a benefit and a New Jersey county to see reporting steps and the correct contacts. County offices manage NJ programs; Social Security reporting always goes to SSA.</p></div>
    <Surface className="p-6 sm:p-7">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block"><span className="field-label">What benefit are you reporting for?</span><select className="field-input" value={program} onChange={e=>setProgram(e.target.value as Program)}>{Object.entries(REPORTING_GUIDES).map(([value, item])=><option key={value} value={value}>{item.label}</option>)}</select></label>
        <label className="block"><span className="field-label">Your New Jersey county</span><select className="field-input" value={county} onChange={e=>setCounty(e.target.value)}><option value="">Select a county</option>{NJ_COUNTIES.map(item=><option key={item.county} value={item.county}>{item.county} County</option>)}</select></label>
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 p-5 sm:p-6"><div className="mb-3 flex items-center gap-2 text-[#245f4e]"><ClipboardCheck size={20}/><span className="text-xs font-bold uppercase tracking-wider">Reporting tutorial</span></div><h3 className="font-display text-xl font-bold text-slate-900">{guide.heading}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{guide.summary}</p><p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">{guide.when}</p><ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-700">{guide.steps.map((step,i)=><li key={i} className="pl-1">{step}</li>)}</ol><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm"><SourceLink href={guide.href}>{guide.action}</SourceLink><SourceLink href={guide.source}>Official reporting guidance</SourceLink></div></div>
        <div className="rounded-2xl bg-[#f4f9f6] p-5 sm:p-6"><h3 className="flex items-center gap-2 font-display text-lg font-bold text-[#164a3e]"><MapPin size={18}/> Your contacts</h3>
          <div className="mt-4 rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Social Security Administration</p><p className="mt-2 text-sm font-semibold text-slate-800">For SSI, SSDI and CDB/DAC reporting</p><a href="tel:18007721213" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:underline"><Phone size={14}/> 1-800-772-1213</a><p className="mt-2 text-xs leading-5 text-slate-500">SSA offices are assigned by address/ZIP code, not by NJ county. <SourceLink href="https://www.ssa.gov/locator/">Find an SSA office</SourceLink>.</p></div>
          {(program === 'snap' || program === 'familycare') && <p className="mt-4 text-xs font-semibold text-[#28624c]">NJ reporting contact for your selected county</p>}
          {agency ? <div className="mt-3 rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{agency.county} County · NJ agency</p><p className="mt-2 text-sm font-bold leading-5 text-slate-900">{agency.agency}</p><p className="mt-2 text-sm leading-5 text-slate-600">{agency.address}</p><div className="mt-3 space-y-2 text-sm"><a className="inline-flex items-center gap-2 font-bold text-teal-700 hover:underline" href={`tel:${agency.phone}`}><Phone size={14}/> Phone: {agency.phone}</a><p className="text-slate-700"><strong>Fax:</strong> {agency.fax}</p><p className="text-slate-700"><strong>Office hours:</strong> {agency.hours}</p>{agency.notes && <p className="text-xs leading-5 text-amber-800">{agency.notes}</p>}</div><p className="mt-3 text-xs leading-5 text-slate-500">County social services contact for NJ programs, <strong>not</strong> an SSA reporting office. Call to confirm hours and any program-specific fax requirements before sending sensitive information.</p><div className="mt-3 text-xs"><SourceLink href={NJ_COUNTY_DIRECTORY_URL}>Verify county office details with NJ DFD</SourceLink><p className="mt-1 text-slate-500">Directory checked November 4, 2026. Hours can change for holidays or local closures.</p></div></div> : <p className="mt-4 text-sm leading-6 text-slate-500">Select your county to show the agency address, phone, fax, and office hours.</p>}
          {program === 'familycare' && <p className="mt-4 text-sm leading-6 text-slate-700"><strong>NJ FamilyCare:</strong> <a className="font-bold text-teal-700 hover:underline" href="tel:18007010710">1-800-701-0710</a> (TTY 711).</p>}
          {program === 'snap' && <p className="mt-4 text-sm leading-6 text-slate-700">Online: <SourceLink href="https://www.mynjhelps.gov/">MyNJHelps</SourceLink>.</p>}
        </div>
      </div>
    </Surface>
    <div className="grid gap-4 lg:grid-cols-3">{extraGuides.map(item=><details key={item.title} className="surface group p-5 sm:p-6"><summary className="cursor-pointer font-display text-base font-bold leading-6 text-slate-900">{item.title}</summary><ol className="mt-4 list-decimal space-y-2 pl-5 text-[13px] leading-6 text-slate-600">{item.steps.map((step,i)=><li key={i}>{step}</li>)}</ol><div className="mt-4 text-xs"><SourceLink href={item.source}>Official reference</SourceLink></div></details>)}</div>
    <Callout kind="amber"><ShieldAlert size={16} className="inline mr-1"/><strong>Different programs, different reporting:</strong> Reporting wages to SSA does not automatically report them to NJ SNAP or NJ FamilyCare, and reporting to a county does not replace SSA reporting. These instructions are educational; case-specific notices control.</Callout>
  </section>;
}
