
import { Question } from '@/types';

export const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'Tell me about a time when you had to work with a difficult team member. How did you handle the situation?',
    type: 'behavioral',
    category: 'Teamwork',
  },
  {
    id: '2',
    text: 'Describe a project where you had to meet a tight deadline. How did you manage your time and resources?',
    type: 'behavioral',
    category: 'Time Management',
  },
  {
    id: '3',
    text: 'Can you walk through your approach to solving a complex problem? Share a specific example.',
    type: 'behavioral',
    category: 'Problem Solving',
  },
  {
    id: '4',
    text: 'Tell me about a time you received critical feedback. How did you respond to it?',
    type: 'behavioral',
    category: 'Growth Mindset',
  },
  {
    id: '5',
    text: 'Describe a situation where you had to make a difficult decision with limited information.',
    type: 'behavioral',
    category: 'Decision Making',
  },
  {
    id: '6',
    text: 'Explain the difference between useMemo and useCallback in React, and when you would use each.',
    type: 'technical',
    category: 'React',
  },
  {
    id: '7',
    text: 'How would you optimize the performance of a React application that is rendering slowly?',
    type: 'technical',
    category: 'Performance',
  },
  {
    id: '8',
    text: 'Explain how you would implement authentication in a React application.',
    type: 'technical',
    category: 'Security',
  },
  {
    id: '9',
    text: 'What is the virtual DOM in React, and how does it improve performance?',
    type: 'technical',
    category: 'React Fundamentals',
  },
  {
    id: '10',
    text: 'Describe the difference between server-side rendering and client-side rendering. What are the pros and cons of each?',
    type: 'technical',
    category: 'Web Architecture',
  },
];

export const fetchQuestions = async (): Promise<Question[]> => {
  // Mock API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockQuestions);
    }, 800);
  });
};
