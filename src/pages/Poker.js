import React from 'react';
import './Poker.css';
import PokerCard from '../components/EntryCard';
import { EmptyState } from './Dashboard';

export default function Poker({ data, onDelete, onEdit }) {
  const sessions = [...data].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Sessions</h2>
          <p className="page-subtitle">
            View, edit, and manage your poker sessions.
          </p>
        </div>
      </div>

      <div className="section-hdr">
        <span className="section-label">All Sessions</span>
      </div>

      {sessions.length === 0 ? (
        <EmptyState icon="ti-cards" text="No sessions yet — tap + to add one" />
      ) : (
        sessions.map((session) => (
          <PokerCard
            key={session.id}
            session={session}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))
      )}
    </div>
  );
}