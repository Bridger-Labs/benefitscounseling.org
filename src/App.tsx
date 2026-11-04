import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SiteLayout } from '@/components/site/SiteLayout';
import Dashboard from '@/pages/Dashboard';
import { SsiCalculator } from '@/pages/tools/SsiCalculator';
import { TimelineTracker } from '@/pages/tools/TimelineTracker';
import { ScenarioPlanner } from '@/pages/tools/ScenarioPlanner';
import { BenefitsReport } from '@/pages/tools/BenefitsReport';
import { WorkSupportGuide } from '@/pages/tools/WorkSupportGuide';
import { Resources } from '@/pages/Resources';
import { ReportingGuide, BenefitTypesGuide, OverpaymentsGuide, WorkIncentivesGuide, NjMedicaidGuide } from '@/pages/guidance/GuidancePages';
import { QuickReference } from '@/pages/guidance/QuickReference';
import { SmartGoalsWorksheet } from '@/components/SmartGoalsWorksheet';
import NotFound from '@/pages/NotFound';

export default function App() { return <TooltipProvider><Toaster/><Sonner/><BrowserRouter><Routes><Route element={<SiteLayout/>}>
  <Route path="/" element={<Dashboard/>}/>
  <Route path="/tools/ssi" element={<SsiCalculator/>}/>
  <Route path="/tools/twp-epe" element={<TimelineTracker/>}/>
  <Route path="/tools/scenarios" element={<ScenarioPlanner/>}/>
  <Route path="/tools/report" element={<BenefitsReport/>}/>
  <Route path="/tools/work-supports" element={<WorkSupportGuide/>}/>
  <Route path="/tools/smart-goals" element={<SmartGoalsWorksheet/>}/>
  <Route path="/learn" element={<Resources/>}/>
  <Route path="/learn/benefit-types" element={<BenefitTypesGuide/>}/>
  <Route path="/learn/reporting" element={<ReportingGuide/>}/>
  <Route path="/learn/overpayments" element={<OverpaymentsGuide/>}/>
  <Route path="/learn/work-incentives" element={<WorkIncentivesGuide/>}/>
  <Route path="/learn/nj-medicaid" element={<NjMedicaidGuide/>}/>
  <Route path="/learn/quick-reference" element={<QuickReference/>}/>
  <Route path="*" element={<NotFound/>}/>
</Route></Routes></BrowserRouter></TooltipProvider> }
