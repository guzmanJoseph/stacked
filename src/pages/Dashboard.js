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
import PokerCard from '../components/EntryCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function Dashboard({ data }) {
  const poker = useMemo(() => data.poker || [], [data.poker]);
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const totalPnl = poker.reduce((sum, p) => sum + Number(p.pnl || 0), 0);

  const monthPnl = poker
    .filter((p) => p.date?.startsWith(currentMonth))
    .reduce((sum, p) => sum + Number(p.pnl || 0), 0);

  const totalBuyins = poker.reduce((sum, p) => sum + Number(p.buyin || 0), 0);

  const totalHours = poker.reduce((sum, p) => sum + Number(p.hours || 0), 0);

  const winningSessions = poker.filter((p) => Number(p.pnl || 0) > 0).length;

  const winRate = poker.length
    ? Math.round((winningSessions / poker.length) * 100)
    : 0;

  const roi = totalBuyins
    ? ((totalPnl / totalBuyins) * 100).toFixed(1)
    : '0.0';

  const hourlyRate = totalHours ? totalPnl / totalHours : 0;

  const avgSession = poker.length ? totalPnl / poker.length : 0;

  const biggestWin = [...poker]
    .filter((p) => Number(p.pnl || 0) > 0)
    .sort((a, b) => Number(b.pnl || 0) - Number(a.pnl || 0))[0];

  const biggestLoss = [...poker]
    .filter((p) => Number(p.pnl || 0) < 0)
    .sort((a, b) => Number(a.pnl || 0) - Number(b.pnl || 0))[0];

  const { labels, values } = useMemo(() => {
    const dailyMap = buildDailyMap(poker);
    const labels = [];
    const values = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];

      labels.push(d.getDate().toString());
      values.push(Math.round((dailyMap[ds] || 0) * 100) / 100);
    }

    return { labels, values };
  }, [poker]);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: values.map((v) =>
          v >= 0 ? 'rgba(34,197,94,0.85)' : 'rgba(239,68,68,0.85)'
        ),
        borderRadius: 8,
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
        callbacks: {
          label: (ctx) =>
            (ctx.raw >= 0 ? '+' : '') + '$' + Number(ctx.raw).toFixed(2),
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(148,163,184,0.08)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.08)' },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          callback: (v) => '$' + v,
        },
      },
    },
  };

  const recent = [...poker]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="page dashboard-page">
      <div className="dash-hero">
        <div>
          <p className="dash-label">Poker Performance</p>
          <p className={`dash-total ${totalPnl >= 0 ? 'pos' : 'neg'}`}>
            {fmt(totalPnl)}
          </p>
          <p className="dash-subtext">
            {poker.length} sessions · {totalHours.toFixed(1)} hours tracked
          </p>
        </div>

        <div className={`month-chip ${monthPnl >= 0 ? 'good' : 'bad'}`}>
          <span>This Month</span>
          <strong>{fmt(monthPnl)}</strong>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Sessions" value={poker.length} />
        <StatCard label="Win Rate" value={`${winRate}%`} />
        <StatCard label="Hourly" value={fmt(hourlyRate)} positive={hourlyRate >= 0} />
        <StatCard label="Avg Session" value={fmt(avgSession)} positive={avgSession >= 0} />
        <StatCard label="Total Buy-ins" value={fmt(totalBuyins)} />
        <StatCard label="ROI" value={`${roi}%`} positive={Number(roi) >= 0} />
      </div>

      <div className="section-hdr">
        <span className="section-label">Daily P&L — Last 14 Days</span>
      </div>

      <div className="chart-card">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="insight-grid">
        <InsightCard
          title="Biggest Win"
          value={biggestWin ? fmt(biggestWin.pnl) : '$0.00'}
          subtitle={biggestWin ? biggestWin.opp : 'No winning sessions yet'}
          positive
        />

        <InsightCard
          title="Biggest Loss"
          value={biggestLoss ? fmt(biggestLoss.pnl) : '$0.00'}
          subtitle={biggestLoss ? biggestLoss.opp : 'No losing sessions yet'}
          positive={false}
        />
      </div>

      <div className="section-hdr">
        <span className="section-label">Recent Sessions</span>
      </div>

      {recent.length === 0 ? (
        <EmptyState icon="ti-cards" text="No sessions yet — tap + to add one" />
      ) : (
        recent.map((session) => (
          <PokerCard key={session.id} session={session} compact />
        ))
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

function InsightCard({ title, value, subtitle, positive }) {
  return (
    <div className="insight-card">
      <span className="insight-title">{title}</span>
      <span className={`insight-value ${positive ? 'pos' : 'neg'}`}>
        {value}
      </span>
      <span className="insight-subtitle">{subtitle}</span>
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