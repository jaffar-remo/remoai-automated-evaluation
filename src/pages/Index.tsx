
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchQuestions, submitResponses } from "@/data/questions";
import { QuestionResponse, QuestionEvaluation } from "@/types";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import AnimatedContainer from "@/components/AnimatedContainer";
import ResultsView from "@/components/ResultsView";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

const Index = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [evaluations, setEvaluations] = useState<QuestionEvaluation[] | null>(null);
  const { toast } = useToast();

  const {
    data: questions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: fetchQuestions,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const submitResponsesMutation = useMutation({
    mutationFn: submitResponses,
    onSuccess: ({ results }: { results: QuestionEvaluation[] }) => {
      toast({
        title: "Responses submitted",
        description: "Your responses have been evaluated.",
      });
      
      setEvaluations(results);
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleRecordingComplete = (questionId: string, audioBlob: Blob) => {
    const existingResponseIndex = responses.findIndex(
      (r) => r.questionId === questionId
    );

    if (existingResponseIndex >= 0) {
      setResponses((prev) =>
        prev.map((response, index) =>
          index === existingResponseIndex
            ? { ...response, audioBlob }
            : response
        )
      );
    } else {
      setResponses((prev) => [
        ...prev,
        {
          questionId,
          audioBlob,
          questionText: questions?.find((q) => q.id === questionId)?.text || "",
        },
      ]);
    }
  };

  const handleSubmitResponse = async () => {
    if (!questions) return;

    const currentQuestion = questions[currentQuestionIndex];
    const responseForCurrentQuestion = responses.find(
      (r) => r.questionId === currentQuestion.id
    );

    if (!responseForCurrentQuestion) {
      toast({
        title: "No recording found",
        description: "Please record your answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    const encodedResponses = await Promise.all(
      responses.map(async (response) => {
        const base64Audio = await blobToBase64(response.audioBlob);
        const base64Data = base64Audio.split(",")[1];
        return { ...response, audioBlob: base64Data };
      })
    );

    submitResponsesMutation.mutate(encodedResponses);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      const hasResponseForCurrentQuestion = responses.some(
        (r) => r.questionId === questions[currentQuestionIndex].id
      );

      if (!hasResponseForCurrentQuestion) {
        toast({
          title: "No recording found",
          description: "Please record your answer before proceeding.",
          variant: "destructive",
        });
        return;
      }
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleStartOver = () => {
    setEvaluations(null);
    setResponses([]);
    setCurrentQuestionIndex(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-xl font-medium">Loading questions...</p>
      </div>
    );
  }

  if (error || !questions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't load the interview questions. Please try again later.
        </p>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    );
  }

  // If we have evaluations, show the results view
  if (evaluations) {
    return (
      <ResultsView 
        evaluations={evaluations} 
        onStartOver={handleStartOver} 
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasResponse = responses.some(
    (r) => r.questionId === currentQuestion.id
  );
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          AI Screening
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Record your answers to the questions and our AI will evaluate them.
        </p>
      </header>

      <ProgressBar
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions?.length || 0}
        className="mb-8"
      />

      <div className="flex-grow flex flex-col items-center justify-center mb-8">
        {questions && (
          <AnimatedContainer
            isVisible={true}
            animateIn="animate-scale-in"
            animateOut="animate-scale-out"
            className="w-full"
            key={questions[currentQuestionIndex].id}
          >
            <QuestionCard
              question={questions[currentQuestionIndex]}
              onRecordingComplete={handleRecordingComplete}
              isSubmitting={submitResponsesMutation.isPending}
              className="mb-8"
            />
          </AnimatedContainer>
        )}
      </div>

      <div className="flex justify-between items-center mt-auto">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={
            currentQuestionIndex === 0 || submitResponsesMutation.isPending
          }
          className="px-4 py-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {questions && currentQuestionIndex < questions.length - 1 ? (
          <Button
            onClick={handleNextQuestion}
            disabled={
              !responses.some(
                (r) => r.questionId === questions[currentQuestionIndex].id
              ) || submitResponsesMutation.isPending
            }
            className="px-4 py-2"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmitResponse}
            disabled={
              !questions ||
              !responses.some(
                (r) => r.questionId === questions[currentQuestionIndex].id
              ) ||
              submitResponsesMutation.isPending
            }
            className="px-4 py-2"
          >
            {submitResponsesMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Evaluating your answers...
              </>
            ) : (
              <>
                Submit All Answers
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
