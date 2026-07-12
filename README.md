# Japan 2028 - Family Trip

A mobile-first, map-first itinerary web app. The map of Japan is the home screen;
every base and travel leg is tappable and drills into detail. Budget, itinerary
and bookings live behind the bottom nav.

Built as a plain static site: no build step, no framework. Vanilla JS +
[Leaflet](https://leafletjs.com/) with the CARTO Positron basemap.

## Run locally

Any static server works. For example:

```bash
npx serve .
# then open the printed http://localhost:xxxx URL
```

Opening `index.html` directly mostly works too, but a server avoids browser
restrictions on module/asset loading.

## Structure

```text
index.html          # markup + script/style includes
css/app.css         # winter-Japan theme, mobile-first
data.js             # single source of truth: trip, locations, legs, days, budget
js/store.js         # localStorage: actual spend
js/format.js        # date/money/duration helpers + tiny DOM builder
js/map.js           # Leaflet map: segment-coloured pins + route lines
js/day-view.js      # day selector, detailed stops, transport lines + food highlights
js/rail-geometry.js # exact railway-track geometry derived from OpenStreetMap
js/sheets.js        # location + leg detail bottom sheets
js/tabs.js          # Budget / Itinerary / Bookings panels
js/app.js           # bootstrap, bottom-nav, back-button overlay handling
```

## Editing The Trip

All itinerary content is static in `data.js`:

- `locations` -> map pins, dates, hotel notes, points of interest, bookings
- `legs` -> route lines, mode, duration and distance
- `days` -> the 13-day timeline, transport and meal picks
- `dayMaps` -> detailed hotel, station, attraction and food map stops
- `budget` -> planned figures; actuals are entered in-app and saved to localStorage

User edits for actual spend persist in `localStorage` under `japan2028:v1`.
They never touch `data.js`.

## Deploy To Vercel

It's a static site, so no config is needed.

Option A, CLI:

```bash
npm i -g vercel
vercel
vercel --prod
```

Option B, Git + dashboard: push this folder to a GitHub repo, then import the
project in Vercel. Framework preset: Other. Build command: none. Output
directory: `./`.

## Notes

- All clock times are approximate; 2028 timetables are not published yet.
- Coordinates are accurate to the venue but worth a final check before the trip.
- The full plan lives in `planning/japan-2028-build-plan.md`.
