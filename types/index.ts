export type WalletCurrency = 'USD' | 'NGN' | 'GHS' | 'KES';

export interface Wallet {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
  currency: WalletCurrency | string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'bet' | 'payout' | 'signal';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  description?: string;
}

export interface Ticket {
  id: string;
  event_name: string;
  total_amount: number;
  created_at: string;
  status: string;
}

export interface Signal {
  id: string;
  title: string;
  market: string;
  odds: number;
  status?: string;
  entry?: string;
  target?: string;
}

export interface StadiumEvent {
  id: string;
  name: string;
  kickoff_time: string;
  venue: string;
  status?: string;
}

export interface CrashGameRound {
  id: string;
  status: 'waiting' | 'running' | 'crashed';
  crash_point: number;
}

export interface CrashGameBet {
  id: string;
  round_id: string;
  amount: number;
  auto_cashout?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
}
