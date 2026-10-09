import React, { useEffect, useState } from 'react';
import './AddModal.css';
import { today } from '../utils/calc';
import { supabase } from '../supabaseClient';

export default function AddModal({ user, onSubmit, onClose, initialBet }) {
  const [opp, setOpp] = useState(initialBet?.opp || '');
  const [buyin, setBuyin] = useState(initialBet?.buyin || '');
  const [cashout, setCashout] = useState(initialBet?.cashout || '');
  const [hours, setHours] = useState(initialBet?.hours || '');
  const [date, setDate] = useState(initialBet?.date || today());
  const [groupId, setGroupId] = useState(initialBet?.group_id || '');
  const [smallBlind, setSmallBlind] = useState(initialBet?.small_blind || '');
  const [bigBlind, setBigBlind] = useState(initialBet?.big_blind || '');
  const [groups, setGroups] = useState([]);

  const STAKES_PRESETS = [
    { label: '0.10/0.25', sb: 0.10, bb: 0.25 },
    { label: '0.25/0.50', sb: 0.25, bb: 0.50 },
    { label: '1/2', sb: 1, bb: 2 },
    { label: '1/3', sb: 1, bb: 3 },
    { label: '2/5', sb: 2, bb: 5 },
    { label: '5/10', sb: 5, bb: 10 },
  ];

  useEffect(() => {
    async function loadGroups() {
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id, groups(id, name)')
        .eq('user_id', user.id);

      if (!error) setGroups(data || []);
    }

    if (user?.id) loadGroups();
  }, [user]);

  const handleSubmit = () => {
    if (!buyin || !cashout) return;

    onSubmit({
      type: 'poker',
      opp: opp.trim() || 'Poker session',
      buyin: Number(buyin),
      cashout: Number(cashout),
      hours: hours ? Number(hours) : null,
      date,
      group_id: groupId || null,
      small_blind: smallBlind || null,
      big_blind: bigBlind || null,
    });
  };

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add poker session">
        <div className="modal-handle" />
        <h2 className="modal-title">Add poker session</h2>

        <Field label="Notes / opponent">
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Friday night with the guys"
            value={opp}
            onChange={(e) => setOpp(e.target.value)}
          />
        </Field>

        <Field label="Group">
          <select
            className="form-input group-select"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          >
            <option value="">Personal session</option>
            {groups.map((item) => (
              <option key={item.group_id} value={item.group_id}>
                {item.groups?.name || 'Unnamed group'}
              </option>
            ))}
          </select>
        </Field>

        <div className="row-fields">
          <Field label="Buy-in ($)">
            <input className="form-input" type="number" step="0.01" value={buyin} onChange={(e) => setBuyin(e.target.value)} />
          </Field>

          <Field label="Cash-out ($)">
            <input className="form-input" type="number" step="0.01" value={cashout} onChange={(e) => setCashout(e.target.value)} />
          </Field>
        </div>

        <Field label="Blinds (SB / BB)">
          <div className="stakes-presets">
            {STAKES_PRESETS.map((preset) => {
              const active =
                Number(smallBlind) === preset.sb &&
                Number(bigBlind) === preset.bb;
              return (
                <button
                  key={preset.label}
                  type="button"
                  className={`stakes-chip${active ? ' active' : ''}`}
                  onClick={() => {
                    setSmallBlind(preset.sb);
                    setBigBlind(preset.bb);
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="row-fields">
            <input
              className="form-input"
              type="number"
              step="0.05"
              min="0"
              placeholder="Small blind"
              value={smallBlind}
              onChange={(e) => setSmallBlind(e.target.value)}
            />
            <input
              className="form-input"
              type="number"
              step="0.05"
              min="0"
              placeholder="Big blind"
              value={bigBlind}
              onChange={(e) => setBigBlind(e.target.value)}
            />
          </div>
        </Field>

        <Field label="Hours played">
          <input className="form-input" type="number" step="0.1" value={hours} onChange={(e) => setHours(e.target.value)} />
        </Field>

        <Field label="Date">
          <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <button className="submit-btn" onClick={handleSubmit}>Save session</button>
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