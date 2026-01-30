import { SmartGoalRow as SmartGoalRowType } from '@/lib/smartGoalData';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartGoalRowProps {
  goal: SmartGoalRowType;
  onInputChange: (id: string, value: string) => void;
}

export function SmartGoalRowComponent({ goal, onInputChange }: SmartGoalRowProps) {
  const { evaluation } = goal;

  const statusIcon = {
    pending: <Circle className="h-5 w-5 text-muted-foreground" />,
    pass: <CheckCircle className="h-5 w-5 text-success" />,
    'needs-improvement': <AlertCircle className="h-5 w-5 text-warning" />
  };

  const statusBg = {
    pending: 'bg-muted/50',
    pass: 'bg-success/10',
    'needs-improvement': 'bg-warning/10'
  };

  return (
    <tr className="border-b border-border last:border-b-0">
      {/* S.M.A.R.T. Step Column */}
      <td className="p-4 align-top bg-primary text-primary-foreground w-48">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
            {goal.letter}
          </span>
          <div>
            <h3 className="font-semibold text-lg">{goal.title}</h3>
            <p className="text-sm opacity-90 mt-1">{goal.description}</p>
          </div>
        </div>
      </td>

      {/* Example Column */}
      <td className="p-4 align-top bg-secondary/50 w-56">
        <p className="text-sm text-muted-foreground italic">"{goal.example}"</p>
      </td>

      {/* User Input Column */}
      <td className="p-4 align-top w-72">
        <Textarea
          placeholder={`Enter your ${goal.title.toLowerCase()} goal...`}
          value={goal.userInput}
          onChange={(e) => onInputChange(goal.id, e.target.value)}
          className="min-h-[100px] resize-none border-primary/30 focus:border-primary"
        />
      </td>

      {/* AI Evaluation Column */}
      <td className={cn("p-4 align-top w-64", statusBg[evaluation.status])}>
        <div className="flex items-start gap-2">
          {statusIcon[evaluation.status]}
          <div className="flex-1">
            <span className="font-medium text-sm capitalize">
              {evaluation.status === 'pending' ? 'Awaiting input' : 
               evaluation.status === 'pass' ? 'Meets criteria' : 'Needs improvement'}
            </span>
            {evaluation.feedback && (
              <p className="text-sm text-muted-foreground mt-1">{evaluation.feedback}</p>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
