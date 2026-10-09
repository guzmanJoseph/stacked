import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';

import './Dashboard.css';
import { fmt } from '../utils/calc';
import PokerCard from '../components/EntryCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export default function Dashboard({ data }) {
  const [timeRange, setTimeRange] = useState('ALL');

  const poker = useMemo(() => data.poker || [], [data.poker]);

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  // -----------------------
  // BASIC STATS
  // -----------------------

  const totalPnl = poker.reduce(
    (sum, p) => sum + Number(p.pnl || 0),
    0
  );

  const monthPnl = poker
    .filter((p) => p.date?.startsWith(currentMonth))
    .reduce((sum, p) => sum + Number(p.pnl || 0), 0);

  const totalBuyins = poker.reduce(
    (sum, p) => sum + Number(p.buyin || 0),
    0
  );

  const totalHours = poker.reduce(
    (sum, p) => sum + Number(p.hours || 0),
    0
  );

  const winningSessions = poker.filter(
    (p) => Number(p.pnl || 0) > 0
  ).length;

  const winRate = poker.length
    ? Math.round((winningSessions / poker.length) * 100)
    : 0;

  const roi = totalBuyins
    ? ((totalPnl / totalBuyins) * 100).toFixed(1)
    : '0.0';

  const hourlyRate = totalHours
    ? totalPnl / totalHours
    : 0;

  const avgSession = poker.length
    ? totalPnl / poker.length
    : 0;

  // -----------------------
  // BIGGEST WIN / LOSS
  // -----------------------

  const biggestWin = [...poker]
    .filter((p) => Number(p.pnl || 0) > 0)
    .sort(
      (a, b) =>
        Number(b.pnl || 0) - Number(a.pnl || 0)
    )[0];

  const biggestLoss = [...poker]
    .filter((p) => Number(p.pnl || 0) < 0)
    .sort(
      (a, b) =>
        Number(a.pnl || 0) - Number(b.pnl || 0)
    )[0];

  // -----------------------
  // PROFIT PROGRESS GRAPH
  // -----------------------

  const progressData = useMemo(() => {
    // Sort oldest -> newest
    const sorted = [...poker].sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    const today = new Date();

    let startDate = null;

    if (timeRange === '1M') {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 1);
    }

    if (timeRange === '3M') {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 3);
    }

    if (timeRange === '6M') {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 6);
    }

    const filtered = startDate
      ? sorted.filter(
          (session) =>
            new Date(session.date) >= startDate
        )
      : sorted;

    let runningTotal = 0;

    const points = filtered.map((session) => {
      runningTotal += Number(session.pnl || 0);

      return {
        date: session.date,
        value: Math.round(runningTotal * 100) / 100,
      };
    });

    return points;
  }, [poker, timeRange]);

  const chartLabels = [
    'Start',
    ...progressData.map((point) => {
      const date = new Date(
        `${point.date}T00:00:00`
      );

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }),
  ];

  const chartValues = [
    0,
    ...progressData.map((point) => point.value),
  ];

  const endingValue =
    chartValues[chartValues.length - 1] || 0;

  const lineColor = '#0d0d0d';

  const fillColor =
    endingValue >= 0
      ? 'rgba(182, 255, 26, 0.75)'
      : 'rgba(255, 46, 136, 0.7)';

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        borderColor: lineColor,
        backgroundColor: fillColor,
        fill: true,

        borderWidth: 4,
        tension: 0.25,

        pointRadius: 5,
        pointHoverRadius: 9,

        pointBackgroundColor: '#ffcf1f',
        pointBorderColor: '#0d0d0d',
        pointBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      intersect: false,
      mode: 'index',
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        displayColors: false,
        backgroundColor: '#ff2e88',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#0d0d0d',
        borderWidth: 3,
        cornerRadius: 10,
        padding: 12,
        titleFont: { weight: '900' },
        bodyFont: { weight: '800' },

        callbacks: {
          title: (items) => {
            if (items[0]?.dataIndex === 0) {
              return 'Starting Point';
            }

            const point =
              progressData[items[0].dataIndex - 1];

            if (!point) return '';

            const date = new Date(
              `${point.date}T00:00:00`
            );

            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          },

          label: (ctx) => {
            const value = Number(ctx.raw);

            return `Total P&L: ${
              value >= 0 ? '+' : '-'
            }$${Math.abs(value).toFixed(2)}`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        border: {
          display: false,
        },

        ticks: {
          color: '#0d0d0d',
          font: {
            size: 11,
            weight: '800',
          },

          maxTicksLimit: 6,
          maxRotation: 0,
        },
      },

      y: {
        grid: {
          color: 'rgba(13, 13, 13, 0.18)',
          lineWidth: 2,
        },

        border: {
          display: false,
        },

        ticks: {
          color: '#0d0d0d',

          font: {
            size: 11,
            weight: '800',
          },

          callback: (value) => {
            const number = Number(value);

            return `${
              number < 0 ? '-' : ''
            }$${Math.abs(number)}`;
          },
        },
      },
    },
  };

  // -----------------------
  // RECENT SESSIONS
  // -----------------------

  // -----------------------
  // STAKES BREAKDOWN
  // -----------------------

  const stakesStats = useMemo(() => {
    const byLevel = new Map();

    poker.forEach((p) => {
      if (!p.big_blind) return;

      const key = `${p.small_blind || 0}/${p.big_blind}`;

      if (!byLevel.has(key)) {
        byLevel.set(key, {
          key,
          sb: Number(p.small_blind || 0),
          bb: Number(p.big_blind),
          sessions: 0,
          net: 0,
          wins: 0,
          hours: 0,
        });
      }

      const level = byLevel.get(key);
      const pnl = Number(p.pnl || 0);

      level.sessions += 1;
      level.net += pnl;
      level.hours += Number(p.hours || 0);
      if (pnl > 0) level.wins += 1;
    });

    return [...byLevel.values()].sort((a, b) => a.bb - b.bb);
  }, [poker]);

  const recent = [...poker]
    .sort((a, b) =>
      (b.date || '').localeCompare(a.date || '')
    )
    .slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dash-hero">
        <div className="dash-main">
          <span className="dash-label">Poker Performance</span>

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
        <StatCard
          label="Sessions"
          value={poker.length}
        />

        <StatCard
          label="Win Rate"
          value={`${winRate}%`}
        />

        <StatCard
          label="Hourly"
          value={fmt(hourlyRate)}
          positive={hourlyRate >= 0}
        />

        <StatCard
          label="Avg Session"
          value={fmt(avgSession)}
          positive={avgSession >= 0}
        />

        <StatCard
          label="Total Buy-ins"
          value={fmt(totalBuyins)}
        />

        <StatCard
          label="ROI"
          value={`${roi}%`}
          positive={Number(roi) >= 0}
        />
      </div>

      {/* PROFIT GRAPH */}

      <div className="chart-section-header">
        <div>
          <span className="section-label">
            Profit Over Time
          </span>

          <p className="chart-description">
            Your cumulative poker P&amp;L
          </p>
        </div>

        <div className="range-selector">
          {['1M', '3M', '6M', 'ALL'].map(
            (range) => (
              <button
                key={range}
                type="button"
                className={`range-button ${
                  timeRange === range
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setTimeRange(range)
                }
              >
                {range}
              </button>
            )
          )}
        </div>
      </div>

      <div className="chart-card progress-chart-card">
        {poker.length === 0 ? (
          <div className="chart-empty">
            Add your first session to start
            tracking your progress.
          </div>
        ) : (
          <Line
            data={chartData}
            options={chartOptions}
          />
        )}
      </div>

      <div className="insight-grid">
        <InsightCard
          title="Biggest Win"
          value={
            biggestWin
              ? fmt(biggestWin.pnl)
              : '$0.00'
          }
          subtitle={
            biggestWin
              ? biggestWin.opp
              : 'No winning sessions yet'
          }
          positive
        />

        <InsightCard
          title="Biggest Loss"
          value={
            biggestLoss
              ? fmt(biggestLoss.pnl)
              : '$0.00'
          }
          subtitle={
            biggestLoss
              ? biggestLoss.opp
              : 'No losing sessions yet'
          }
          positive={false}
        />
      </div>

      {stakesStats.length > 0 && (
        <>
          <div className="section-hdr">
            <span className="section-label">
              By Stakes
            </span>

            <span className="stakes-hint">
              BB · win rate · net
            </span>
          </div>

          <div className="stakes-breakdown">
            {stakesStats.map((level) => {
              const wr = level.sessions
                ? Math.round(
                    (level.wins / level.sessions) * 100
                  )
                : 0;

              return (
                <div
                  className="stakes-row"
                  key={level.key}
                >
                  <span className="stakes-level mono">
                    {level.key}
                  </span>

                  <span className="stakes-meta">
                    {level.sessions} sess
                    {level.hours
                      ? ` · ${level.hours.toFixed(1)}h`
                      : ''}
                  </span>

                  <span
                    className={`stakes-wr ${wr >= 50 ? 'pos' : 'neg'}`}
                  >
                    {wr}%
                  </span>

                  <span
                    className={`stakes-net ${level.net >= 0 ? 'pos' : 'neg'}`}
                  >
                    {fmt(level.net)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="section-hdr">
        <span className="section-label">
          Recent Sessions
        </span>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          icon="ti-cards"
          text="No sessions yet — tap + to add one"
        />
      ) : (
        recent.map((session) => (
          <PokerCard
            key={session.id}
            session={session}
            compact
          />
        ))
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  positive,
}) {
  const cls =
    positive === undefined
      ? ''
      : positive
      ? 'pos'
      : 'neg';

  return (
    <div className="stat-card">
      <span className="stat-label">
        {label}
      </span>

      <span
        className={`stat-value ${cls}`}
      >
        {value}
      </span>
    </div>
  );
}

function InsightCard({
  title,
  value,
  subtitle,
  positive,
}) {
  return (
    <div className="insight-card">
      <span className="insight-title">
        {title}
      </span>

      <span
        className={`insight-value ${
          positive ? 'pos' : 'neg'
        }`}
      >
        {value}
      </span>

      <span className="insight-subtitle">
        {subtitle}
      </span>
    </div>
  );
}

export function EmptyState({
  icon,
  text,
}) {
  return (
    <div className="empty-state">
      <i
        className={`ti ${icon}`}
        aria-hidden="true"
      />

      <span>{text}</span>
    </div>
  );
}