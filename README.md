# 💰 Bankroll Tracker

A mobile-first PWA to track your sports bets across multiple sportsbooks and poker sessions.

## Features

- **Dashboard** — total P&L, monthly P&L, win rate, and a 14-day bar chart
- **Bets** — log bets with sportsbook, description, stake, odds, sport, and result. Filter by pending / won / lost. One-tap to settle pending bets.
- **Poker** — log sessions with buy-in, cash-out, and hours played. Tracks $/hr average.
- **Calendar** — color-coded profit calendar. Tap any day to see that day's entries.
- **PWA** — install directly to your iPhone/Android home screen from the browser

### Supported sportsbooks
DraftKings · FanDuel · BetMGM · ESPNBet · Caesars · Other

### Supported sports
NBA · NFL · MLB · NHL · Soccer · Tennis · Golf · MMA · Other

---

## Getting started

### Prerequisites
- Node.js 18+
- npm

### Install and run

```bash
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
```

This creates an optimized build in `/build` ready to deploy to any static host (Netlify, Vercel, GitHub Pages, etc.).

---

## Deploying (Netlify — recommended)

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Select your repo, set build command to `npm run build`, publish dir to `build`
4. Deploy → you get a live URL to open on your phone

### Install as a PWA on iPhone
1. Open your deployed URL in Safari
2. Tap the Share icon → "Add to Home Screen"
3. Done — it opens full-screen like a native app

---

## Project structure

```
src/
  components/
    AddModal.js        # Add bet / poker session modal
    EntryCard.js       # Reusable bet and poker cards
  hooks/
    useData.js         # Central data state + localStorage persistence
  pages/
    Dashboard.js       # Home screen with chart and recent activity
    Bets.js            # Full bet list with filters
    Poker.js           # Poker sessions with stats
    Calendar.js        # Monthly profit calendar
  utils/
    calc.js            # P&L math, formatting helpers
    storage.js         # localStorage load/save + seed data
  App.js               # Root + bottom navigation
  index.js             # Entry point
public/
  index.html           # HTML shell with PWA meta tags
  manifest.json        # PWA manifest
```

---

## Data

All data is stored in your browser's `localStorage` under the key `bankroll_tracker_v1`. Nothing is sent to any server — your data stays on your device.

To back up: open DevTools → Application → Local Storage → copy the value for `bankroll_tracker_v1`.

---

## License

MIT
