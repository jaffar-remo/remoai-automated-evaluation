import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchQuestions,
  submitResponses,
  fetchCodingQuestion,
  generateInterviewQuestions,
} from "@/data/questions";
import {
  QuestionResponse,
  QuestionEvaluation,
  CodingQuestionEvaluation,
  InterviewSetupData,
  Question,
} from "@/types";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import AnimatedContainer from "@/components/AnimatedContainer";
import ResultsView from "@/components/ResultsView";
import CodingQuestion from "@/components/CodingQuestion";
import InterviewSetup from "@/components/InterviewSetup";
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
  const [isSetupStep, setIsSetupStep] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [evaluations, setEvaluations] = useState<QuestionEvaluation[] | null>(
    null
  );
  const [isCodingStep, setIsCodingStep] = useState(false);
  const [codingEvaluation, setCodingEvaluation] =
    useState<CodingQuestionEvaluation | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const { toast } = useToast();

  const generateQuestionsMutation = useMutation({
    mutationFn: ({ jobDescription, cvFile }: InterviewSetupData) => 
      generateInterviewQuestions(jobDescription, cvFile as File),
    onSuccess: (data) => {
      setQuestions(data);
      setIsSetupStep(false);
      toast({
        title: "Questions generated",
        description: "Your interview questions are ready.",
      });
    },
    onError: (error) => {
      console.error("Error generating questions:", error);
      toast({
        title: "Failed to generate questions",
        description: "Please try again or check your inputs.",
        variant: "destructive",
      });
    },
  });

  const {
    data: codingQuestion,
    isLoading: isCodingQuestionLoading,
    error: codingQuestionError,
    refetch: refetchCodingQuestion,
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

      setEvaluations(results);

      if (!codingEvaluation) {
        setIsCodingStep(true);
        refetchCodingQuestion();
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

  const handleInterviewSetupComplete = (data: InterviewSetupData) => {
    generateQuestionsMutation.mutate(data);
  };

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

  const handleCodingQuestionComplete = (result: CodingQuestionEvaluation) => {
    setCodingEvaluation(result);
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

  if (evaluations && codingEvaluation) {
    return (
      <ResultsView
        evaluations={evaluations}
        codingEvaluation={codingEvaluation}
        onStartOver={handleStartOver}
      />
    );
  }

  if (isSetupStep) {
    return (
      <div className="min-h-screen flex flex-col p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            AI Interview Preparation
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Upload your CV and the job description to start your personalized interview preparation.
          </p>
        </header>

        <div className="flex-grow flex flex-col items-center justify-center">
          <InterviewSetup 
            onComplete={handleInterviewSetupComplete} 
            isLoading={generateQuestionsMutation.isPending}
          />
        </div>
      </div>
    );
  }

  if (generateQuestionsMutation.isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-xl font-medium">Generating your questions...</p>
      </div>
    );
  }

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
              <h2 className="text-xl font-bold mb-4">
                Failed to load coding question
              </h2>
              <p className="text-muted-foreground mb-6">
                We couldn't load the coding challenge. Please try again.
              </p>
              <Button onClick={() => refetchCodingQuestion()}>
                Retry Loading Question
              </Button>
            </div>
          ) : (
            <CodingQuestion
              question={
                codingQuestion.question ||
                "Write a function that adds two numbers and returns the result."
              }
              onComplete={handleCodingQuestionComplete}
              isSubmitting={false}
              className="w-full max-w-3xl mx-auto"
            />
          )}
        </div>
      </div>
    );
  }

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

      {questions && (
        <ProgressBar
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          className="mb-8"
        />
      )}

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
        {!isSetupStep && (
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
        )}

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
