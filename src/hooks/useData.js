import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const emptyData = {
  poker: [],
};

export function useData(user) {
  const [data, setData] = useState(emptyData);

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;

      const { data: poker, error } = await supabase
        .from('poker_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Poker load error:', error);
      }

      setData({
        poker: poker || [],
      });
    }

    loadUserData();
  }, [user]);

  const addPoker = useCallback(
    async ({ opp, buyin, cashout, hours, date, group_id }) => {
      if (!user) return;

      const pnl = Number(cashout) - Number(buyin);

      const newSession = {
        user_id: user.id,
        opp,
        buyin: Number(buyin),
        cashout: Number(cashout),
        hours: hours ? Number(hours) : 0,
        date,
        group_id: group_id || null,
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
    const { error } = await supabase
      .from('poker_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    setData((prev) => ({
      ...prev,
      poker: prev.poker.filter((p) => p.id !== id),
    }));
  }, []);

  const editPoker = useCallback(async (id, updates) => {
    const pnl = Number(updates.cashout) - Number(updates.buyin);

    const { data: updated, error } = await supabase
      .from('poker_sessions')
      .update({
        ...updates,
        buyin: Number(updates.buyin),
        cashout: Number(updates.cashout),
        hours: updates.hours ? Number(updates.hours) : 0,
        group_id: updates.group_id || null,
        pnl,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setData((prev) => ({
      ...prev,
      poker: prev.poker.map((p) => (p.id === id ? updated : p)),
    }));
  }, []);

  const stats = useCallback(() => {
    const total = data.poker.reduce((a, p) => a + Number(p.pnl || 0), 0);

    const monthStr = new Date().toISOString().slice(0, 7);

    const monthTotal = data.poker
      .filter((p) => p.date?.startsWith(monthStr))
      .reduce((a, p) => a + Number(p.pnl || 0), 0);

    const winningSessions = data.poker.filter((p) => Number(p.pnl || 0) > 0)
      .length;

    const winPct = data.poker.length
      ? Math.round((winningSessions / data.poker.length) * 100)
      : 0;

    return {
      total,
      monthTotal,
      winPct,
      pokerPnl: total,
    };
  }, [data]);

  return {
    data,
    addPoker,
    deletePoker,
    editPoker,
    stats,
  };
}