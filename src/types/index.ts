
export interface Question {
  id: string;
  text: string;
  type: 'behavioral' | 'technical';
  category?: string;
}

export interface RecordingState {
  isRecording: boolean;
  audioBlob?: Blob;
  audioUrl?: string;
}

export interface QuestionResponse {
  questionId: string;
  audioBlob: Blob;
}
