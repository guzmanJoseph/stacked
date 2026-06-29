export function fmt(n) {
  const num = Number(n || 0);
  const abs = Math.abs(num).toFixed(2);
  return (num >= 0 ? '+' : '-') + '$' + abs;
}

export function fmtPlain(n) {
  const num = Number(n || 0);
  return (num >= 0 ? '' : '-') + '$' + Math.abs(num).toFixed(2);
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

export function buildDailyMap(poker = []) {
  const map = {};

  poker.forEach((p) => {
    if (!p.date) return;
    map[p.date] = (map[p.date] || 0) + Number(p.pnl || 0);
  });

  return map;
}