
export interface MindMapNode {
  id: string;
  label: string;
  type: 'root' | 'domain' | 'subdomain' | 'concept' | 'detail';
  children?: MindMapNode[];
  color?: string;
  collapsed?: boolean;
  // Structured content matching PDF nodes
  definition?: string;
  example?: string;
  enforcement?: string;
  keyAspect?: string;
  notes?: string;
  citation?: string; // Added for original PDF source text
  related?: string[];
  x?: number;
  y?: number;
}

export interface QuestionReference {
  title: string;
  url: string;
  accessed: string;
}

export interface Question {
  id: string;
  domain: string;
  subdomain: string;
  difficulty: 'Basic' | 'Moderate' | 'Hard';
  stem: string;
  options: { [key: string]: string };
  correctOption: string;
  explanation: string;
  primaryConcepts: string[];
  references: QuestionReference[];
}

export interface QuizState {
  isActive: boolean;
  currentDomain: string | 'All';
  difficultyFilter: string | 'All';
  questionStyle: 'Direct' | 'Scenario';
  questions: Question[];
  currentIndex: number;
  userAnswers: { [questionId: string]: string }; // questionId -> optionKey
  score: number;
  isReview: boolean;
  timeRemaining: number; // seconds
}

export enum AppTab {
  MINDMAP = 'MINDMAP',
  QUIZ = 'QUIZ',
  EXAM = 'EXAM',
  DESIGN = 'DESIGN'
}
