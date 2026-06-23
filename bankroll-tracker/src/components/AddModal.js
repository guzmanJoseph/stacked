import React, { useState } from 'react';
import './AddModal.css';
import { today } from '../utils/calc';

const BOOKS = ['Hard Rock Bet', 'Underdog', 'Kalshi', 'Chalkboard', 'Fliff', 'Other'];
const SPORTS = ['🏀 NBA', '🏈 NFL', '⚾ MLB', '🏒 NHL', '⚽ Soccer', '🎾 Tennis', '🏌️ Golf', '🥊 MMA', 'Other'];
const RESULTS = ['pending', 'won', 'lost', 'push', 'cashed_out'];

export default function AddModal({ onSubmit, onClose, initialBet }) {
  const [type, setType] = useState(initialBet?.type || 'bet');
  const [book, setBook] = useState(initialBet?.book || 'Hard Rock Bet');
  const [desc, setDesc] = useState(initialBet?.desc || '');
  const [stake, setStake] = useState(initialBet?.stake || '');
  const [odds, setOdds] = useState(initialBet?.odds || '');
  const [sport, setSport] = useState(initialBet?.sport || '⚽ Soccer');
  const [result, setResult] = useState(initialBet?.result || 'pending');
  const [cashoutAmount, setCashoutAmount] = useState(initialBet?.cashout_amount || '');

  const [opp, setOpp] = useState(initialBet?.opp || '');
  const [buyin, setBuyin] = useState(initialBet?.buyin || '');
  const [cashout, setCashout] = useState(initialBet?.cashout || '');
  const [hours, setHours] = useState(initialBet?.hours || '');

  const [date, setDate] = useState(initialBet?.date || today());

  const handleSubmit = () => {
    if (type === 'bet') {
      if (!desc.trim() || !stake) return;

      if (result === 'cashed_out' && !cashoutAmount) {
        alert('Enter the amount you cashed out for.');
        return;
      }

      onSubmit({
        type: 'bet',
        book,
        desc: desc.trim(),
        stake,
        odds,
        sport,
        result,
        date,
        cashout_amount: result === 'cashed_out' ? Number(cashoutAmount) : null,
        cashed_out: result === 'cashed_out',
      });
    } else {
      if (!buyin || !cashout) return;

      onSubmit({
        type: 'poker',
        opp: opp.trim() || 'Poker session',
        buyin,
        cashout,
        hours,
        date,
      });
    }
  };

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add entry">
        <div className="modal-handle" />
        <h2 className="modal-title">Add entry</h2>

        <div className="type-toggle" role="group" aria-label="Entry type">
          <button className={type === 'bet' ? 'active' : ''} onClick={() => setType('bet')}>
            <i className="ti ti-ticket" aria-hidden="true" /> Bet
          </button>
          <button className={type === 'poker' ? 'active' : ''} onClick={() => setType('poker')}>
            <i className="ti ti-cards" aria-hidden="true" /> Poker session
          </button>
        </div>

        {type === 'bet' ? (
          <>
            <Field label="Sportsbook">
              <SegPicker options={BOOKS} value={book} onChange={setBook} />
            </Field>

            <Field label="Bet description">
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Lakers -4.5 vs Celtics"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </Field>

            <div className="row-fields">
              <Field label="Stake ($)">
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  placeholder="50"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                />
              </Field>

              <Field label="Odds">
                <input
                  className="form-input"
                  type="text"
                  placeholder="-110"
                  value={odds}
                  onChange={(e) => setOdds(e.target.value)}
                />
              </Field>
            </div>

            <Field label="Sport">
              <SegPicker options={SPORTS} value={sport} onChange={setSport} />
            </Field>

            <Field label="Result">
              <SegPicker options={RESULTS} value={result} onChange={setResult} displayResult />
            </Field>

            {result === 'cashed_out' && (
              <Field label="Cash Out Amount ($)">
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  placeholder="Amount you received"
                  value={cashoutAmount}
                  onChange={(e) => setCashoutAmount(e.target.value)}
                />
              </Field>
            )}
          </>
        ) : (
          <>
            <Field label="Notes / opponent">
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Friday night with the guys"
                value={opp}
                onChange={(e) => setOpp(e.target.value)}
              />
            </Field>

            <div className="row-fields">
              <Field label="Buy-in ($)">
                <input className="form-input" type="number" placeholder="100" value={buyin} onChange={(e) => setBuyin(e.target.value)} />
              </Field>

              <Field label="Cash-out ($)">
                <input className="form-input" type="number" placeholder="150" value={cashout} onChange={(e) => setCashout(e.target.value)} />
              </Field>
            </div>

            <Field label="Hours played">
              <input className="form-input" type="number" placeholder="3" value={hours} onChange={(e) => setHours(e.target.value)} />
            </Field>
          </>
        )}

        <Field label="Date">
          <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <button className="submit-btn" onClick={handleSubmit}>Save entry</button>
        <button className="cancel-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function SegPicker({ options, value, onChange, displayResult }) {
  const label = (o) => {
    if (displayResult && o === 'cashed_out') return 'Cash Out Early';
    return o.charAt(0).toUpperCase() + o.slice(1);
  };

  return (
    <div className="seg-picker">
      {options.map((o) => (
        <button
          key={o}
          className={`seg-btn${value === o ? ' active' : ''}`}
          onClick={() => onChange(o)}
          type="button"
        >
          {label(o)}
        </button>
      ))}
    </div>
  );
}