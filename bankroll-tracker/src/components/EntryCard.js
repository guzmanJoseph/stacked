import React from 'react';
import './EntryCard.css';
import { fmt } from '../utils/calc';

export function BetCard({
  bet,
  onDelete,
  onUpdateResult,
  onEdit,
  compact = false,
}) {
  const cls =
    bet.result === 'won'
      ? 'pos'
      : bet.result === 'lost'
      ? 'neg'
      : bet.result === 'cashed_out'
      ? bet.pnl >= 0
        ? 'pos'
        : 'neg'
      : 'pending';

  const pillCls =
    bet.result === 'won'
      ? 'pill-green'
      : bet.result === 'lost'
      ? 'pill-red'
      : bet.result === 'push'
      ? 'pill-blue'
      : bet.result === 'cashed_out'
      ? 'pill-purple'
      : 'pill-gold';

  const display =
    bet.result === 'pending'
      ? 'Pending'
      : bet.result === 'push'
      ? 'Push'
      : fmt(bet.pnl);

  const handleCashout = () => {
    const amount = prompt('Cash out amount?');

    if (!amount) return;

    onUpdateResult(
      bet.id,
      'cashed_out',
      Number(amount)
    );
  };

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
        <span className={`entry-amount ${cls}`}>
          {display}
        </span>

        <span className={`pill ${pillCls}`}>
          {bet.result === 'cashed_out'
            ? 'cashed out'
            : bet.result}
        </span>
      </div>

      {!compact && (
        <div className="entry-actions">

          {bet.result === 'pending' && (
            <>
              <button
                className="action-btn action-won"
                onClick={() =>
                  onUpdateResult(bet.id, 'won')
                }
                title="Won"
              >
                <i className="ti ti-check" />
              </button>

              <button
                className="action-btn action-lost"
                onClick={() =>
                  onUpdateResult(bet.id, 'lost')
                }
                title="Lost"
              >
                <i className="ti ti-x" />
              </button>

              <button
                className="action-btn"
                onClick={() =>
                  onUpdateResult(bet.id, 'push')
                }
                title="Push"
              >
                ↔️
              </button>

              <button
                className="action-btn"
                onClick={handleCashout}
                title="Cash Out"
              >
                💵
              </button>
            </>
          )}

          {onEdit && (
            <button
              className="action-btn"
              onClick={() => onEdit(bet)}
              title="Edit"
            >
              <i className="ti ti-pencil" />
            </button>
          )}

          <button
            className="action-btn action-delete"
            onClick={() => onDelete(bet.id)}
            title="Delete"
          >
            <i className="ti ti-trash" />
          </button>
        </div>
      )}
    </div>
  );
}

export function PokerCard({
  session,
  onDelete,
  onEdit,
  compact = false,
}) {
  const cls = session.pnl >= 0 ? 'pos' : 'neg';
  const pillCls =
    session.pnl >= 0
      ? 'pill-green'
      : 'pill-red';

  return (
    <div className="entry-card">
      <div className="entry-left">
        <span className="entry-name">
          {session.opp}
        </span>

        <span className="entry-sub">
          Buy-in ${session.buyin}
          {' → '}
          Cash-out ${session.cashout}

          {session.hours
            ? ` · ${session.hours}h`
            : ''}

          {!compact && <> · {session.date}</>}
        </span>
      </div>

      <div className="entry-right">
        <span className={`entry-amount ${cls}`}>
          {fmt(session.pnl)}
        </span>

        <span className={`pill ${pillCls}`}>
          poker
        </span>
      </div>

      {!compact && (
        <div className="entry-actions">
          {onEdit && (
            <button
              className="action-btn"
              onClick={() => onEdit(session)}
              title="Edit session"
            >
              ✏️
            </button>
          )}

          <button
            className="action-btn action-delete"
            onClick={() => onDelete(session.id)}
            title="Delete"
          >
            <i className="ti ti-trash" />
          </button>
        </div>
      )}
    </div>
  );
}