
import React from 'react';
import { Question } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AudioRecorder from './AudioRecorder';

interface QuestionCardProps {
  question: Question;
  onRecordingComplete: (questionId: string, audioBlob: Blob) => void;
  isSubmitting: boolean;
  className?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onRecordingComplete,
  isSubmitting,
  className,
}) => {
  const handleRecordingComplete = (audioBlob: Blob) => {
    onRecordingComplete(question.id, audioBlob);
  };

  return (
    <Card className={cn('w-full max-w-3xl mx-auto overflow-hidden shadow-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant={question.type === 'behavioral' ? 'outline' : 'default'}>
            {question.type === 'behavioral' ? 'Behavioral' : 'Technical'}
          </Badge>
          {question.category && (
            <Badge variant="secondary" className="ml-2">
              {question.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-medium leading-relaxed tracking-tight">
          {question.text}
        </h2>
        
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          isSubmitting={isSubmitting}
          className="mt-6"
        />
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
