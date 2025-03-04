
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  fetchQuestions, 
  submitResponses, 
  fetchCodingQuestion,
  evaluateCodingAnswer 
} from "@/data/questions";
import { 
  QuestionResponse, 
  QuestionEvaluation, 
  CodingQuestionEvaluation 
} from "@/types";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import AnimatedContainer from "@/components/AnimatedContainer";
import ResultsView from "@/components/ResultsView";
import CodingQuestion from "@/components/CodingQuestion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Code, Loader2 } from "lucide-react";
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
  const [isCodingStep, setIsCodingStep] = useState(false);
  const [codingEvaluation, setCodingEvaluation] = useState<CodingQuestionEvaluation | null>(null);
  const { toast } = useToast();

  const {
    data: questions,
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: fetchQuestions,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const {
    data: codingQuestion,
    isLoading: isCodingQuestionLoading,
    error: codingQuestionError,
  } = useQuery({
    queryKey: ["codingQuestion"],
    queryFn: fetchCodingQuestion,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: false, // Not immediately loaded
  });

  const submitResponsesMutation = useMutation({
    mutationFn: submitResponses,
    onSuccess: ({ results }: { results: QuestionEvaluation[] }) => {
      toast({
        title: "Responses submitted",
        description: "Your responses have been evaluated.",
      });
      
      if (codingEvaluation) {
        setEvaluations(results);
      } else {
        setIsCodingStep(true);
      }
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

  const handleCodingQuestionComplete = (code: string, feedback: string) => {
    setCodingEvaluation({
      code,
      feedback
    });
    
    // If we already have evaluations, show the full results
    if (evaluations) {
      // We already have evaluations, now we have coding evaluation too
      // Show the complete results
    } else {
      // We don't have evaluations yet, this shouldn't happen
      // but we'll handle it gracefully
      toast({
        title: "Error in evaluation sequence",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleLoadCodingQuestion = () => {
    // Refetch the coding question
    const { refetch } = useQuery({
      queryKey: ["codingQuestion"],
      queryFn: fetchCodingQuestion,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      enabled: false,
      onSuccess: (data) => {
        // handle success
      },
      onError: (error) => {
        toast({
          title: "Failed to load coding question",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    });
    
    refetch();
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
    setCodingEvaluation(null);
    setResponses([]);
    setCurrentQuestionIndex(0);
    setIsCodingStep(false);
  };

  // If we have both evaluations and coding evaluation, show the results view
  if (evaluations && codingEvaluation) {
    return (
      <ResultsView 
        evaluations={evaluations} 
        codingEvaluation={codingEvaluation}
        onStartOver={handleStartOver} 
      />
    );
  }

  if (isQuestionsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-xl font-medium">Loading questions...</p>
      </div>
    );
  }

  if (questionsError || !questions) {
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

  // Coding question step
  if (isCodingStep) {
    return (
      <div className="min-h-screen flex flex-col p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Coding Challenge
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Complete the coding challenge to finish your assessment.
          </p>
        </header>

        <div className="flex-grow flex flex-col items-center justify-center mb-8">
          {isCodingQuestionLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Loading coding question...</p>
            </div>
          ) : codingQuestionError ? (
            <div className="flex flex-col items-center text-center">
              <h2 className="text-xl font-bold mb-4">Failed to load coding question</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't load the coding challenge. Please try again.
              </p>
              <Button onClick={handleLoadCodingQuestion}>
                Retry Loading Question
              </Button>
            </div>
          ) : (
            <CodingQuestion 
              question={codingQuestion || "Write a function that adds two numbers and returns the result."} 
              onComplete={handleCodingQuestionComplete}
              isSubmitting={false}
              className="w-full max-w-3xl mx-auto"
            />
          )}
        </div>
      </div>
    );
  }

  // Regular interview questions
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
                Continue to Coding Challenge
                <Code className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
