import React, { useEffect, useMemo, useState } from 'react';
import './Dashboard.css';
import { supabase } from '../supabaseClient';
import { fmt } from '../utils/calc';

export default function Leaderboard({ user }) {
  const [filter, setFilter] = useState('everyone');
  const [allSessions, setAllSessions] = useState([]);
  const [groupSessions, setGroupSessions] = useState([]);
  const [profileMap, setProfileMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboardData() {
      setLoading(true);

      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      const myGroupIds = (memberships || []).map((m) => m.group_id);

      const { data: everyoneSessions } = await supabase
        .from('poker_sessions')
        .select('*');

      const { data: myGroupSessions } = myGroupIds.length
        ? await supabase
            .from('poker_sessions')
            .select('*')
            .in('group_id', myGroupIds)
        : { data: [] };

      setAllSessions(everyoneSessions || []);
      setGroupSessions(myGroupSessions || []);

      const userIds = [
        ...new Set([
          ...(everyoneSessions || []).map((s) => s.user_id),
          ...(myGroupSessions || []).map((s) => s.user_id),
        ]),
      ];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, email')
          .in('id', userIds);

        const map = {};

        (profiles || []).forEach((profile) => {
          map[profile.id] = profile;
        });

        setProfileMap(map);
      }

      setLoading(false);
    }

    if (user?.id) {
      loadLeaderboardData();
    }
  }, [user]);

  const rows = useMemo(() => {
    const sessions = filter === 'groups' ? groupSessions : allSessions;
    const map = {};

    sessions.forEach((session) => {
      const userId = session.user_id;

      if (!userId) return;

      if (!map[userId]) {
        map[userId] = {
          user_id: userId,
          total_profit: 0,
          sessions: 0,
          hours: 0,
          biggest_win: 0,
        };
      }

      const pnl = Number(session.pnl || 0);
      const hours = Number(session.hours || 0);

      map[userId].total_profit += pnl;
      map[userId].sessions += 1;
      map[userId].hours += hours;

      if (pnl > map[userId].biggest_win) {
        map[userId].biggest_win = pnl;
      }
    });

    return Object.values(map).sort(
      (a, b) => b.total_profit - a.total_profit
    );
  }, [allSessions, groupSessions, filter]);

  const getName = (userId) => {
    const profile = profileMap[userId];

    if (profile?.username) return profile.username;
    if (profile?.display_name) return profile.display_name;
    if (profile?.email) return profile.email;
    if (userId === user.id) return user.email || 'You';

    return 'Unknown player';
  };

  const getSubtext = (row) => {
    const hourly = row.hours > 0 ? row.total_profit / row.hours : 0;

    return `${row.sessions} sessions · ${row.hours.toFixed(1)}h · ${fmt(hourly)}/hr`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Leaderboard</h2>
          <p className="page-subtitle">
            Compare performance across the app or your groups.
          </p>
        </div>
      </div>

      <div className="type-toggle">
        <button
          className={filter === 'everyone' ? 'active' : ''}
          onClick={() => setFilter('everyone')}
          type="button"
        >
          <i className="ti ti-world" aria-hidden="true" /> Everyone
        </button>

        <button
          className={filter === 'groups' ? 'active' : ''}
          onClick={() => setFilter('groups')}
          type="button"
        >
          <i className="ti ti-users" aria-hidden="true" /> My Groups
        </button>
      </div>

      <div className="section-hdr">
        <span className="section-label">
          {filter === 'groups' ? 'My Group Rankings' : 'App Rankings'}
        </span>
      </div>

      {loading ? (
        <p className="day-empty">Loading leaderboard...</p>
      ) : rows.length === 0 ? (
        <p className="day-empty">No leaderboard data yet.</p>
      ) : (
        rows.map((row, index) => {
          const name = getName(row.user_id);
          const isMe = row.user_id === user.id;

          return (
            <div
              className={`entry-card ${isMe ? 'active' : ''}`}
              key={row.user_id}
            >
              <div className="entry-left">
                <span className="entry-name">
                  #{index + 1} {name}
                  {isMe ? ' (You)' : ''}
                </span>

                <span className="entry-sub">
                  {getSubtext(row)}
                </span>
              </div>

              <div className="entry-right">
                <span
                  className={`entry-amount ${
                    row.total_profit >= 0 ? 'pos' : 'neg'
                  }`}
                >
                  {fmt(row.total_profit)}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}