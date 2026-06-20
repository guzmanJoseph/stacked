/**
 * Calculate P&L for a settled bet.
 * @param {number} stake
 * @param {string} odds  e.g. "-110" or "+150"
 * @param {string} result 'won' | 'lost' | 'push' | 'pending'
 * @returns {number}
 */
export function calcBetPnl(stake, odds, result) {
  const s = Number(stake);
  if (!s || result === 'pending' || result === 'push') return 0;
  if (result === 'lost') return -s;
  const o = Number(String(odds).replace('+', ''));
  if (isNaN(o)) return 0;
  const win = o > 0 ? (s * o) / 100 : (s * 100) / Math.abs(o);
  return Math.round(win * 100) / 100;
}

/**
 * Format a dollar value with sign, e.g. "+$45.00" or "-$25.00"
 */
export function fmt(n) {
  const abs = Math.abs(n).toFixed(2);
  return (n >= 0 ? '+' : '-') + '$' + abs;
}

/**
 * Format without sign prefix
 */
export function fmtPlain(n) {
  return (n >= 0 ? '' : '-') + '$' + Math.abs(n).toFixed(2);
}

/**
 * ISO date string for today
 */
export function today() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Build a map of { dateStr: totalPnl } from bets + poker arrays
 */
export function buildDailyMap(bets, poker) {
  const map = {};
  bets
    .filter((b) => b.result !== 'pending')
    .forEach((b) => {
      map[b.date] = (map[b.date] || 0) + b.pnl;
    });
  poker.forEach((p) => {
    map[p.date] = (map[p.date] || 0) + p.pnl;
  });
  return map;
}
