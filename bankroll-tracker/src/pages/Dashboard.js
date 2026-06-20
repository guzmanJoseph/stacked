import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import './Dashboard.css';
import { fmt, buildDailyMap } from '../utils/calc';
import { BetCard, PokerCard } from '../components/EntryCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function Dashboard({ data, stats }) {
  const s = stats();

  // Build 14-day chart data
  const { labels, values } = useMemo(() => {
    const dailyMap = buildDailyMap(data.bets, data.poker);
    const labels = [], values = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      labels.push(d.getDate().toString());
      values.push(Math.round((dailyMap[ds] || 0) * 100) / 100);
    }
    return { labels, values };
  }, [data]);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: values.map((v) => (v >= 0 ? 'rgba(0,214,122,0.75)' : 'rgba(255,77,109,0.75)')),
        borderRadius: 5,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => (ctx.raw >= 0 ? '+' : '') + '$' + ctx.raw.toFixed(2) },
        backgroundColor: '#1e1e28',
        titleColor: '#f0efe8',
        bodyColor: '#8888a0',
        borderColor: '#2e2e3e',
        borderWidth: 1,
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8888a0', font: { size: 10 } } },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8888a0', font: { size: 10 }, callback: (v) => '$' + v },
      },
    },
  };

  // Recent entries combined and sorted
  const recent = [
    ...data.bets.slice(0, 5).map((b) => ({ ...b, _type: 'bet' })),
    ...data.poker.slice(0, 3).map((p) => ({ ...p, _type: 'poker' })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <p className="dash-label">All-time bankroll</p>
          <p className={`dash-total ${s.total >= 0 ? 'pos' : 'neg'}`}>{fmt(s.total)}</p>
        </div>
        <span className={`badge ${s.total >= 0 ? 'badge-green' : 'badge-red'}`}>
          {s.total >= 0 ? '↑' : '↓'} This month {fmt(s.monthTotal)}
        </span>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard label="Bets P&L" value={fmt(s.betPnl)} positive={s.betPnl >= 0} />
        <StatCard label="Poker P&L" value={fmt(s.pokerPnl)} positive={s.pokerPnl >= 0} />
        <StatCard label="Win rate" value={s.winPct + '%'} />
        <StatCard label="Bets won" value={`${s.wonCount}/${s.settledCount}`} />
      </div>

      {/* Chart */}
      <div className="section-hdr">
        <span className="section-label">Daily P&L — last 14 days</span>
      </div>
      <div className="chart-card">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Recent */}
      <div className="section-hdr">
        <span className="section-label">Recent activity</span>
      </div>
      {recent.length === 0 ? (
        <EmptyState icon="ti-chart-line" text="No entries yet — tap + to add one" />
      ) : (
        recent.map((e) =>
          e._type === 'bet' ? (
            <BetCard key={'b' + e.id} bet={e} compact />
          ) : (
            <PokerCard key={'p' + e.id} session={e} compact />
          )
        )
      )}
    </div>
  );
}

function StatCard({ label, value, positive }) {
  const cls = positive === undefined ? '' : positive ? 'pos' : 'neg';
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${cls}`}>{value}</span>
    </div>
  );
}

export function EmptyState({ icon, text }) {
  return (
    <div className="empty-state">
      <i className={`ti ${icon}`} aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}
