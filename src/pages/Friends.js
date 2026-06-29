import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

export default function Friends({ user }) {
  const [friendId, setFriendId] = useState('');

  const sendFriendRequest = async () => {
    if (!friendId.trim()) return;

    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      receiver_id: friendId.trim(),
      status: 'pending',
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert('Friend request sent!');
    setFriendId('');
  };

  return (
    <div className="page">
      <div className="section-hdr">
        <span className="section-label">Friends</span>
      </div>

      <div className="stat-card">
        <span className="stat-label">Add Friend</span>

        <input
          className="form-input"
          placeholder="Enter friend user ID"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
        />

        <button className="submit-btn" onClick={sendFriendRequest}>
          Send Request
        </button>
      </div>
    </div>
  );
}