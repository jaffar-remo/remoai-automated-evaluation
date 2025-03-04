
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { evaluateCodingAnswer } from '@/data/questions';
import { useToast } from '@/hooks/use-toast';

interface CodingQuestionProps {
  question: string;
  onComplete: (code: string, feedback: string) => void;
  isSubmitting: boolean;
  className?: string;
}

const CodingQuestion: React.FC<CodingQuestionProps> = ({
  question,
  onComplete,
  isSubmitting,
  className,
}) => {
  const [code, setCode] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const { toast } = useToast();

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast({
        title: "Empty answer",
        description: "Please write some code before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsEvaluating(true);
    try {
      const feedback = await evaluateCodingAnswer(question, code);
      onComplete(code, feedback);
    } catch (error) {
      toast({
        title: "Evaluation failed",
        description: "Failed to evaluate your code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <Badge variant="default">Coding Challenge</Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-medium leading-relaxed tracking-tight">
          {question}
        </h2>
        
        <div className="space-y-2">
          <textarea
            className="w-full h-64 p-4 font-mono text-sm border rounded-md bg-slate-950 text-slate-50"
            placeholder="Write your code here..."
            value={code}
            onChange={handleCodeChange}
            disabled={isEvaluating || isSubmitting}
          />
          
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!code.trim() || isEvaluating || isSubmitting}
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                'Submit Code'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodingQuestion;
