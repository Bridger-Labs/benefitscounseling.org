import { createContext, useContext, useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, BarChart3, BookOpen, Calculator, ChevronDown, ClipboardList, Compass, FileText, HeartHandshake, Menu, ShieldCheck, Target, X } from 'lucide-react';
import type { RulesYear } from '@/lib/benefits';
import { cn } from '@/lib/utils';

const RulesContext = createContext<{year: RulesYear; setYear: (y: RulesYear)=>void}>({year: 2026, setYear:()=>{}});
export const useRules = () => useContext(RulesContext);

const navGroups = [
  { title: 'WORKSPACE', links: [{to:'/',name:'Overview',icon:Compass},{to:'/tools/scenarios',name:'Work scenarios',icon:BarChart3},{to:'/tools/report',name:'Benefits report',icon:FileText}]},
  { title: 'CALCULATORS & TOOLS', links: [{to:'/tools/ssi',name:'SSI calculator',icon:Calculator},{to:'/tools/twp-epe',name:'TWP / EPE tracker',icon:ClipboardList},{to:'/tools/smart-goals',name:'SMART goals',icon:Target}]},
  { title: 'GUIDANCE', links: [{to:'/learn',name:'Rules & resources',icon:BookOpen}]},
];

export function SiteLayout() {
  const [year, setYear] = useState<RulesYear>(2026);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebar = <>
    <div className="flex items-center justify-between px-6 pt-8 pb-9">
      <Link to="/" onClick={()=>setMobileOpen(false)} className="flex items-center gap-3 text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#c8f7db] text-[#103d35] shadow-sm"><HeartHandshake size={23} strokeWidth={2.2}/></div>
        <div className="leading-tight"><div className="font-display text-[19px] font-bold tracking-tight">Benefits<span className="text-[#b7ebce]">Counseling</span></div><div className="text-[11px] font-semibold tracking-[0.14em] text-slate-400">.ORG • WORK INCENTIVES</div></div>
      </Link>
      <button className="lg:hidden rounded-lg p-2 text-slate-300 hover:bg-white/10" onClick={()=>setMobileOpen(false)} aria-label="Close navigation"><X size={20}/></button>
    </div>
    <div className="space-y-8 px-4">
      {navGroups.map(group => <div key={group.title}><p className="px-3 mb-3 text-[10px] tracking-[0.18em] font-bold text-slate-500">{group.title}</p><nav className="space-y-1">
        {group.links.map(({to,name,icon: Icon}) => <NavLink key={to} to={to} end={to==='/'} onClick={()=>setMobileOpen(false)} className={({isActive})=>cn('sidebar-link',isActive && 'sidebar-link-active')}><Icon size={18} strokeWidth={1.8}/>{name}{to==='/tools/report' && <span className="ml-auto rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-slate-300">NEW</span>}</NavLink>)}
      </nav></div>)}
    </div>
    <div className="mt-auto px-5 pb-6 pt-9"><div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5">
      <ShieldCheck className="mb-3 text-[#b7ebce]" size={21}/><p className="text-[13px] font-semibold leading-snug text-white">Privacy by design</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">Calculations happen in your browser. No account or Social Security number needed.</p>
    </div><div className="px-1 pt-5 text-[11px] text-slate-500">Independent educational tools · Not affiliated with SSA</div></div>
  </>;
  return <RulesContext.Provider value={{year,setYear}}><div className="min-h-screen bg-[#f6f8f9] lg:flex">
    <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:p-3" href="#main-content">Skip to main content</a>
    {mobileOpen && <button className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>}
    <aside className={cn('fixed inset-y-0 left-0 z-50 flex w-[274px] flex-col overflow-y-auto bg-[#102f32] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shrink-0',!mobileOpen && '-translate-x-full')}>{sidebar}</aside>
    <div className="min-w-0 flex-1 flex flex-col">
      <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur md:px-10">
        <div className="flex items-center gap-3"><button className="rounded-lg border border-slate-200 p-2 lg:hidden" aria-label="Open navigation" onClick={()=>setMobileOpen(true)}><Menu size={20}/></button><span className="hidden text-xs font-medium text-slate-400 sm:block">Understand benefits. Explore what's possible.</span><span className="text-sm font-semibold text-[#17473d] sm:hidden">BenefitsCounseling.org</span></div>
        <div className="flex items-center gap-3"><label className="flex items-center gap-2 text-[12px] font-semibold text-slate-500"><span className="hidden sm:inline">Rules year</span><span className="relative"><select aria-label="Rules year" className="appearance-none rounded-full border border-slate-200 bg-white py-2 pl-4 pr-8 text-[12px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500" value={year} onChange={e=>setYear(Number(e.target.value) as RulesYear)}><option value={2026}>2026</option><option value={2027}>2027</option></select><ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"/></span></label>
          <a href="https://www.ssa.gov/" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-full bg-[#e8f5ee] px-4 py-2.5 text-xs font-bold text-[#28624c] hover:bg-[#d7f0e1] md:flex">SSA.gov <ArrowUpRight size={14}/></a>
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-8 md:px-9 md:py-10 xl:px-12"><Outlet/></main>
      <footer className="mx-auto w-full max-w-[1440px] border-t border-slate-200/70 px-5 py-6 text-xs leading-6 text-slate-400 md:px-9 xl:px-12"><span className="font-semibold text-slate-500">BenefitsCounseling.org</span> · Educational estimates only, not an official determination. Verify with SSA or a qualified benefits counselor. · © {new Date().getFullYear()}</footer>
    </div>
  </div></RulesContext.Provider>;
}
