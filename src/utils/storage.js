const KEY = 'bankroll_tracker_v1';

const SEED_DATA = {
  bets: [
    {
      id: 1,
      book: 'DraftKings',
      desc: 'Lakers -4.5 vs Celtics',
      stake: 50,
      odds: '-110',
      sport: '🏀 NBA',
      result: 'won',
      date: daysAgo(1),
      pnl: 45.45,
    },
    {
      id: 2,
      book: 'FanDuel',
      desc: 'Chiefs ML',
      stake: 100,
      odds: '-150',
      sport: '🏈 NFL',
      result: 'won',
      date: daysAgo(3),
      pnl: 66.67,
    },
    {
      id: 3,
      book: 'BetMGM',
      desc: 'Yankees over 8.5 runs',
      stake: 25,
      odds: '-110',
      sport: '⚾ MLB',
      result: 'lost',
      date: daysAgo(4),
      pnl: -25,
    },
    {
      id: 4,
      book: 'DraftKings',
      desc: 'Oilers +1.5',
      stake: 75,
      odds: '+105',
      sport: '🏒 NHL',
      result: 'lost',
      date: daysAgo(5),
      pnl: -75,
    },
    {
      id: 5,
      book: 'ESPNBet',
      desc: 'Djokovic -1.5 sets',
      stake: 40,
      odds: '-120',
      sport: '🎾 Tennis',
      result: 'pending',
      date: daysAgo(0),
      pnl: 0,
    },
  ],
  poker: [
    {
      id: 1,
      opp: 'Friday night — home game',
      buyin: 100,
      cashout: 185,
      hours: 3,
      date: daysAgo(2),
      pnl: 85,
    },
    {
      id: 2,
      opp: "Tom's basement game",
      buyin: 50,
      cashout: 20,
      hours: 2,
      date: daysAgo(6),
      pnl: -30,
    },
  ],
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
    // First run — seed with examples
    localStorage.setItem(KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  } catch {
    return { bets: [], poker: [] };
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}
