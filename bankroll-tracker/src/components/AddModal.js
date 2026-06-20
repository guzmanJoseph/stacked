import React, { useState } from 'react';
import './AddModal.css';
import { today } from '../utils/calc';

const BOOKS = ['DraftKings', 'FanDuel', 'BetMGM', 'ESPNBet', 'Caesars', 'Other'];
const SPORTS = ['🏀 NBA', '🏈 NFL', '⚾ MLB', '🏒 NHL', '⚽ Soccer', '🎾 Tennis', '🏌️ Golf', '🥊 MMA', 'Other'];
const RESULTS = ['pending', 'won', 'lost', 'push'];

export default function AddModal({ onSubmit, onClose }) {
  const [type, setType] = useState('bet');

  // Bet fields
  const [book, setBook] = useState('DraftKings');
  const [desc, setDesc] = useState('');
  const [stake, setStake] = useState('');
  const [odds, setOdds] = useState('');
  const [sport, setSport] = useState('🏀 NBA');
  const [result, setResult] = useState('pending');

  // Poker fields
  const [opp, setOpp] = useState('');
  const [buyin, setBuyin] = useState('');
  const [cashout, setCashout] = useState('');
  const [hours, setHours] = useState('');

  const [date, setDate] = useState(today());

  const handleSubmit = () => {
    if (type === 'bet') {
      if (!desc.trim() || !stake) return;
      onSubmit({ type: 'bet', book, desc: desc.trim(), stake, odds, sport, result, date });
    } else {
      if (!buyin || !cashout) return;
      onSubmit({ type: 'poker', opp: opp.trim() || 'Poker session', buyin, cashout, hours, date });
    }
  };

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add entry">
        <div className="modal-handle" />
        <h2 className="modal-title">Add entry</h2>

        {/* Type toggle */}
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
                <input className="form-input" type="number" placeholder="50" value={stake} onChange={(e) => setStake(e.target.value)} />
              </Field>
              <Field label="Odds">
                <input className="form-input" type="text" placeholder="-110" value={odds} onChange={(e) => setOdds(e.target.value)} />
              </Field>
            </div>
            <Field label="Sport">
              <SegPicker options={SPORTS} value={sport} onChange={setSport} />
            </Field>
            <Field label="Result">
              <SegPicker options={RESULTS} value={result} onChange={setResult} capitalize />
            </Field>
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

function SegPicker({ options, value, onChange, capitalize }) {
  return (
    <div className="seg-picker">
      {options.map((o) => (
        <button
          key={o}
          className={`seg-btn${value === o ? ' active' : ''}`}
          onClick={() => onChange(o)}
          type="button"
        >
          {capitalize ? o.charAt(0).toUpperCase() + o.slice(1) : o}
        </button>
      ))}
    </div>
  );
}
