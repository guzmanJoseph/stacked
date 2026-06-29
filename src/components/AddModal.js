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
  const [groups, setGroups] = useState([]);

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