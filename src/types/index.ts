export interface AdminMap {
  [uid: string]: boolean;
}

export interface StaffPermissions {
  matches: boolean;
}

export interface StaffMember {
  uid: string;
  name: string;
  email: string;
  active: boolean;
  permissions: StaffPermissions;
  createdAt: number;
}

export interface AppConfig {
  appName: string;
  supportUpi: string;
  supportPhone: string;
  supportTelegram: string;
  minDeposit: number;
  minWithdraw: number;
  adminCreated: boolean;
  maintenanceMode: boolean;
  bannerAnnouncement?: string;
  rulesNotice?: string;
}

export interface EsportsGame {
  id: string;
  name: string;
  shortName: string;
  banner: string;
  icon: string;
  genre: string;
  active: boolean;
}

export interface SliderBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  btnText: string;
  active: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'reward' | 'match' | 'alert';
  read?: boolean;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  walletBalance: number; // Play/Deposit balance
  winBalance: number;    // Withdrawable prize balance
  banned: boolean;
  createdAt: number;
  referralCode: string;
  referredBy?: string;
  defaultIgn?: string;
  defaultGameUid?: string;
  totalMatches: number;
  totalWins: number;
  totalKills: number;
}

export interface PrizeBreakdown {
  rank: string;
  prize: number;
}

export interface Tournament {
  key: string; // Firebase unique key
  title: string;
  game: string;
  status: 'upcoming' | 'ongoing' | 'resulted';
  entryFee: number;
  prizePool: number;
  totalSpots: number;
  joined: number;
  time: number; // Timestamp
  matchType: 'SOLO' | 'DUO' | 'SQUAD';
  map: string;
  version: 'TPP' | 'FPP';
  perKill: number;
  prizeDistribution: PrizeBreakdown[];
  rules: string[];
  bannerUrl?: string;
}

export interface MatchRoom {
  matchId: string;
  roomId: string;
  password: string;
  instructions: string;
  releasedAt?: number;
}

export interface MatchParticipant {
  uid: string;
  ign: string;
  gameUid: string;
  count: number;
  slotNo: number;
  teamMembers?: string[];
  registeredAt: number;
}

export interface MatchWinnerResult {
  rank: number;
  uid: string;
  ign: string;
  gameUid: string;
  kills: number;
  prize: number;
}

export interface MatchResult {
  matchId: string;
  title: string;
  game: string;
  resultedAt: number;
  winners: MatchWinnerResult[];
  proofScreenshot?: string;
  note?: string;
}

export interface DepositRequest {
  id: string;
  uid: string;
  username: string;
  amount: number;
  utr: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  method: string;
  note?: string;
}

export interface WithdrawalRequest {
  id: string;
  uid: string;
  username: string;
  amount: number;
  upi: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  note?: string;
  processedAt?: number;
}

export interface Transaction {
  id: string;
  uid: string;
  type: 'deposit' | 'withdrawal' | 'entry_fee' | 'win_prize' | 'referral_bonus' | 'refund';
  amount: number;
  description: string;
  timestamp: number;
  status: 'success' | 'pending' | 'failed';
}

export interface RuleValidationResult {
  allowed: boolean;
  rulePath: string;
  reason: string;
}
