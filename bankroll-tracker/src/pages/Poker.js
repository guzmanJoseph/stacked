import React from 'react';
import './Poker.css';
import { PokerCard } from '../components/EntryCard';
import { EmptyState } from './Dashboard';
import { fmt } from '../utils/calc';

export default function Poker({ data, onDelete }) {
  const total = data.reduce((a, p) => a + p.pnl, 0);
  const totalHours = data.reduce((a, p) => a + (p.hours || 0), 0);
  const perHour = totalHours > 0 ? total / totalHours : 0;
  const wins = data.filter((p) => p.pnl > 0).length;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Poker</h2>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total P&L</span>
          <span className={`stat-value ${total >= 0 ? 'pos' : 'neg'}`}>{fmt(total)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Sessions</span>
          <span className="stat-value">{data.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">$/hr avg</span>
          <span className={`stat-value ${perHour >= 0 ? 'pos' : 'neg'}`}>
            {totalHours > 0 ? fmt(perHour) : '—'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Winning sessions</span>
          <span className="stat-value">{wins}/{data.length}</span>
        </div>
      </div>

      <div className="section-hdr" style={{ marginBottom: 10 }}>
        <span className="section-label">All sessions</span>
      </div>

      {data.length === 0 ? (
        <EmptyState icon="ti-cards" text="No poker sessions yet — tap + to log one" />
      ) : (
        data.map((session) => (
          <PokerCard key={session.id} session={session} onDelete={onDelete} />
        ))
      )}
    </div>
  );
}
