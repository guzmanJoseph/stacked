import { useState, useCallback } from 'react';
import { loadData, saveData } from '../utils/storage';
import { calcBetPnl } from '../utils/calc';

let nextId = Date.now();
const uid = () => ++nextId;

export function useData() {
  const [data, setData] = useState(() => loadData());

  const persist = useCallback((next) => {
    setData(next);
    saveData(next);
  }, []);

  // ── Bets ────────────────────────────────────────────────────────────────
  const addBet = useCallback(
    ({ book, desc, stake, odds, sport, result, date }) => {
      const pnl = calcBetPnl(stake, odds, result);
      const bet = { id: uid(), book, desc, stake: Number(stake), odds, sport, result, date, pnl };
      persist({ ...data, bets: [bet, ...data.bets] });
    },
    [data, persist]
  );

  const deleteBet = useCallback(
    (id) => persist({ ...data, bets: data.bets.filter((b) => b.id !== id) }),
    [data, persist]
  );

  const updateBetResult = useCallback(
    (id, result) => {
      const bets = data.bets.map((b) => {
        if (b.id !== id) return b;
        const pnl = calcBetPnl(b.stake, b.odds, result);
        return { ...b, result, pnl };
      });
      persist({ ...data, bets });
    },
    [data, persist]
  );

  // ── Poker ────────────────────────────────────────────────────────────────
  const addPoker = useCallback(
    ({ opp, buyin, cashout, hours, date }) => {
      const pnl = Number(cashout) - Number(buyin);
      const session = { id: uid(), opp, buyin: Number(buyin), cashout: Number(cashout), hours: Number(hours), date, pnl };
      persist({ ...data, poker: [session, ...data.poker] });
    },
    [data, persist]
  );

  const deletePoker = useCallback(
    (id) => persist({ ...data, poker: data.poker.filter((p) => p.id !== id) }),
    [data, persist]
  );

  // ── Derived stats ────────────────────────────────────────────────────────
  const stats = useCallback(() => {
    const settled = data.bets.filter((b) => b.result !== 'pending');
    const won = data.bets.filter((b) => b.result === 'won');
    const betPnl = settled.reduce((a, b) => a + b.pnl, 0);
    const pokerPnl = data.poker.reduce((a, p) => a + p.pnl, 0);
    const total = betPnl + pokerPnl;

    const monthStr = new Date().toISOString().slice(0, 7);
    const monthBets = data.bets.filter((b) => b.date.startsWith(monthStr) && b.result !== 'pending').reduce((a, b) => a + b.pnl, 0);
    const monthPoker = data.poker.filter((p) => p.date.startsWith(monthStr)).reduce((a, p) => a + p.pnl, 0);
    const monthTotal = monthBets + monthPoker;

    const winPct = settled.length ? Math.round((won.length / settled.length) * 100) : 0;

    return { total, monthTotal, winPct, pokerPnl, betPnl, settledCount: settled.length, wonCount: won.length };
  }, [data]);

  return { data, addBet, deleteBet, updateBetResult, addPoker, deletePoker, stats };
}
