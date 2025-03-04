
import React from 'react';
import { QuestionEvaluation } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ResultsViewProps {
  evaluations: QuestionEvaluation[];
  onStartOver: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ evaluations, onStartOver }) => {
  const calculateAverageScore = () => {
    const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    return Math.round((totalScore / evaluations.length) * 10) / 10;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const averageScore = calculateAverageScore();

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4 -ml-2 self-start" 
        onClick={onStartOver}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Start Over
      </Button>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Your Interview Results
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Our AI has evaluated your answers to the interview questions.
        </p>
      </header>

      <div className="mb-8 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold mb-2 flex items-baseline">
          Overall Score: 
          <span className={`ml-2 ${getScoreColor(averageScore)}`}>
            {averageScore}/100
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {evaluations.map((evaluation) => (
          <Card key={evaluation.questionId} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="text-lg font-medium">{evaluation.questionText}</div>
              <div className="flex items-center mt-2">
                <span className="text-muted-foreground mr-2">Score:</span>
                <span className={`font-bold ${getScoreColor(evaluation.score)}`}>
                  {evaluation.score}/100
                </span>
                <div className="ml-4 flex-1 max-w-48">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(evaluation.score)}`}
                    style={{ width: `${evaluation.score}%` }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Your Answer:</h4>
                  <p className="text-sm text-muted-foreground">
                    {evaluation.answerText}
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-1">Feedback:</h4>
                  <p className="text-sm">
                    {evaluation.feedback}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResultsView;
