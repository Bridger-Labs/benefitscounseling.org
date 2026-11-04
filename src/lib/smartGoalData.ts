export interface SmartGoalRow {
  id: string;
  letter: string;
  title: string;
  description: string;
  example: string;
  userInput: string;
  evaluation: {
    status: 'pending' | 'pass' | 'needs-improvement';
    feedback: string;
  };
}

export const initialSmartGoals: SmartGoalRow[] = [
  {
    id: 'specific',
    letter: 'S',
    title: 'Specific',
    description: 'What exactly do you want to accomplish? Be clear and detailed.',
    example: 'I want to get a job as a customer service representative at a local retail store.',
    userInput: '',
    evaluation: { status: 'pending', feedback: '' }
  },
  {
    id: 'measurable',
    letter: 'M',
    title: 'Measurable',
    description: 'How will you track your progress and know when you\'ve achieved it?',
    example: 'I will apply to at least 5 positions per week and track my applications.',
    userInput: '',
    evaluation: { status: 'pending', feedback: '' }
  },
  {
    id: 'achievable',
    letter: 'A',
    title: 'Achievable',
    description: 'Is this goal realistic given your current resources and constraints?',
    example: 'I have prior retail experience and availability for part-time or full-time work.',
    userInput: '',
    evaluation: { status: 'pending', feedback: '' }
  },
  {
    id: 'realistic',
    letter: 'R',
    title: 'Realistic',
    description: 'Does this goal align with your broader objectives and current situation?',
    example: 'This role fits my skills and will help me build towards a management position.',
    userInput: '',
    evaluation: { status: 'pending', feedback: '' }
  },
  {
    id: 'timely',
    letter: 'T',
    title: 'Timely',
    description: 'What is your target date or timeframe for achieving this goal?',
    example: 'I will secure a position within the next 60 days.',
    userInput: '',
    evaluation: { status: 'pending', feedback: '' }
  }
];

export function evaluateGoal(row: SmartGoalRow): SmartGoalRow['evaluation'] {
  const input = row.userInput.trim();
  
  if (!input) {
    return { status: 'pending', feedback: '' };
  }

  if (input.length < 10) {
    return { 
      status: 'needs-improvement', 
      feedback: 'Please provide more detail to properly evaluate this goal.' 
    };
  }

  switch (row.id) {
    case 'specific': {
      // Check for specificity indicators
      const specificIndicators = ['want to', 'will', 'goal is', 'plan to', 'aim to', 'intend to'];
      const hasAction = specificIndicators.some(ind => input.toLowerCase().includes(ind));
      const isDetailed = input.length > 30;
      
      if (hasAction && isDetailed) {
        return { status: 'pass', feedback: 'Great! Your goal is clear and specific.' };
      }
      return { 
        status: 'needs-improvement', 
        feedback: 'Try to be more specific. What exactly do you want to accomplish? Include who, what, where, when.' 
      };

    }

    case 'measurable': {
      // Check for numbers, percentages, or tracking language
      const hasNumbers = /\d+/.test(input);
      const measureWords = ['track', 'measure', 'count', 'per week', 'per day', 'per month', 'times', 'applications', 'percent', '%'];
      const hasMeasure = measureWords.some(word => input.toLowerCase().includes(word));
      
      if (hasNumbers || hasMeasure) {
        return { status: 'pass', feedback: 'Excellent! You have clear metrics to track progress.' };
      }
      return { 
        status: 'needs-improvement', 
        feedback: 'Add specific numbers or metrics. How many? How often? How will you track this?' 
      };

    }

    case 'achievable': {
      // Check for capability/resource language
      const achieveWords = ['have', 'can', 'able', 'experience', 'skill', 'know', 'available', 'access', 'capable', 'qualified'];
      const hasCapability = achieveWords.some(word => input.toLowerCase().includes(word));
      
      if (hasCapability && input.length > 20) {
        return { status: 'pass', feedback: 'Good! You\'ve identified resources or abilities to achieve this.' };
      }
      return { 
        status: 'needs-improvement', 
        feedback: 'Explain what resources, skills, or support you have to achieve this goal.' 
      };

    }

    case 'realistic': {
      // Check for alignment/relevance language
      const realisticWords = ['fits', 'aligns', 'help', 'support', 'lead to', 'because', 'important', 'relevant', 'builds', 'contributes'];
      const hasAlignment = realisticWords.some(word => input.toLowerCase().includes(word));
      
      if (hasAlignment && input.length > 20) {
        return { status: 'pass', feedback: 'Great! Your goal aligns with your broader objectives.' };
      }
      return { 
        status: 'needs-improvement', 
        feedback: 'Explain how this goal fits your situation and why it matters to you.' 
      };

    }

    case 'timely': {
      // Check for time-related language
      const timeWords = ['day', 'week', 'month', 'year', 'by', 'within', 'before', 'deadline', 'date', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const hasTime = timeWords.some(word => input.toLowerCase().includes(word)) || /\d+/.test(input);
      
      if (hasTime) {
        return { status: 'pass', feedback: 'Perfect! You have a clear timeframe for your goal.' };
      }
      return { 
        status: 'needs-improvement', 
        feedback: 'Add a specific deadline or timeframe. When do you want to achieve this?' 
      };

    }

    default:
      return { status: 'pending', feedback: '' };
  }
}

export function exportToCSV(goals: SmartGoalRow[]): string {
  const headers = ['S.M.A.R.T. Step', 'Description', 'Example', 'Your Goal', 'Evaluation Status', 'Feedback'];
  const rows = goals.map(goal => [
    `${goal.letter} - ${goal.title}`,
    goal.description,
    goal.example,
    goal.userInput,
    goal.evaluation.status,
    goal.evaluation.feedback
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
