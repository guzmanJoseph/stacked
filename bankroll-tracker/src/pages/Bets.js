import React, { useState } from 'react';
import './Bets.css';
import { BetCard } from '../components/EntryCard';
import { EmptyState } from './Dashboard';

const FILTERS = ['all', 'pending', 'won', 'lost', 'push', 'cashed-out'];

export default function Bets({ data, onDelete, onUpdateResult, onEdit }) {
  const [filter, setFilter] = useState('all');

  const visible = filter === 'all' ? data : data.filter((b) => b.result === filter);

  // Summary for active filter
  const pendingCount = data.filter((b) => b.result === 'pending').length;
  const pendingStake = data.filter((b) => b.result === 'pending').reduce((a, b) => a + b.stake, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Bets</h2>
        {pendingCount > 0 && (
          <span className="badge badge-gold">{pendingCount} pending · ${pendingStake} at risk</span>
        )}
      </div>

      <div className="filter-tabs" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-tab${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
            role="tab"
            aria-selected={filter === f}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="tab-count">{data.filter((b) => b.result === f).length}</span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="ti-ticket" text={`No ${filter === 'all' ? '' : filter + ' '}bets yet`} />
      ) : (
        visible.map((bet) => (
          <BetCard
            key={bet.id}
            bet={bet}
            onDelete={onDelete}
            onUpdateResult={onUpdateResult}
            onEdit={onEdit}
          />
        ))
      )}
    </div>
  );
}
