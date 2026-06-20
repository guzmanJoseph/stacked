import React, { useState, useMemo } from 'react';
import './Calendar.css';
import { buildDailyMap, fmt } from '../utils/calc';
import { BetCard, PokerCard } from '../components/EntryCard';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Calendar({ bets, poker }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const dailyMap = useMemo(() => buildDailyMap(bets, poker), [bets, poker]);

  const todayStr = now.toISOString().split('T')[0];

  function changeMonth(dir) {
    let m = month + dir;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
    setSelectedDate(null);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Monthly P&L
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthPnl = Object.entries(dailyMap)
    .filter(([d]) => d.startsWith(monthStr))
    .reduce((a, [, v]) => a + v, 0);

  // Day detail
  const dayBets = selectedDate ? bets.filter((b) => b.date === selectedDate) : [];
  const dayPoker = selectedDate ? poker.filter((p) => p.date === selectedDate) : [];
  const dayPnl = selectedDate ? (dailyMap[selectedDate] || 0) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Calendar</h2>
        <span className={`badge ${monthPnl >= 0 ? 'badge-green' : 'badge-red'}`}>
          {MONTH_NAMES[month].slice(0, 3)} {fmt(monthPnl)}
        </span>
      </div>

      {/* Month navigation */}
      <div className="month-nav">
        <button className="month-arrow" onClick={() => changeMonth(-1)} aria-label="Previous month">
          <i className="ti ti-chevron-left" aria-hidden="true" />
        </button>
        <span className="month-name">{MONTH_NAMES[month]} {year}</span>
        <button className="month-arrow" onClick={() => changeMonth(1)} aria-label="Next month">
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="cal-grid">
        {DAY_LABELS.map((l, i) => (
          <div key={i} className="cal-dow">{l}</div>
        ))}

        {/* Empty leading cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={'e' + i} className="cal-cell empty" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const pnl = dailyMap[ds];
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDate;
          const hasActivity = pnl !== undefined;

          let cellCls = 'cal-cell';
          if (isToday) cellCls += ' today';
          if (isSelected) cellCls += ' selected';
          if (hasActivity) cellCls += pnl >= 0 ? ' has-pos' : ' has-neg';

          return (
            <button
              key={d}
              className={cellCls}
              onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
              aria-label={`${ds}${hasActivity ? ', ' + fmt(pnl) : ''}`}
            >
              <span className="cal-num">{d}</span>
              {hasActivity && (
                <span className={`cal-pnl ${pnl >= 0 ? 'pos' : 'neg'}`}>
                  {pnl >= 0 ? '+' : ''}{Math.round(pnl)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day detail */}
      {selectedDate && (
        <div className="day-detail">
          <div className="section-hdr">
            <span className="section-label">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              })}
            </span>
            {(dayBets.length > 0 || dayPoker.length > 0) && (
              <span className={`badge ${dayPnl >= 0 ? 'badge-green' : 'badge-red'}`}>{fmt(dayPnl)}</span>
            )}
          </div>
          {dayBets.length === 0 && dayPoker.length === 0 ? (
            <p className="day-empty">No activity on this day.</p>
          ) : (
            <>
              {dayBets.map((b) => <BetCard key={b.id} bet={b} compact />)}
              {dayPoker.map((p) => <PokerCard key={p.id} session={p} compact />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
