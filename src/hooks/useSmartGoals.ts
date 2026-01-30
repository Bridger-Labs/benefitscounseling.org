import { useState, useEffect, useCallback } from 'react';
import { SmartGoalRow, initialSmartGoals, evaluateGoal, exportToCSV, downloadCSV } from '@/lib/smartGoalData';

const STORAGE_KEY = 'smart-goals-worksheet';

export function useSmartGoals() {
  const [goals, setGoals] = useState<SmartGoalRow[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialSmartGoals;
      }
    }
    return initialSmartGoals;
  });

  // Save to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const updateGoalInput = useCallback((id: string, value: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === id) {
        const updated = { ...goal, userInput: value };
        return { ...updated, evaluation: evaluateGoal(updated) };
      }
      return goal;
    }));
  }, []);

  const resetGoals = useCallback(() => {
    setGoals(initialSmartGoals);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleExport = useCallback(() => {
    const csvContent = exportToCSV(goals);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csvContent, `smart-goals-${date}.csv`);
  }, [goals]);

  const isComplete = goals.every(g => g.userInput.trim().length > 0);
  const passCount = goals.filter(g => g.evaluation.status === 'pass').length;

  return {
    goals,
    updateGoalInput,
    resetGoals,
    handleExport,
    isComplete,
    passCount
  };
}
