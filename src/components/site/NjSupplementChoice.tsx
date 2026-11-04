import { type RulesYear, money } from '@/lib/benefits';
import { Field, NumberInput, SelectInput, SourceLink } from '@/components/site/Elements';
import { NJ_2026_INDIVIDUAL, type NjArrangement } from '@/lib/njSupplement';

interface Props {year: RulesYear; arrangement: NjArrangement; setArrangement: (v: NjArrangement) => void;
  customEnabled: boolean; setCustomEnabled: (v:boolean)=>void; customRate: number; setCustomRate: (v:number)=>void;}
export function NjSupplementChoice({year,arrangement,setArrangement,customEnabled,setCustomEnabled,customRate,setCustomRate}:Props) {
  return <div className="rounded-xl border border-teal-100 bg-[#f4faf7] px-4 py-4 space-y-3">
    <h3 className="text-sm font-bold text-[#235c46]">New Jersey SSI state supplement</h3>
    <Field label="NJ living arrangement / supplement category" help="This is not the same as your mailing address. Ask SSA which state and federal living-arrangement codes appear on your record.">
      <SelectInput<NjArrangement> value={arrangement} onChange={setArrangement} options={[{value:'unsure' as NjArrangement,label:'I am not sure'},...Object.entries(NJ_2026_INDIVIDUAL).map(([value,item])=>({value:value as NjArrangement,label:item.label}))]}/>
    </Field>
    {year===2026 && arrangement !== 'unsure' && <p className="text-xs text-slate-600">Published 2026 individual rate: <strong>{money(NJ_2026_INDIVIDUAL[arrangement].amount)}/month</strong>.</p>}
    {year===2027 && <p role="note" className="text-xs text-amber-800">The 2027 NJ optional supplement schedule is not verified in this release. We won't reuse the 2026 amount automatically.</p>}
    <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={customEnabled} onChange={e=>setCustomEnabled(e.target.checked)} className="accent-teal-700"/> I have confirmed an applicable NJ supplement rate and want to enter it</label>
    {customEnabled && <Field label="Confirmed monthly NJ supplement standard"><NumberInput prefix="$" value={customRate} onChange={setCustomRate}/></Field>}
    <p className="text-[11px] leading-5 text-slate-500">Illustration for one eligible individual under regular federal living arrangements only. Other living arrangements, income rules, state adjustments and couples need individual analysis. <SourceLink href="https://secure.ssa.gov/poms.nsf/lnx/0501415058">SSA NJ state supplement table</SourceLink>.</p>
  </div>;
}
