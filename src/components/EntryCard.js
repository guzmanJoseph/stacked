import React from 'react';
import './EntryCard.css';
import { fmt } from '../utils/calc';

export function PokerCard({
  session,
  onDelete,
  onEdit,
  compact = false,
}) {
  const pnl = Number(session.pnl || 0);
  const cls = pnl >= 0 ? 'pos' : 'neg';
  const pillCls = pnl >= 0 ? 'pill-green' : 'pill-red';

  return (
    <div className="entry-card">
      <div className="entry-left">
        <span className="entry-name">
          {session.opp || 'Poker session'}
        </span>

        <span className="entry-sub">
          Buy-in ${session.buyin}
          {' → '}
          Cash-out ${session.cashout}

          {session.hours ? ` · ${session.hours}h` : ''}

          {!compact && <> · {session.date}</>}
        </span>
      </div>

      <div className="entry-right">
        <span className={`entry-amount ${cls}`}>
          {fmt(pnl)}
        </span>

        <span className={`pill ${pillCls}`}>
          {pnl >= 0 ? 'win' : 'loss'}
        </span>
      </div>

      {!compact && (
        <div className="entry-actions">
          {onEdit && (
            <button
              className="action-btn"
              onClick={() => onEdit(session)}
              title="Edit session"
              type="button"
            >
              <i className="ti ti-pencil" />
            </button>
          )}

          <button
            className="action-btn action-delete"
            onClick={() => onDelete(session.id)}
            title="Delete"
            type="button"
          >
            <i className="ti ti-trash" />
          </button>
        </div>
      )}
    </div>
  );
}

export default PokerCard;