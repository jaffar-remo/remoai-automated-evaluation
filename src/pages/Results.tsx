
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { QuestionEvaluation } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  
  // Get evaluations from location state or redirect if none
  const evaluations = location.state?.evaluations as QuestionEvaluation[] | undefined;
  
  if (!evaluations || evaluations.length === 0) {
    // If there's no evaluation data, redirect to home
    navigate("/");
    return null;
  }
  
  // Calculate overall score
  const overallScore = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;
  
  const toggleExpand = (questionId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Start New Interview
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Your Interview Results
        </h1>
        <p className="text-muted-foreground max-w-xl">
          AI analysis of your interview responses
        </p>
      </header>
      
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <h2 className="text-2xl font-semibold">Overall Performance</h2>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Overall Score</span>
              <span className="font-bold">{overallScore.toFixed(1)}/10</span>
            </div>
            <Progress 
              value={overallScore * 10} 
              className="h-2" 
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Based on {evaluations.length} question responses
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-semibold mb-4">Question Breakdown</h2>
      
      <div className="space-y-4 mb-8">
        {evaluations.map((evaluation) => (
          <Card key={evaluation.questionId} className="overflow-hidden">
            <div 
              className="p-4 cursor-pointer flex justify-between items-start" 
              onClick={() => toggleExpand(evaluation.questionId)}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Question {evaluation.questionId}</Badge>
                  <Badge variant={evaluation.score >= 7 ? "default" : evaluation.score >= 5 ? "secondary" : "destructive"}>
                    Score: {evaluation.score}/10
                  </Badge>
                </div>
                <h3 className="text-lg font-medium">{evaluation.questionText}</h3>
              </div>
              {expandedQuestions[evaluation.questionId] ? (
                <ChevronUp className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              )}
            </div>
            
            {expandedQuestions[evaluation.questionId] && (
              <>
                <Separator />
                <CardContent className="p-4">
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Your Answer</h4>
                    <p className="text-muted-foreground whitespace-pre-line">{evaluation.answerText}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">AI Feedback</h4>
                    <p className="text-muted-foreground whitespace-pre-line">{evaluation.feedback}</p>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>
      
      <div className="mt-auto text-center">
        <Link to="/">
          <Button>Start New Interview</Button>
        </Link>
      </div>
    </div>
  );
};

export default Results;
