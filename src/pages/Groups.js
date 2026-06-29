import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

export default function Groups({ user }) {
  const [groupName, setGroupName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [groups, setGroups] = useState([]);

  const loadGroups = async () => {
    const { data, error } = await supabase
      .from('group_members')
      .select('group_id, role, groups(id, name, owner_id, created_at)')
      .eq('user_id', user.id);

    if (!error) setGroups(data || []);
  };

  useEffect(() => {
    if (user?.id) loadGroups();
  }, [user]);

  const createGroup = async () => {
    if (!groupName.trim()) return;

    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: groupName.trim(),
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) return alert(error.message);

    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: data.id,
        user_id: user.id,
        role: 'owner',
      });

    if (memberError) return alert(memberError.message);

    setGroupName('');
    await loadGroups();
  };

  const joinGroup = async () => {
    if (!joinGroupId.trim()) return;

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: joinGroupId.trim(),
        user_id: user.id,
        role: 'member',
      });

    if (error) return alert(error.message);

    setJoinGroupId('');
    await loadGroups();
  };

  const copyGroupId = async (id) => {
    await navigator.clipboard.writeText(id);
    alert('Group code copied!');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Groups</h2>
          <p className="page-subtitle">
            Create a poker crew, share the group code, and compete together.
          </p>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-label">Create Group</span>

        <input
          className="form-input"
          placeholder="e.g. Hard Rock Crew"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <button className="submit-btn" onClick={createGroup} type="button">
          Create Group
        </button>
      </div>

      <div className="stat-card">
        <span className="stat-label">Join Group</span>

        <input
          className="form-input"
          placeholder="Paste group code"
          value={joinGroupId}
          onChange={(e) => setJoinGroupId(e.target.value)}
        />

        <button className="submit-btn" onClick={joinGroup} type="button">
          Join Group
        </button>
      </div>

      <div className="section-hdr">
        <span className="section-label">My Groups</span>
      </div>

      {groups.length === 0 ? (
        <p className="day-empty">You are not in any groups yet.</p>
      ) : (
        groups.map((item) => (
          <div className="entry-card" key={item.group_id}>
            <div className="entry-left">
              <span className="entry-name">
                {item.groups?.name || 'Unnamed Group'}
              </span>

              <span className="entry-sub">
                Role: {item.role} · Code: {item.group_id.slice(0, 8)}...
              </span>
            </div>

            <div className="entry-actions">
              <button
                className="action-btn"
                onClick={() => copyGroupId(item.group_id)}
                title="Copy group code"
                type="button"
              >
                <i className="ti ti-copy" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}