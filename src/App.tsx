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
import { Resources } from '@/pages/Resources';
import { SmartGoalsWorksheet } from '@/components/SmartGoalsWorksheet';
import NotFound from '@/pages/NotFound';

export default function App() { return <TooltipProvider><Toaster/><Sonner/><BrowserRouter><Routes><Route element={<SiteLayout/>}>
  <Route path="/" element={<Dashboard/>}/>
  <Route path="/tools/ssi" element={<SsiCalculator/>}/>
  <Route path="/tools/twp-epe" element={<TimelineTracker/>}/>
  <Route path="/tools/scenarios" element={<ScenarioPlanner/>}/>
  <Route path="/tools/report" element={<BenefitsReport/>}/>
  <Route path="/tools/smart-goals" element={<SmartGoalsWorksheet/>}/>
  <Route path="/learn" element={<Resources/>}/>
  <Route path="*" element={<NotFound/>}/>
</Route></Routes></BrowserRouter></TooltipProvider> }
