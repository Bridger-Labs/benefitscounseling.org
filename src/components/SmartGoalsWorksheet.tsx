import { useSmartGoals } from '@/hooks/useSmartGoals';
import { SmartGoalRowComponent } from '@/components/SmartGoalRow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, RotateCcw, Target, CheckCircle } from 'lucide-react';

export function SmartGoalsWorksheet() {
  const { goals, updateGoalInput, resetGoals, handleExport, isComplete, passCount } = useSmartGoals();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Target className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              S.M.A.R.T. Goals Worksheet
            </CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto mt-2">
              Define your employment goals using the S.M.A.R.T. framework. 
              Each goal should be Specific, Measurable, Achievable, Realistic, and Timely.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="font-medium">
              {passCount} of 5 goals meet S.M.A.R.T. criteria
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={resetGoals}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button 
              onClick={handleExport}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Main Table */}
        <Card className="overflow-hidden border-primary/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-4 text-left font-semibold">S.M.A.R.T. Step</th>
                  <th className="p-4 text-left font-semibold">Example</th>
                  <th className="p-4 text-left font-semibold">Your Goal</th>
                  <th className="p-4 text-left font-semibold">Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {goals.map(goal => (
                  <SmartGoalRowComponent
                    key={goal.id}
                    goal={goal}
                    onInputChange={updateGoalInput}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Footer Tips */}
        <Card className="mt-8 border-accent/30 bg-accent/5">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3 text-primary">Tips for Setting S.M.A.R.T. Goals</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-accent">S</span>
                <span>Be precise about what you want to achieve. Avoid vague statements.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-accent">M</span>
                <span>Include numbers, dates, or other metrics to track your progress.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-accent">A</span>
                <span>Consider your current skills, resources, and any constraints.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-accent">R</span>
                <span>Ensure your goal aligns with your broader career objectives.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-accent">T</span>
                <span>Set a specific deadline to create urgency and focus.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Download Info */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Your progress is automatically saved to your browser. Export to CSV to save externally or import into spreadsheet software.
        </p>
      </div>
    </div>
  );
}
