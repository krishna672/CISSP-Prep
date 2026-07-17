
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
  ADMIN = 'ADMIN',
  LEADERBOARD = 'LEADERBOARD'
}

export interface InviteCode {
  code: string;
  createdAt: string;
  createdBy: string;
  usedCount: number;
  candidateName?: string;
  // Server-issued cryptographic receipt for the device that first redeemed
  // this code, used to verify legitimate same-device re-logins without
  // trusting a client-asserted claim. Never set or read by the client
  // directly -- managed entirely by redeem_invite_code.ts.
  redemptionReceipt?: string;
}

export interface LeaderboardEntry {
  id: string;
  code: string;
  name: string;
  score: number;
  type: 'CAT Exam' | 'Practice Quiz';
  questionsCount: number;
  timestamp: string;
  passed: boolean;
}

// Controls which questions candidates see in Practice Quiz / Adaptive CAT:
// - 'default': only the built-in static question bank
// - 'custom': only admin-added custom questions (manual entry / JSON upload)
// - 'selected': only the specific question IDs the admin hand-picked
export interface QuestionVisibilitySettings {
  mode: 'default' | 'custom' | 'selected';
  selectedIds: string[];
}

// Admin edits to an EXISTING mind map node's content (only the fields
// present are overridden; anything omitted keeps the original value).
export interface MindMapNodeEdit {
  label?: string;
  definition?: string;
  example?: string;
  enforcement?: string;
  keyAspect?: string;
  notes?: string;
  citation?: string;
}

// A brand-new node added by an admin, attached under an existing (or
// another added) node via parentId.
export interface MindMapAddedNode {
  id: string;
  parentId: string;
  label: string;
  type: 'domain' | 'subdomain' | 'concept' | 'detail';
  color?: string;
  definition?: string;
  example?: string;
  enforcement?: string;
  keyAspect?: string;
  notes?: string;
  citation?: string;
}

export interface MindMapOverrides {
  edits: Record<string, MindMapNodeEdit>;
  added: MindMapAddedNode[];
}
