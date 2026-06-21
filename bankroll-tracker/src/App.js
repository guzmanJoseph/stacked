import React, { useEffect, useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import { useData } from './hooks/useData';
import Dashboard from './pages/Dashboard';
import Bets from './pages/Bets';
import Poker from './pages/Poker';
import Calendar from './pages/Calendar';
import AddModal from './components/AddModal';

const NAV = [
  { id: 'dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
  { id: 'bets', icon: 'ti-ticket', label: 'Bets' },
  { id: 'poker', icon: 'ti-cards', label: 'Poker' },
  { id: 'calendar', icon: 'ti-calendar', label: 'Calendar' },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);

  const {
    data,
    addBet,
    deleteBet,
    updateBetResult,
    addPoker,
    deletePoker,
    stats,
  } = useData(session?.user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAdd = (entry) => {
    if (entry.type === 'bet') addBet(entry);
    else addPoker(entry);
    setModalOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="app">Loading...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app">
      <h1 className="sr-only">Bankroll Tracker</h1>

      <button className="logout-btn" onClick={handleLogout}>
        Log Out
      </button>

      <main className="main">
        {tab === 'dashboard' && <Dashboard data={data} stats={stats} />}

        {tab === 'bets' && (
          <Bets
            data={data.bets}
            onDelete={deleteBet}
            onUpdateResult={updateBetResult}
          />
        )}

        {tab === 'poker' && <Poker data={data.poker} onDelete={deletePoker} />}

        {tab === 'calendar' && (
          <Calendar bets={data.bets} poker={data.poker} />
        )}
      </main>

      <button
        className="fab"
        onClick={() => setModalOpen(true)}
        aria-label="Add entry"
      >
        <i className="ti ti-plus" aria-hidden="true" />
      </button>

      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav-btn${tab === n.id ? ' active' : ''}`}
            onClick={() => setTab(n.id)}
            aria-current={tab === n.id ? 'page' : undefined}
          >
            <i className={`ti ${n.icon}`} aria-hidden="true" />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>

      {modalOpen && (
        <AddModal onSubmit={handleAdd} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}