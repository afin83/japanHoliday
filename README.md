# Japan 2028 — Family Trip

A mobile-first, map-first itinerary web app. The map of Japan is the home screen;
every base and travel leg is tappable and drills into detail. Budget, checklists and
bookings live behind the bottom nav.

Built as a plain static site — **no build step, no framework**. Vanilla JS + [Leaflet](https://leafletjs.com/)
with the CARTO Positron basemap (free, no API key).

## Run locally

Any static server works. For example:

```bash
npx serve .
# then open the printed http://localhost:xxxx URL
```

Opening `index.html` directly (file://) mostly works too, but a server avoids browser
restrictions on module/asset loading.

## Structure

```
index.html        # markup + script/style includes
css/app.css       # winter-Japan theme, mobile-first
data.js           # single source of truth — trip, locations, legs, days, budget, checklists
js/store.js       # localStorage: checklist ticks + actual spend
js/format.js      # date/money/duration helpers + tiny DOM builder
js/map.js         # Leaflet map: segment-coloured pins + route lines
js/sheets.js      # location + leg detail bottom sheets
js/tabs.js        # Budget / Checklists / Bookings panels
js/app.js         # bootstrap, bottom-nav, back-button overlay handling
```

## Editing the trip

All itinerary content is static in **`data.js`** — edit it there:

- **`locations`** → map pins (coords, dates, hotel notes, points of interest, `bookings`)
- **`legs`** → route lines (mode, duration, distance; `mapLine: false` keeps flights off the map)
- **`days`** → the 13-day timeline (times, transport, Western meal picks)
- **`budget`** → planned figures (actuals are entered in-app and saved to `localStorage`)
- **`checklists`** → packing + prep (with due dates)

User edits (checklist ticks, actual spend) persist in `localStorage` under `japan2028:v1`;
they never touch `data.js`.

## Deploy to Vercel

It's a static site, so no config is needed.

**Option A — CLI (no git required):**

```bash
npm i -g vercel
vercel        # from this folder; accept the defaults
vercel --prod # promote to production
```

**Option B — Git + dashboard:** push this folder to a GitHub repo, then "Import Project"
in Vercel. Framework preset: **Other**. Build command: none. Output directory: `./`.

## Notes

- All clock times are approximate — 2028 timetables aren't published yet. Reconfirm when booking.
- Coordinates are accurate to the venue but worth a final check before the trip.
- The full plan (route rationale, food guide, budget breakdown, open items) lives in
  `planning/japan-2028-build-plan.md`.
