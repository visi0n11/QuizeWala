export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type GameMode = 'classic' | 'sprint' | 'survival';

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string] | string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
  codeSnippet?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  questions: QuizQuestion[];
  coverImage?: string;
  iconName?: string;
  isCustom?: boolean;
  author?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  category: string;
  gameMode: GameMode;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  timeSpentSeconds: number;
  maxCombo: number;
  xpEarned: number;
  timestamp: number;
  userAnswers: Record<string, number>; // questionId -> chosen index (-1 if timed out/skipped)
}

export interface UserBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface UserProfile {
  name: string;
  xp: number;
  level: number;
  streakDays: number;
  lastPlayedDate?: string;
  soundEnabled: boolean;
  darkMode: boolean;
  attempts: QuizAttempt[];
  badges: string[];
  bookmarkedQuestionIds: string[];
}
