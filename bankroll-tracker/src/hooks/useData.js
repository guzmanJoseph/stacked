import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { calcBetPnl } from '../utils/calc';

const emptyData = {
  bets: [],
  poker: [],
};

export function useData(user) {
  const [data, setData] = useState(emptyData);

 useEffect(() => {
  async function loadUserData() {
    if (!user) return;

    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const { data: poker, error: pokerError } = await supabase
      .from('poker_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (betsError) console.error('Bets load error:', betsError);
    if (pokerError) console.error('Poker load error:', pokerError);

    setData({
      bets: bets || [],
      poker: poker || [],
    });
  }

  loadUserData();
}, [user]);

  const addBet = useCallback(
    async ({ book, desc, stake, odds, sport, result, date, cashout_amount, cashed_out }) => {
      if (!user) return;

      let pnl = calcBetPnl(stake, odds, result);

      if (result === 'cashed_out') {
        pnl = Number(cashout_amount) - Number(stake);
      }

      const newBet = {
        user_id: user.id,
        book,
        desc,
        stake: Number(stake),
        odds,
        sport,
        result,
        date,
        pnl,
        cashout_amount: result === 'cashed_out' ? Number(cashout_amount) : null,
        cashed_out: result === 'cashed_out' || cashed_out,
      };

      const { data: inserted, error } = await supabase
        .from('bets')
        .insert(newBet)
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setData((prev) => ({
        ...prev,
        bets: [inserted, ...prev.bets],
      }));
    },
    [user]
  );

  const deleteBet = useCallback(async (id) => {
    const { error } = await supabase.from('bets').delete().eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    setData((prev) => ({
      ...prev,
      bets: prev.bets.filter((b) => b.id !== id),
    }));
  }, []);

  const updateBetResult = useCallback(
    async (id, result, cashoutAmount = null) => {
      const bet = data.bets.find((b) => b.id === id);
      if (!bet) return;

      let pnl = calcBetPnl(bet.stake, bet.odds, result);

      const updates = {
        result,
        pnl,
        cashed_out: false,
        cashout_amount: null,
      };

      if (result === 'cashed_out') {
        pnl = Number(cashoutAmount) - Number(bet.stake);

        updates.result = 'cashed_out';
        updates.pnl = pnl;
        updates.cashout_amount = Number(cashoutAmount);
        updates.cashed_out = true;
      }

      const { data: updated, error } = await supabase
        .from('bets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setData((prev) => ({
        ...prev,
        bets: prev.bets.map((b) => (b.id === id ? updated : b)),
      }));
    },
    [data.bets]
  );

  const addPoker = useCallback(
    async ({ opp, buyin, cashout, hours, date }) => {
      if (!user) return;

      const pnl = Number(cashout) - Number(buyin);

      const newSession = {
        user_id: user.id,
        opp,
        buyin: Number(buyin),
        cashout: Number(cashout),
        hours: Number(hours),
        date,
        pnl,
      };

      const { data: inserted, error } = await supabase
        .from('poker_sessions')
        .insert(newSession)
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setData((prev) => ({
        ...prev,
        poker: [inserted, ...prev.poker],
      }));
    },
    [user]
  );

  const deletePoker = useCallback(async (id) => {
    const { error } = await supabase.from('poker_sessions').delete().eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    setData((prev) => ({
      ...prev,
      poker: prev.poker.filter((p) => p.id !== id),
    }));
  }, []);

  const stats = useCallback(() => {
    const settled = data.bets.filter((b) => b.result !== 'pending');
    const won = data.bets.filter((b) => b.result === 'won');

    const betPnl = settled.reduce((a, b) => a + Number(b.pnl || 0), 0);
    const pokerPnl = data.poker.reduce((a, p) => a + Number(p.pnl || 0), 0);
    const total = betPnl + pokerPnl;

    const monthStr = new Date().toISOString().slice(0, 7);

    const monthBets = data.bets
      .filter((b) => b.date?.startsWith(monthStr) && b.result !== 'pending')
      .reduce((a, b) => a + Number(b.pnl || 0), 0);

    const monthPoker = data.poker
      .filter((p) => p.date?.startsWith(monthStr))
      .reduce((a, p) => a + Number(p.pnl || 0), 0);

    const monthTotal = monthBets + monthPoker;

    const winPct = settled.length
      ? Math.round((won.length / settled.length) * 100)
      : 0;

    return {
      total,
      monthTotal,
      winPct,
      pokerPnl,
      betPnl,
      settledCount: settled.length,
      wonCount: won.length,
    };
  }, [data]);

  return {
    data,
    addBet,
    deleteBet,
    updateBetResult,
    addPoker,
    deletePoker,
    stats,
  };
}