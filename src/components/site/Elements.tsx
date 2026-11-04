import type { ReactNode } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PageHeading({eyebrow, title, description, aside}: {eyebrow: string; title: string; description: string; aside?: ReactNode}) {
  return <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
    <div className="max-w-3xl"><div className="eyebrow mb-3">{eyebrow}</div><h1 className="page-title">{title}</h1><p className="mt-3 text-[15px] leading-7 text-slate-500">{description}</p></div>
    {aside && <div className="shrink-0">{aside}</div>}
  </div>;
}

export function Surface({children, className}: {children: ReactNode; className?: string}) { return <div className={cn('surface',className)}>{children}</div> }
export function Field({label, help, children, className}: {label: string; help?: string; children: ReactNode; className?: string}) {
  return <label className={cn('block', className)}><span className="field-label">{label}</span>{children}{help && <span className="field-help">{help}</span>}</label>;
}
export function NumberInput({value, onChange, min=0, max, step='any', prefix, suffix, id}: {value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number | 'any'; prefix?: string; suffix?: string; id?: string}) {
  return <span className="relative block">
    {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</span>}
    <input id={id} type="number" inputMode="decimal" min={min} max={max} step={step} className={cn('field-input',prefix && 'pl-7',suffix && 'pr-14')}
      value={Number.isFinite(value) ? value : 0} onChange={e => onChange(Math.max(min, Math.min(max ?? Number.MAX_SAFE_INTEGER, Number(e.target.value) || 0)))} />
    {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>}
  </span>;
}
export function SelectInput<T extends string | number>({value, onChange, options}: {value: T; onChange: (v:T)=>void; options: {value:T; label:string}[]}) {
  return <select className="field-input" value={value} onChange={e => { const selected=options.find(x=>String(x.value)===e.target.value); if(selected) onChange(selected.value); }}>
    {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select>
}
export function Callout({children, kind='info'}: {children: ReactNode; kind?: 'info' | 'amber' | 'teal'}) { return <div className={cn('rounded-xl border p-4 text-[13px] leading-6 flex gap-3',kind==='info' && 'bg-slate-50 border-slate-200 text-slate-600',kind==='amber' && 'bg-amber-50 border-amber-200 text-amber-900',kind==='teal' && 'bg-teal-50 border-teal-200 text-teal-900')}><Info className="mt-[3px] h-4 w-4 shrink-0"/><div>{children}</div></div> }
export function Stat({label,value,detail,accent='slate'}: {label: string; value: string; detail?: string; accent?: 'slate'|'teal'|'purple'}) {
  return <div className={cn('stat-card',accent==='teal' && 'bg-teal-50/80 border-teal-100',accent==='purple' && 'bg-violet-50/80 border-violet-100')}><div className="text-xs font-semibold tracking-wide text-slate-500">{label}</div><div className="mt-2 font-display text-3xl tracking-tight font-bold text-slate-900">{value}</div>{detail && <div className="mt-2 text-xs leading-5 text-slate-500">{detail}</div>}</div>;
}
export function SourceLink({href,children}: {href:string;children: ReactNode}) { return <a className="inline-flex items-center gap-1 font-medium text-teal-700 hover:text-teal-900 hover:underline" href={href} target="_blank" rel="noreferrer">{children}<ExternalLink size={12}/></a> }
