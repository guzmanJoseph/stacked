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
import ScanModal from './components/ScanModal';

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
  const [scanOpen, setScanOpen] = useState(false);
  const [scannedBet, setScannedBet] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  const {
    data,
    addBet,
    deleteBet,
    updateBetResult,
    editBet,
    addPoker,
    deletePoker,
    editPoker,
    stats,
  } = useData(session?.user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleSubmit = (entry) => {
    const { type, ...cleanEntry } = entry;
    if (editingEntry?.type === 'bet') {
      editBet(editingEntry.id, cleanEntry);
    } else if (editingEntry?.type === 'poker') {
      editPoker(editingEntry.id, cleanEntry);
    } else if (entry.type === 'bet') {
      addBet(entry);
    } else {
      addPoker(entry);
    }

    setModalOpen(false);
    setScannedBet(null);
    setEditingEntry(null);
  };

  if (loading) return <div className="app">Loading...</div>;
  if (!session) return <Auth />;

  return (
    <div className="app">
      <h1 className="sr-only">Bankroll Tracker</h1>

      <div className="top-bar">
        <div className="app-title">
          <img src="/dt.png" alt="logo" className="nav-logo" />
          <span>Degeneracy Tracker</span>
        </div>

        <button
          className="settings-btn"
          onClick={() => setSettingsOpen(true)}
        >
          <i className="ti ti-settings" />
        </button>
      </div>

      <main className="main">
        {tab === 'dashboard' && <Dashboard data={data} stats={stats} />}

        {tab === 'bets' && (
          <Bets
            data={data.bets}
            onDelete={deleteBet}
            onUpdateResult={updateBetResult}
            onEdit={(bet) => {
              setEditingEntry({ ...bet, type: 'bet' });
              setModalOpen(true);
            }}
          />
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

        {tab === 'calendar' && (
          <Calendar bets={data.bets} poker={data.poker} />
        )}
      </main>

      {!modalOpen && !scanOpen && (
        <div className="fab-stack">
          <button className="fab scan-fab" onClick={() => setScanOpen(true)}>
            📸
          </button>

          <button className="fab" onClick={() => setModalOpen(true)}>
            <i className="ti ti-plus" aria-hidden="true" />
          </button>
        </div>
      )}

      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav-btn${tab === n.id ? ' active' : ''}`}
            onClick={() => setTab(n.id)}
          >
            <i className={`ti ${n.icon}`} aria-hidden="true" />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>

      {modalOpen && (
        <AddModal
          initialBet={scannedBet || editingEntry}
          onSubmit={handleSubmit}
          onClose={() => {
            setModalOpen(false);
            setScannedBet(null);
            setEditingEntry(null);
          }}
        />
      )}

      {scanOpen && (
        <ScanModal
          onClose={() => setScanOpen(false)}
          onScanComplete={(parsedBet) => {
            setScannedBet(parsedBet);
            setScanOpen(false);
            setModalOpen(true);
          }}
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
        onClick={handleLogout}
      >
        <i className="ti ti-logout" />
        <span>Sign Out</span>
      </button>

      <button
        className="settings-item"
        onClick={() => setSettingsOpen(false)}
      >
        <i className="ti ti-x" />
        <span>Close</span>
      </button>
    </div>
  </div>
)}
    </div>
  );
}