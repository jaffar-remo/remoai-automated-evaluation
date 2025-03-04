
import { Question, QuestionResponse, QuestionResponseDto, QuestionEvaluation, CodingQuestionEvaluation } from "@/types";
import axios from 'axios';

const BASE_URL = "http://0.0.0.0:8070";

export const mockQuestions: Question[] = [
  {
    id: "1",
    text: "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
    type: "behavioral",
    category: "Teamwork",
  },
  {
    id: "2",
    text: "Describe a project where you had to meet a tight deadline. How did you manage your time and resources?",
    type: "behavioral",
    category: "Time Management",
  },
];

export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/questions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const healthCheck = async (): Promise<string> => {
  return fetch(`${BASE_URL}/`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Health check failed");
      }
      return "Health check passed";
    })
    .catch((error) => {
      console.error("Health check error:", error);
      throw error;
    });
};

export const submitResponses = async (responses: QuestionResponseDto[]): Promise<{results: QuestionEvaluation[]}> => {
  try {
    const response = await axios.post(`${BASE_URL}/submit-responses`, responses, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to submit responses');
  }
};

export const fetchCodingQuestion = async (): Promise<string> => {
  try {
    const response = await axios.get(`${BASE_URL}/coding-question`);
    return response.data;
  } catch (error) {
    console.error("Error fetching coding question:", error);
    throw error;
  }
};

export const evaluateCodingAnswer = async (question: string, answer: string): Promise<CodingQuestionEvaluation> => {
  try {
    const response = await axios.post(`${BASE_URL}/evaluate-answer`, {
      question,
      answer
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // The response now contains { comment: string, evaluation: number }
    return {
      code: answer,
      feedback: response.data.comment,
      score: response.data.evaluation
    };
  } catch (error) {
    console.error("Error evaluating coding answer:", error);
    throw error;
  }
};
