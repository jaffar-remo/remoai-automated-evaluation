import { Question, QuestionResponse, QuestionResponseDto, QuestionEvaluation } from "@/types";
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

export const submitResponses = async (responses: QuestionResponseDto[]): Promise<QuestionEvaluation[]> => {
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
