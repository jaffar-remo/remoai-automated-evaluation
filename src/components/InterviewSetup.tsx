
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, ArrowRight, Loader2 } from "lucide-react";
import { InterviewSetupData } from "@/types";

interface InterviewSetupProps {
  onComplete: (data: InterviewSetupData) => void;
  isLoading: boolean;
}

const InterviewSetup = ({ onComplete, isLoading }: InterviewSetupProps) => {
  const [jobDescription, setJobDescription] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      setCvFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    if (!cvFile) {
      toast({
        title: "CV file required",
        description: "Please upload your CV as a PDF file",
        variant: "destructive",
      });
      return;
    }

    onComplete({ jobDescription, cvFile });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Job Description</h2>
          <Textarea
            placeholder="Paste the job description here..."
            className="min-h-32"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Upload CV (PDF)</h2>
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
            {cvFile ? (
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-sm text-gray-700">{cvFile.name}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCvFile(null)}
                  disabled={isLoading}
                >
                  Change
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  Drag and drop your CV, or click to browse
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("cv-upload")?.click()}
                  disabled={isLoading}
                >
                  Select File
                </Button>
              </>
            )}
            <input
              id="cv-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !jobDescription.trim() || !cvFile}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating questions...
            </>
          ) : (
            <>
              Continue to Interview
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default InterviewSetup;
