
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type View = 'landing' | 'auth' | 'game' | 'privacy' | 'terms' | 'support' | 'reviews' | 'profile' | 'payment' | 'admin' | 'referral' | 'kids';
export type KidsGridSize = '4x4' | '6x6';
export type KidsColor = 'red' | 'blue' | 'yellow' | 'green' | 'purple' | 'orange';

export interface GlobalSettings {
  appName: string;
  primaryColor: string;
  pointsPerLevel: number;
  timeBonusMultiplier: number;
  mistakePenalty: number;
  stripePublicKey?: string;
  stripeSecretKey?: string;
  paypalClientId?: string;
  paypalSecretKey?: string;
}

export interface CreditPack {
  id: string;
  pack: string;
  qty: number;
  amount: string;
  price: number;
  bonus: string;
  active?: boolean;
}

export interface AdminStats {
  totalRevenue: number;
  totalUsers: number;
  totalPacksSold: number;
  averageTicket: number;
}

export interface UserProfile {
  name: string;
  email: string;
  totalScore: number;
  completedLevelCount: number;
  credits: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  selectedTrackIndex?: number;
  avatar?: string;
  purchaseHistory: Purchase[];
  referralCode?: string;
  referredBy?: string;
  referralData?: ReferralData;
  referralMilestones?: string[];
}

export interface ReferralData {
  code: string;
  userId: string;
  createdAt: number;
  totalReferred: number;
  totalEarned: number;
  referredUsers: ReferredUser[];
}

export interface ReferredUser {
  id: string;
  name: string;
  status: 'pending' | 'signed_up' | 'played' | 'purchased';
  signupDate: number;
  creditsEarned: number;
  hasReferred: boolean;
}

export interface Purchase {
  id: string;
  date: number;
  credits: number;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isMe?: boolean;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  levels: number;
  isCurrentUser?: boolean;
}

export interface SudokuState {
  board: (number | null)[][];
  initialBoard: (number | null)[][];
  solution: number[][];
  notes: Set<number>[][];
  selectedCell: [number, number] | null;
  mistakes: number;
  maxMistakes: number;
  isComplete: boolean;
  level: number;
  timer: number;
  timeLeft: number;
  isPaused: boolean;
  history: (number | null)[][][];
}

export interface LevelData {
  id: number;
  difficulty: Difficulty;
  clues: number;
}

export interface KidsState {
  board: (KidsColor | null)[][];
  initialBoard: (KidsColor | null)[][];
  solution: KidsColor[][];
  selectedCell: [number, number] | null;
  isComplete: boolean;
  gridSize: KidsGridSize;
  level: number;
}
