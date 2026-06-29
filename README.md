# Stacked

Stacked is a mobile-first poker bankroll tracker that helps players log poker sessions, analyze long-term performance, and compete with friends through private groups and leaderboards. The application provides an easy way to track profit and loss, monitor bankroll growth, and compare results with other players.

## Features

- Track poker sessions with buy-in, cash-out, hours played, notes, and automatic profit/loss calculations
- Dashboard with lifetime profit, monthly profit, win rate, hourly rate, average session profit, and performance charts
- Global leaderboard comparing results across all users
- Private group leaderboards to compete with friends
- Create and join poker groups using shareable group codes
- Calendar view with daily and monthly profit/loss history
- Secure email/password authentication powered by Supabase
- Progressive Web App (PWA) support for installation on iOS and Android devices

## Technology Stack

- React
- Create React App
- Supabase Authentication
- Supabase PostgreSQL Database
- Chart.js
- Vercel

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/stacked.git
cd stacked
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_SUPABASE_URL=YOUR_SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Running the Application

Start the development server:

```bash
npm start
```

Then open:

```
http://localhost:3000
```

## Building for Production

```bash
npm run build
```

## Deployment

This application is configured for deployment on Vercel.

Recommended Vercel settings:

```
Framework Preset: Create React App
Root Directory: .
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

Add the following environment variables in your Vercel project:

```
REACT_APP_SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY
```

## Project Structure

```
src/
├── components/
├── hooks/
├── pages/
├── utils/
├── App.js
├── Auth.js
└── supabaseClient.js

public/
├── index.html
├── manifest.json
└── stacked.png
```

## Database

The application uses Supabase with the following primary tables:

- profiles
- poker_sessions
- groups
- group_members
