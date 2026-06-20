import React from 'react';
import './EntryCard.css';
import { fmt } from '../utils/calc';

export function BetCard({ bet, onDelete, onUpdateResult, compact = false }) {
  const cls = bet.result === 'won' ? 'pos' : bet.result === 'lost' ? 'neg' : 'pending';
  const pillCls = bet.result === 'won' ? 'pill-green' : bet.result === 'lost' ? 'pill-red' : bet.result === 'push' ? 'pill-blue' : 'pill-gold';
  const display = bet.result === 'pending' ? 'Pending' : bet.result === 'push' ? 'Push' : fmt(bet.pnl);

  return (
    <div className="entry-card">
      <div className="entry-left">
        <span className="entry-name">{bet.desc}</span>
        <span className="entry-sub">
          {bet.book} · {bet.sport} · ${bet.stake} @ {bet.odds}
          {!compact && <> · {bet.date}</>}
        </span>
      </div>
      <div className="entry-right">
        <span className={`entry-amount ${cls}`}>{display}</span>
        <span className={`pill ${pillCls}`}>{bet.result}</span>
      </div>
      {!compact && onDelete && (
        <div className="entry-actions">
          {bet.result === 'pending' && onUpdateResult && (
            <>
              <button className="action-btn action-won" onClick={() => onUpdateResult(bet.id, 'won')} title="Mark won">
                <i className="ti ti-check" aria-hidden="true" />
              </button>
              <button className="action-btn action-lost" onClick={() => onUpdateResult(bet.id, 'lost')} title="Mark lost">
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </>
          )}
          <button className="action-btn action-delete" onClick={() => onDelete(bet.id)} aria-label="Delete bet">
            <i className="ti ti-trash" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export function PokerCard({ session, onDelete, compact = false }) {
  const cls = session.pnl >= 0 ? 'pos' : 'neg';
  const pillCls = session.pnl >= 0 ? 'pill-green' : 'pill-red';

  return (
    <div className="entry-card">
      <div className="entry-left">
        <span className="entry-name">{session.opp}</span>
        <span className="entry-sub">
          Buy-in ${session.buyin} → Cash-out ${session.cashout}
          {session.hours ? ` · ${session.hours}h` : ''}
          {!compact && <> · {session.date}</>}
        </span>
      </div>
      <div className="entry-right">
        <span className={`entry-amount ${cls}`}>{fmt(session.pnl)}</span>
        <span className={`pill ${pillCls}`}>poker</span>
      </div>
      {!compact && onDelete && (
        <div className="entry-actions">
          <button className="action-btn action-delete" onClick={() => onDelete(session.id)} aria-label="Delete session">
            <i className="ti ti-trash" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
