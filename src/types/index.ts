
export interface Question {
  id: string;
  text: string;
  type: "behavioral" | "technical";
  category?: string;
}

export interface RecordingState {
  isRecording: boolean;
  audioBlob?: Blob;
  audioUrl?: string;
}

export interface QuestionResponse {
  questionId: string;
  questionText: string,
  audioBlob: Blob;
}

export interface QuestionResponseDto {
  questionId: string;
  audioBlob: string;
}

export interface QuestionEvaluation {
  questionId: string;
  questionText: string;
  answerText: string;
  score: number;
  feedback: string;
}

export interface CodingQuestionEvaluation {
  code: string;
  feedback: string;
}
