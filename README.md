# Fuel Forecast

A personal gas-price dashboard for Utah County, built around one habit: filling up about
once a week. It tells you which day of the week and time of year gas tends to be
cheapest, compares stations near you (with your Maverik Adventure Club discount and
other loyalty programs factored in), and gets more accurate the more you use it.

## Why it works this way

There is no free, legal, real-time API for station-level gas prices — GasBuddy has no
public API, and scraping it isn't something this app does. So the data model is:

- **Your own fill-up log is the source of truth.** Log each fill-up (station, price,
  gallons — takes about 10 seconds) and every chart, recommendation, and comparison in
  the app is built from your real history. It gets sharper the more you log.
- **The U.S. EIA's free official API** supplies Utah's weekly average retail gasoline
  price as macro/seasonal context (state-level, not station-level — see Settings to add
  your own free key).
- **Widely reported general patterns** (AAA/OPIS/GasBuddy studies on weekday pricing,
  EIA's national seasonal driving-season shape) fill in the gaps until you've logged
  enough of your own data — every chart clearly labels which source is behind each
  number ("Your data" vs. "General pattern" vs. "EIA official").

Everything is stored locally in your browser (`localStorage`) — nothing is sent to a
server. Use **Settings → Backup & restore** to export/import a JSON snapshot.

## Features

- **Overview** — best day to fill up, best station in your current city, spend/MPG stats.
- **Trends** — day-of-week and seasonal (month-of-year) price charts.
- **Stations** — directory of Maverik and competitor stations per city, your logged
  average price at each, and a form to add stations/cities of your own.
- **Log** — fill-up entry form + history table (auto-suggests your Maverik/Chevron card
  discount).
- **Tools** — detour cost calculator (is driving further worth the extra gas burned?)
  and a loyalty/membership program comparator (Maverik, Costco, Sam's Club, Smith's Fuel
  Points, Chevron Techron).
- **Alerts** — set a target price; get a running log of fill-ups that hit it, plus an
  optional browser notification.
- **Settings** — EIA API key, home city, vehicle (MPG/tank size), which loyalty programs
  you carry, light/dark theme, backup & restore.
- **City switcher** in the header — view the whole dashboard for any city, not just home.

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run lint     # oxlint
```

To get seasonal trend data, register a free key at
[eia.gov/opendata/register.php](https://www.eia.gov/opendata/register.php) and paste it
into **Settings**. Without a key, the seasonal chart falls back to the general pattern.

## Tech

React 19 + Vite, Recharts for charts, no backend — deploys as a static site (GitHub
Pages, Vercel, Netlify, etc.). State lives in a single React context
(`src/state/AppState.jsx`) backed by `localStorage`.
