import type { CrashGameBet, CrashGameRound, Signal, StadiumEvent, Ticket, Transaction, Wallet } from '@/types';

const createWallet = (userId: string): Wallet => ({
  id: `wallet-${userId}`,
  user_id: userId,
  available_balance: 120.5,
  pending_balance: 15.25,
  currency: 'USD',
});

const createTransaction = (id: string, amount: number, type: Transaction['type']): Transaction => ({
  id,
  user_id: 'demo-user',
  amount,
  type,
  status: 'completed',
  created_at: new Date().toISOString(),
  description: `${type} transaction`,
});

export async function fetchWallet(userId: string): Promise<{ data: Wallet | null; error: string | null }> {
  return { data: createWallet(userId), error: null };
}

export async function fetchTransactions(userId: string): Promise<{ data: Transaction[] | null; error: string | null }> {
  return {
    data: [
      createTransaction('txn-1', 25, 'deposit'),
      createTransaction('txn-2', 15, 'bet'),
      createTransaction('txn-3', 50, 'signal'),
    ],
    error: null,
  };
}

export async function fetchUserTickets(userId: string): Promise<{ data: Ticket[] | null; error: string | null }> {
  return {
    data: [
      { id: 'ticket-1', event_name: 'Manchester City vs Arsenal', total_amount: 20, created_at: new Date().toISOString(), status: 'active' },
      { id: 'ticket-2', event_name: 'Paris vs Real Madrid', total_amount: 32, created_at: new Date().toISOString(), status: 'resolved' },
    ],
    error: null,
  };
}

export async function fetchPurchasedSignals(userId: string): Promise<{ data: Signal[] | null; error: string | null }> {
  return {
    data: [
      { id: 'signal-1', title: 'Over 2.5 Goals', market: 'Match Goals', odds: 1.85, status: 'active', entry: '1.60', target: '2.20' },
      { id: 'signal-2', title: 'Home Win', market: '1X2', odds: 2.1, status: 'locked', entry: '1.90', target: '2.70' },
    ],
    error: null,
  };
}

export async function fetchEvents(type: string): Promise<{ data: StadiumEvent[] | null; error: string | null }> {
  return {
    data: [
      { id: 'event-1', name: 'Ligue 1 Matchday', kickoff_time: new Date().toISOString(), venue: 'Paris', status: 'upcoming' },
      { id: 'event-2', name: 'Champions League Night', kickoff_time: new Date(Date.now() + 3600000).toISOString(), venue: 'Madrid', status: 'upcoming' },
    ],
    error: null,
  };
}

export async function fetchSignals(): Promise<{ data: Signal[] | null; error: string | null }> {
  return {
    data: [
      { id: 'signal-a', title: 'Double Chance', market: '1X2', odds: 1.54, status: 'active', entry: '1.40', target: '1.85' },
      { id: 'signal-b', title: 'Both Teams To Score', market: 'BTTS', odds: 1.88, status: 'active', entry: '1.65', target: '2.15' },
      { id: 'signal-c', title: 'Under 2.5', market: 'Goals', odds: 1.72, status: 'waiting', entry: '1.55', target: '2.00' },
    ],
    error: null,
  };
}

export async function fetchCurrentCrashRound(): Promise<{ data: CrashGameRound | null; error: string | null }> {
  return { data: { id: 'crash-1', status: 'running', crash_point: 1.9 }, error: null };
}

export async function fetchCrashHistory(limit: number): Promise<{ data: CrashGameRound[] | null; error: string | null }> {
  const history: CrashGameRound[] = [
    { id: 'crash-2', status: 'crashed', crash_point: 1.4 },
    { id: 'crash-3', status: 'crashed', crash_point: 2.1 },
    { id: 'crash-4', status: 'crashed', crash_point: 1.7 },
  ];

  return {
    data: history.slice(0, limit),
    error: null,
  };
}

export async function placeCrashBet(roundId: string, amount: number, autoCashout?: number): Promise<{ data: CrashGameBet | null; error: string | null }> {
  return {
    data: {
      id: `bet-${roundId}`,
      round_id: roundId,
      amount,
      auto_cashout: autoCashout,
    },
    error: null,
  };
}
