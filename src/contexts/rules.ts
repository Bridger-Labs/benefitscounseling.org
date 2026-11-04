import { createContext, useContext } from 'react';
import type { RulesYear } from '@/lib/benefits';

export const RulesContext = createContext<{ year: RulesYear; setYear: (y: RulesYear) => void }>({
  year: 2026,
  setYear: () => {},
});

export const useRules = () => useContext(RulesContext);
