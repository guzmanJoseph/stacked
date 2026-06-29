import React, { useEffect, useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import { useData } from './hooks/useData';
import Dashboard from './pages/Dashboard';
import Poker from './pages/Poker';
import Calendar from './pages/Calendar';
import Leaderboard from './pages/Leaderboard';
import Friends from './pages/Friends';
import Groups from './pages/Groups';
import AddModal from './components/AddModal';

const NAV = [
  { id: 'dashboard', icon: 'ti-layout-dashboard', label: 'Home' },
  { id: 'poker', icon: 'ti-cards', label: 'Sessions' },
  { id: 'leaderboard', icon: 'ti-trophy', label: 'Ranks' },
  { id: 'calendar', icon: 'ti-calendar', label: 'Calendar' },
  { id: 'groups', icon: 'ti-circles', label: 'Groups' },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');

  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const {
    data,
    addPoker,
    deletePoker,
    editPoker,
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

  const resetModals = () => {
    setModalOpen(false);
    setSettingsOpen(false);
    setEditingEntry(null);
  };

  const handleSubmit = (entry) => {
    const { type, ...cleanEntry } = entry;

    if (editingEntry?.type === 'poker') {
      editPoker(editingEntry.id, cleanEntry);
    } else {
      addPoker(entry);
    }

    resetModals();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetModals();
  };

  if (loading) {
    return <div className="app">Loading...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app">
      <h1 className="sr-only">Stacked</h1>

      <div className="top-bar">
        <div className="app-title">
          <img src="/stacked.png" alt="Stacked logo" className="nav-logo" />
          <span>Stacked</span>
        </div>

        <button
          className="settings-btn"
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
        >
          <i className="ti ti-settings" aria-hidden="true" />
        </button>
      </div>

      <main className="main">
        {tab === 'dashboard' && (
          <Dashboard data={data} />
        )}

        {tab === 'poker' && (
          <Poker
            data={data.poker}
            onDelete={deletePoker}
            onEdit={(session) => {
              setEditingEntry({ ...session, type: 'poker' });
              setModalOpen(true);
            }}
          />
        )}

        {tab === 'leaderboard' && (
          <Leaderboard user={session.user} />
        )}

        {tab === 'friends' && (
          <Friends user={session.user} />
        )}

        {tab === 'groups' && (
          <Groups user={session.user} />
        )}

        {tab === 'calendar' && (
          <Calendar poker={data.poker} />
        )}
      </main>

      {!modalOpen && !settingsOpen && (
        <div className="fab-stack">
          <button
            className="fab"
            type="button"
            onClick={() => {
              setEditingEntry(null);
              setModalOpen(true);
            }}
            aria-label="Add poker session"
          >
            <i className="ti ti-plus" aria-hidden="true" />
          </button>
        </div>
      )}

      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav-btn${tab === n.id ? ' active' : ''}`}
            type="button"
            onClick={() => setTab(n.id)}
            aria-current={tab === n.id ? 'page' : undefined}
          >
            <i className={`ti ${n.icon}`} aria-hidden="true" />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>

      {modalOpen && (
        <AddModal
          user={session.user}
          initialBet={editingEntry}
          onSubmit={handleSubmit}
          onClose={resetModals}
        />
      )}

      {settingsOpen && (
        <div
          className="settings-overlay"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="settings-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" />

            <h3>Settings</h3>

            <button
              className="settings-item"
              type="button"
              onClick={handleLogout}
            >
              <i className="ti ti-logout" aria-hidden="true" />
              <span>Sign Out</span>
            </button>

            <button
              className="settings-item"
              type="button"
              onClick={() => setSettingsOpen(false)}
            >
              <i className="ti ti-x" aria-hidden="true" />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}