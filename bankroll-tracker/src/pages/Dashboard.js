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

  const settledBets = data.bets.filter((b) => b.result !== 'pending');
  const pendingBets = data.bets.filter((b) => b.result === 'pending');

  const pendingStake = pendingBets.reduce(
    (sum, b) => sum + Number(b.stake || 0),
    0
  );

  const totalWagered = data.bets.reduce(
    (sum, b) => sum + Number(b.stake || 0),
    0
  );

  const roi = totalWagered
    ? ((s.betPnl / totalWagered) * 100).toFixed(1)
    : '0.0';

  const biggestWin = settledBets
    .filter((b) => Number(b.pnl || 0) > 0)
    .sort((a, b) => Number(b.pnl || 0) - Number(a.pnl || 0))[0];

  const biggestLoss = settledBets
    .filter((b) => Number(b.pnl || 0) < 0)
    .sort((a, b) => Number(a.pnl || 0) - Number(b.pnl || 0))[0];

  const sportsbookBreakdown = useMemo(() => {
    const map = {};

    data.bets
      .filter((b) => b.result !== 'pending')
      .forEach((b) => {
        const book = b.book || 'Other';
        map[book] = (map[book] || 0) + Number(b.pnl || 0);
      });

    return Object.entries(map)
      .map(([book, pnl]) => ({ book, pnl }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [data.bets]);

  const { labels, values } = useMemo(() => {
    const dailyMap = buildDailyMap(data.bets, data.poker);
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
  }, [data]);

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
        backgroundColor: '#020617',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
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

  const recent = [
    ...data.bets.slice(0, 5).map((b) => ({ ...b, _type: 'bet' })),
    ...data.poker.slice(0, 3).map((p) => ({ ...p, _type: 'poker' })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="page dashboard-page">
      <div className="dash-hero">
        <div>
          <p className="dash-label">Total Performance</p>
          <p className={`dash-total ${s.total >= 0 ? 'pos' : 'neg'}`}>
            {fmt(s.total)}
          </p>
          <p className="dash-subtext">
            {data.bets.length} bets tracked · {data.poker.length} poker sessions
          </p>
        </div>

        <div className={`month-chip ${s.monthTotal >= 0 ? 'good' : 'bad'}`}>
          <span>This Month</span>
          <strong>{fmt(s.monthTotal)}</strong>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Bets P&L" value={fmt(s.betPnl)} positive={s.betPnl >= 0} />
        <StatCard label="Poker P&L" value={fmt(s.pokerPnl)} positive={s.pokerPnl >= 0} />
        <StatCard label="Win Rate" value={s.winPct + '%'} />
        <StatCard label="ROI" value={`${roi}%`} positive={Number(roi) >= 0} />
        <StatCard label="Pending Bets" value={pendingBets.length} />
        <StatCard label="At Risk" value={fmt(-pendingStake)} positive={false} />
      </div>

      <div className="section-hdr">
        <span className="section-label">Daily P&L — last 14 days</span>
      </div>

      <div className="chart-card">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="insight-grid">
        <InsightCard
          title="Biggest Win"
          value={biggestWin ? fmt(biggestWin.pnl) : '$0.00'}
          subtitle={biggestWin ? biggestWin.desc : 'No winning bets yet'}
          positive
        />

        <InsightCard
          title="Biggest Loss"
          value={biggestLoss ? fmt(biggestLoss.pnl) : '$0.00'}
          subtitle={biggestLoss ? biggestLoss.desc : 'No losing bets yet'}
          positive={false}
        />
      </div>

      <div className="section-hdr">
        <span className="section-label">Profit by Sportsbook</span>
      </div>

      <div className="sportsbook-card">
        {sportsbookBreakdown.length === 0 ? (
          <EmptyState icon="ti-building-bank" text="No settled sportsbook data yet" />
        ) : (
          sportsbookBreakdown.map((item) => (
            <div className="book-row" key={item.book}>
              <div>
                <span className="book-name">{item.book}</span>
                <span className="book-sub">Settled P&L</span>
              </div>

              <span className={`book-pnl ${item.pnl >= 0 ? 'pos' : 'neg'}`}>
                {fmt(item.pnl)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="section-hdr">
        <span className="section-label">Recent Activity</span>
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