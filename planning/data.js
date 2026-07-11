/* =============================================================================
   data.js — Japan 2028 Family Trip
   Single source of truth for the map-first itinerary web app.

   HOW THE APP USES THIS:
   - `locations` render as map pins; `legs` render as the route lines between them.
   - Tapping a location shows the `days` based there (filter days by baseId).
   - Tapping a leg shows its mode / duration / distance detail.
   - `segments` gives each leg/pin its colour. `budget` + `checklists` power those tabs.

   Load as a <script> (globals) or import the module export at the bottom.
   All times/prices are planning estimates — reconfirm when booking.
   Coordinates are accurate to the venue but worth a final check before launch.
   The `theme` block is a STARTING palette only; do the real visual pass with the
   frontend-design guidance when building the UI.
============================================================================= */

const trip = {
  title: "Japan 2028 — Family Trip",
  travellers: "2 adults + 2 boys (14 & 11 at travel)",
  nights: 12,
  depart: "2028-01-07",          // Brisbane → Osaka
  returnFlight: "2028-01-19",    // Tokyo → Brisbane (land Brisbane ~2028-01-20)
  route: ["Osaka", "Matsumoto", "Shiga Kogen", "Tokyo"],
  homeCurrency: "AUD",
  fxNote: "~¥112 = A$1 at time of planning",
  transportRule: "Train, express bus, taxi or shuttle only — no driving.",
  notes: "All clock times approximate; 2028 timetables not yet published."
};

/* Segment id -> label + colour. Used to colour route lines and pins. */
const segments = {
  osaka:     { label: "Osaka",              color: "#E4572E" }, // warm red
  matsumoto: { label: "Matsumoto",          color: "#17A398" }, // teal
  shiga:     { label: "Shiga Kogen (snow)", color: "#3A7CA5" }, // blue
  tokyo:     { label: "Tokyo",              color: "#9B5DE5" }, // purple
  transit:   { label: "Airports / transfer",color: "#6B7280" }  // grey
};

/* modeClass drives leg styling: bullet | limited-express | coach | transfer | local | flight
   mapLine: true = draw as a route line on the Japan map; false = data only (off-map flights). */
const legs = [
  { id: "bne-kix",          from: "brisbane",     to: "kix",        day: 1,  mode: "Flight (Jetstar JQ23)",       modeClass: "flight",          durationMin: 570, distanceKm: 7000, cost: null, mapLine: false, notes: "Depart Brisbane ~11:40, land Osaka ~19:45" },
  { id: "kix-osaka",        from: "kix",          to: "osaka",      day: 1,  mode: "Private transfer / taxi",     modeClass: "transfer",        durationMin: 55,  distanceKm: 50,   cost: null, mapLine: true,  notes: "Door-to-door, pre-booked" },
  { id: "osaka-nagoya",     from: "osaka",        to: "nagoya",     day: 4,  mode: "Shinkansen (Tokaido)",        modeClass: "bullet",          durationMin: 50,  distanceKm: 180,  cost: null, mapLine: true,  notes: "Shin-Osaka → Nagoya; change here" },
  { id: "nagoya-matsumoto", from: "nagoya",       to: "matsumoto",  day: 4,  mode: "Ltd Exp Shinano",             modeClass: "limited-express", durationMin: 120, distanceKm: 190,  cost: null, mapLine: true,  notes: "Through the Kiso Valley" },
  { id: "matsumoto-nagano", from: "matsumoto",    to: "nagano",     day: 5,  mode: "Ltd Exp Shinano",             modeClass: "limited-express", durationMin: 55,  distanceKm: 65,   cost: null, mapLine: true,  notes: "Continue north on the same line" },
  { id: "nagano-shiga",     from: "nagano",       to: "shiga-prince", day: 5, mode: "Express bus",                modeClass: "coach",           durationMin: 80,  distanceKm: 45,   cost: null, mapLine: true,  notes: "Drops right at the Prince wing" },
  { id: "shiga-nagano",     from: "shiga-prince", to: "nagano",     day: 10, mode: "Express bus",                 modeClass: "coach",           durationMin: 80,  distanceKm: 45,   cost: null, mapLine: true,  notes: "Return leg; departs from the wing" },
  { id: "nagano-tokyo",     from: "nagano",       to: "tokyo",      day: 10, mode: "Hokuriku Shinkansen",         modeClass: "bullet",          durationMin: 90,  distanceKm: 220,  cost: null, mapLine: true,  notes: "Nagano → Tokyo" },
  { id: "tokyo-haneda",     from: "tokyo",        to: "haneda",     day: 13, mode: "Airport rail (Monorail/Keikyu)", modeClass: "transfer",     durationMin: 40,  distanceKm: 25,   cost: null, mapLine: true,  notes: "Or Narita via N'EX (~75 min)" },
  { id: "haneda-bne",       from: "haneda",       to: "brisbane",   day: 13, mode: "Flight",                      modeClass: "flight",          durationMin: 570, distanceKm: 7000, cost: null, mapLine: false, notes: "Overnight; land Brisbane ~07:00 next day" }
];

/* Map pins. type: origin | airport | base | waypoint.
   `poi` = points of interest within/near a base (optional secondary markers).
   `offMap: true` = don't fit the Japan map to this node (Brisbane). */
const locations = [
  {
    id: "brisbane", name: "Brisbane", type: "origin", segment: "transit",
    coords: [-27.4698, 153.0251], offMap: true,
    summary: "Home. Fly out Day 1, back on Day 13 (land the following morning)."
  },
  {
    id: "kix", name: "Kansai Airport (KIX)", type: "airport", segment: "transit",
    coords: [34.4342, 135.2333],
    summary: "Arrival airport for Osaka. Private transfer straight to the hotel."
  },
  {
    id: "osaka", name: "Osaka", type: "base", segment: "osaka",
    coords: [34.6656, 135.5006],
    arrive: "2028-01-07", depart: "2028-01-10", nights: 3,
    summary: "Arrival city — Universal Studios Japan plus an easy recovery day.",
    hotelNote: "Central base (Namba / Shinsaibashi): Day 2 sights on the doorstep; quick JR to Universal. Or a Good-value USJ-shuttle hotel like OMO7 if you'd rather ride door-to-door on the park day.",
    poi: [
      { name: "Universal Studios Japan", coords: [34.6654, 135.4323] },
      { name: "Osaka Castle",            coords: [34.6873, 135.5259] },
      { name: "Kaiyukan Aquarium",       coords: [34.6545, 135.4290] },
      { name: "Dotonbori",               coords: [34.6687, 135.5013] }
    ],
    bookings: []
  },
  {
    id: "nagoya", name: "Nagoya (change)", type: "waypoint", segment: "matsumoto",
    coords: [35.1706, 136.8816],
    summary: "Train change between the Tokaido Shinkansen and the Ltd Exp Shinano — not an overnight."
  },
  {
    id: "matsumoto", name: "Matsumoto", type: "base", segment: "matsumoto",
    coords: [36.2280, 137.9630],
    arrive: "2028-01-10", depart: "2028-01-11", nights: 1,
    summary: "Overnight castle town that breaks up the long Osaka → snow leg.",
    hotelNote: "Stay near the station or the castle — the castle, old streets and restaurants are all walkable.",
    poi: [
      { name: "Matsumoto Castle", coords: [36.2385, 137.9686] }
    ],
    bookings: []
  },
  {
    id: "nagano", name: "Nagano (change)", type: "waypoint", segment: "shiga",
    coords: [36.6430, 138.1890],
    summary: "Change point: Ltd Exp Shinano ↔ Shiga express bus, and the Hokuriku Shinkansen to Tokyo."
  },
  {
    id: "shiga-prince", name: "Shiga Kogen — Prince Hotel", type: "base", segment: "shiga",
    coords: [36.7130, 138.5000],
    arrive: "2028-01-11", depart: "2028-01-16", nights: 5,
    summary: "Ski-in/ski-out snow base: English lessons, family riding, the snow monkeys, onsen.",
    hotelNote: "Prince Hotel West Wing (Yakebitai) — family rooms, in-wing onsen, Japanese-and-Western buffets, free inter-wing shuttle. English lessons via the resort school or lift-connected Okushiga International Ski School.",
    poi: [
      { name: "Jigokudani Snow Monkey Park", coords: [36.7325, 138.4620] }
    ],
    bookings: []
  },
  {
    id: "tokyo", name: "Tokyo — Shinjuku", type: "base", segment: "tokyo",
    coords: [35.6896, 139.7006],
    arrive: "2028-01-16", depart: "2028-01-19", nights: 3,
    summary: "City finale: Disneyland (via shuttle), the Godzilla head, Shibuya, teamLab.",
    hotelNote: "Shinjuku Good Neighbor Hotel (e.g. Keio Plaza) — free door-to-park Disney shuttle + central base. Reserve the shuttle in advance (limited seats).",
    poi: [
      { name: "Godzilla head (Shinjuku)",     coords: [35.6955, 139.7020] },
      { name: "Shibuya",                       coords: [35.6595, 139.7005] },
      { name: "teamLab Planets (Toyosu)",      coords: [35.6494, 139.7897] },
      { name: "Akihabara",                     coords: [35.6984, 139.7731] },
      { name: "Tokyo Disneyland (Maihama)",    coords: [35.6329, 139.8804] }
    ],
    bookings: []
  },
  {
    id: "haneda", name: "Haneda Airport", type: "airport", segment: "transit",
    coords: [35.5494, 139.7798],
    summary: "Departure airport (or Narita, 35.7720 / 140.3929). Evening flight home."
  }
];

/* The 13-day schedule. Each day belongs to a base (baseId = where you sleep that night;
   the fly-home day stays with Tokyo). Travel days carry travelFrom/travelTo.
   items[].modeClass matches the leg classes above so transport can be styled the same way.
   meals = Western picks (breakfast / lunch / dinner). */
const days = [
  {
    n: 1, date: "2028-01-07", weekday: "Fri", baseId: "osaka", segment: "osaka",
    title: "Arrival",
    items: [
      { time: "09:40", text: "Arrive Brisbane Airport (2 hrs before an international flight)" },
      { time: "11:40", text: "Brisbane → Osaka Kansai (Jetstar JQ23, ~9 hr)", mode: "Flight", modeClass: "flight" },
      { time: "19:45", text: "Land Osaka Kansai (KIX)" },
      { time: "20:30", text: "Immigration + collect bags" },
      { time: "20:45", text: "KIX → hotel door", mode: "Private transfer / taxi", modeClass: "transfer" },
      { time: "21:45", text: "Check in, sleep" }
    ],
    meals: { breakfast: "On the plane", lunch: "In transit", dinner: "Late — konbini or a burger chain near the hotel, or the hotel bar" }
  },
  {
    n: 2, date: "2028-01-08", weekday: "Sat", baseId: "osaka", segment: "osaka",
    title: "Osaka at an easy pace (recover from the flight)",
    items: [
      { time: "09:30", text: "Hotel → Tanimachi 4-chome (Tanimachi line)", mode: "Metro/subway", modeClass: "local" },
      { time: "10:00", text: "Osaka Castle + grounds" },
      { time: "12:00", text: "Lunch" },
      { time: "13:00", text: "→ Osakako (Chuo line)", mode: "Metro/subway", modeClass: "local" },
      { time: "13:30", text: "Kaiyukan Aquarium (Tempozan)" },
      { time: "16:30", text: "→ Namba / Shinsaibashi", mode: "Metro/subway", modeClass: "local" },
      { time: "17:00", text: "Dotonbori — street food, lights, dinner" }
    ],
    meals: { breakfast: "Hotel buffet, or Eggs 'n Things (Shinsaibashi) Hawaiian pancakes", lunch: "Café/burger near the Castle or Kaiyukan", dinner: "Dotonbori — burgers, pizza/Italian, or steak" }
  },
  {
    n: 3, date: "2028-01-09", weekday: "Sun", baseId: "osaka", segment: "osaka",
    title: "Universal Studios Japan",
    items: [
      { time: "07:30", text: "Breakfast" },
      { time: "08:00", text: "Hotel → Universal City (JR Yumesaki line), or taxi", mode: "Train", modeClass: "local" },
      { time: "09:00", text: "Park opens — straight to Super Nintendo World" },
      { time: "12:30", text: "Lunch in park" },
      { time: "19:00", text: "Dinner at Universal CityWalk" },
      { time: "21:00", text: "Back to hotel", mode: "Train", modeClass: "local" }
    ],
    meals: { breakfast: "Hotel buffet", lunch: "In-park — Mel's Drive-In burgers/shakes, pizza, chicken, turkey legs", dinner: "CityWalk — Hard Rock Cafe or Bubba Gump Shrimp" }
  },
  {
    n: 4, date: "2028-01-10", weekday: "Mon", baseId: "matsumoto", segment: "matsumoto", travelFrom: "osaka",
    title: "Osaka → Matsumoto",
    items: [
      { time: "09:00", text: "Check out" },
      { time: "09:15", text: "Hotel → Shin-Osaka Station", mode: "Taxi", modeClass: "transfer" },
      { time: "09:40", text: "Shin-Osaka → Nagoya (Tokaido)", mode: "Shinkansen", modeClass: "bullet" },
      { time: "10:35", text: "Change platforms at Nagoya (~25 min)" },
      { time: "11:00", text: "Nagoya → Matsumoto (Kiso Valley)", mode: "Ltd Exp Shinano", modeClass: "limited-express" },
      { time: "13:00", text: "Arrive Matsumoto; walk / short taxi to hotel, drop bags" },
      { time: "13:30", text: "Lunch (Matsumoto soba)" },
      { time: "14:30", text: "Matsumoto Castle + old town (Nawate & Nakamachi)", mode: "Walk", modeClass: "local" },
      { time: "18:00", text: "Dinner in town", mode: "Walk", modeClass: "local" }
    ],
    meals: { breakfast: "Osaka hotel buffet", lunch: "Matsumoto — Pizza Verde (Neapolitan) or the Fukashi-dori burger joint", dinner: "Hikariya Nishi (French/Italian) or Hula la (Hawaiian/American), plus old-town cafés" }
  },
  {
    n: 5, date: "2028-01-11", weekday: "Tue", baseId: "shiga-prince", segment: "shiga", travelFrom: "matsumoto",
    title: "Matsumoto → Shiga Kogen",
    items: [
      { time: "08:30", text: "Breakfast, check out" },
      { time: "09:15", text: "Hotel → Matsumoto Station", mode: "Walk", modeClass: "local" },
      { time: "09:30", text: "Matsumoto → Nagano", mode: "Ltd Exp Shinano", modeClass: "limited-express" },
      { time: "10:25", text: "Arrive Nagano; early lunch near the station" },
      { time: "11:30", text: "Nagano (East Exit, stop 23) → Shiga Kogen Prince, Yakebitai", mode: "Express bus", modeClass: "coach" },
      { time: "13:00", text: "Arrive the Prince West Wing; check in" },
      { time: "13:45", text: "Collect on-site rental gear + confirm tomorrow's lessons" },
      { time: "Evening", text: "In-wing onsen + dinner buffet" }
    ],
    meals: { breakfast: "Matsumoto hotel buffet or a station café", lunch: "Nagano-station Western café/burger", dinner: "Prince West Wing buffet (Japanese + Western)" }
  },
  {
    n: 6, date: "2028-01-12", weekday: "Wed", baseId: "shiga-prince", segment: "shiga",
    title: "Snow Day 1",
    items: [
      { time: "08:00", text: "Breakfast" },
      { time: "08:45", text: "To the ski-school meeting point", mode: "Walk / resort shuttle", modeClass: "local" },
      { time: "09:00", text: "Boys' beginner group lesson (English) + Dad's private refresher" },
      { time: "12:00", text: "Lunch on the mountain" },
      { time: "13:00", text: "Afternoon practice" },
      { time: "16:00", text: "Lifts wind down" },
      { time: "Wife", text: "10:00 guided snowshoe tour, or an onsen/spa day" }
    ],
    meals: { breakfast: "Prince West buffet", lunch: "On-mountain (burgers, curry, pasta) or the Niseko burger van", dinner: "Prince West buffet, or shuttle to the East Wing for French-Italian" }
  },
  {
    n: 7, date: "2028-01-13", weekday: "Thu", baseId: "shiga-prince", segment: "shiga",
    title: "Snow Day 2",
    items: [
      { time: "09:00", text: "Lessons continue (free inter-area shuttle as needed)", mode: "Resort shuttle", modeClass: "local" },
      { time: "12:00", text: "Lunch" },
      { time: "13:00", text: "First easy family runs together" },
      { time: "16:00", text: "Wrap up" }
    ],
    meals: { breakfast: "Prince buffet", lunch: "Mountain Western / burger van", dinner: "Prince Chinese or ramen for variety, or the Ichinose village pizzeria (evening shuttle)" }
  },
  {
    n: 8, date: "2028-01-14", weekday: "Fri", baseId: "shiga-prince", segment: "shiga",
    title: "Snow Day 3 (free riding together)",
    items: [
      { time: "09:00", text: "Morning session — the whole family riding" },
      { time: "12:00", text: "Lunch on the mountain" },
      { time: "13:00", text: "Afternoon runs; push across Yakebitai / over toward Okushiga" },
      { time: "16:00", text: "Wrap up" },
      { time: "Wife", text: "Onsen / snowshoe, or a warmer day trip down to Nagano (Zenko-ji)" }
    ],
    meals: { breakfast: "Prince buffet", lunch: "On-mountain Western", dinner: "East Wing formal Western / French-Italian (a nicer night)" }
  },
  {
    n: 9, date: "2028-01-15", weekday: "Sat", baseId: "shiga-prince", segment: "shiga",
    title: "Snow monkeys + last runs",
    items: [
      { time: "08:30", text: "Down toward Kanbayashi Onsen / Jigokudani", mode: "Resort shuttle / bus", modeClass: "coach" },
      { time: "09:30", text: "Walk the snow trail into the Snow Monkey Park (~30–40 min)", mode: "Walk", modeClass: "local" },
      { time: "10:00", text: "Monkeys (whole family)" },
      { time: "11:45", text: "Walk out + bus back up to Shiga (~1 hr)", mode: "Bus", modeClass: "coach" },
      { time: "12:45", text: "Lunch" },
      { time: "13:30", text: "Final easy runs to round out the snow" },
      { time: "16:00", text: "Last lifts" }
    ],
    meals: { breakfast: "Prince buffet", lunch: "Mountain lunch after the monkeys", dinner: "Prince buffet, or Ichinose village (casual Western/pizza)" }
  },
  {
    n: 10, date: "2028-01-16", weekday: "Sun", baseId: "tokyo", segment: "tokyo", travelFrom: "shiga-prince",
    title: "Shiga Kogen → Tokyo",
    items: [
      { time: "09:00", text: "Check out" },
      { time: "09:15", text: "Shiga Kogen Prince → Nagano Station", mode: "Express bus", modeClass: "coach" },
      { time: "10:45", text: "Arrive Nagano; lunch" },
      { time: "12:30", text: "Nagano → Tokyo", mode: "Hokuriku Shinkansen", modeClass: "bullet" },
      { time: "14:00", text: "Arrive Tokyo; to hotel", mode: "JR / subway or taxi", modeClass: "local" },
      { time: "15:00", text: "Check in" },
      { time: "16:00", text: "Explore local area + dinner" }
    ],
    meals: { breakfast: "Prince buffet", lunch: "Nagano-station Western café/burger before the shinkansen", dinner: "Shinjuku — Shake Shack (Southern Terrace), Sawamura, Italian or steak; or a hotel Western restaurant" }
  },
  {
    n: 11, date: "2028-01-17", weekday: "Mon", baseId: "tokyo", segment: "tokyo",
    title: "Shinjuku / Shibuya / teamLab (+ optional Akihabara)",
    items: [
      { time: "09:00", text: "Hotel → Kabukicho, Shinjuku (you're based here)", mode: "Walk", modeClass: "local" },
      { time: "09:15", text: "Godzilla head (Hotel Gracery, roars on the hour)" },
      { time: "11:00", text: "Shinjuku → Shibuya — crossing, Hachiko, shopping", mode: "JR Yamanote", modeClass: "local" },
      { time: "13:00", text: "Lunch" },
      { time: "14:00", text: "Shibuya → Toyosu", mode: "Train", modeClass: "local" },
      { time: "14:30", text: "teamLab Planets, Toyosu (book a timed entry)" },
      { time: "17:30", text: "Dinner" },
      { time: "Option", text: "Add Akihabara (electronics/gaming/anime) — swap for teamLab or tack on late afternoon (~10–20 min away)" }
    ],
    meals: { breakfast: "Sarabeth's (Lumine Shinjuku) — eggs Benedict, pancakes", lunch: "Shibuya — Shake Shack or Eggs 'n Things (Harajuku)", dinner: "Shibuya/Shinjuku steak (Ikinari), Italian, or American — or dinner in Akihabara if added" }
  },
  {
    n: 12, date: "2028-01-18", weekday: "Tue", baseId: "tokyo", segment: "tokyo",
    title: "Tokyo Disneyland (Land, not Sea)",
    items: [
      { time: "07:00", text: "Breakfast" },
      { time: "07:30", text: "Hotel → Tokyo Disneyland (direct, reserve in advance)", mode: "Good Neighbor shuttle bus", modeClass: "transfer" },
      { time: "08:30", text: "Arrive; park opens 09:00 — full day" },
      { time: "20:00", text: "Evening parade / fireworks" },
      { time: "21:40", text: "Disneyland → hotel (evening service, reserved)", mode: "Good Neighbor shuttle bus", modeClass: "transfer" }
    ],
    meals: { breakfast: "Hotel buffet early (before the shuttle), or pastries", lunch: "In-park Western — burgers, pizza, chicken", dinner: "In-park table-service or counter burgers, or back in Shinjuku late" }
  },
  {
    n: 13, date: "2028-01-19", weekday: "Wed", baseId: "tokyo", segment: "tokyo", travelTo: "haneda",
    title: "Fly home",
    items: [
      { time: "09:00", text: "Check out, store bags for the day" },
      { time: "Day", text: "Final bits around Tokyo" },
      { time: "18:00", text: "To the airport — Haneda (Monorail/Keikyu ~40 min) or Narita (N'EX ~75 min)", mode: "Airport transfer", modeClass: "transfer" },
      { time: "20:30", text: "Tokyo → Brisbane (overnight, ~9 hr)", mode: "Flight", modeClass: "flight" },
      { time: "~07:00", text: "Land Brisbane (Thu 20 Jan)" }
    ],
    meals: { breakfast: "Hotel buffet", lunch: "Western café, or Western options at Haneda/Narita before the flight" }
  }
];

/* AUD planning figures. actual = null until booked (fill via the tracker → localStorage). */
const budget = [
  { id: "b1",  category: "Flights",       label: "BNE→KIX / HND→BNE ×4 (open-jaw, Jan peak)",           planned: 6000, actual: null },
  { id: "b2",  category: "Accommodation", label: "12 nights, family rooms (Shiga half-board)",           planned: 4000, actual: null },
  { id: "b3",  category: "Transit",       label: "Shinkansen ×2 + Shinano + Shiga buses + KIX transfer", planned: 1100, actual: null },
  { id: "b4",  category: "Transit",       label: "Local metro/JR IC top-ups",                            planned: 350,  actual: null },
  { id: "b5",  category: "Snow",          label: "Lift passes (4 days × Dad + 2 boys)",                  planned: 670,  actual: null },
  { id: "b6",  category: "Snow",          label: "Equipment hire (3 boarders × 4 days)",                 planned: 800,  actual: null },
  { id: "b7",  category: "Snow",          label: "Lessons (boys group + Dad private + snowshoe)",        planned: 700,  actual: null },
  { id: "b8",  category: "Theme parks",   label: "USJ entry ×4",                                         planned: 320,  actual: null },
  { id: "b9",  category: "Theme parks",   label: "USJ Express Pass 4 ×4 + Power-Up Bands",               planned: 600,  actual: null },
  { id: "b10", category: "Theme parks",   label: "Disneyland entry ×4",                                  planned: 290,  actual: null },
  { id: "b11", category: "Theme parks",   label: "Disneyland Premier Access",                            planned: 150,  actual: null },
  { id: "b12", category: "Food",          label: "Theme-park food (2 days ×4)",                          planned: 320,  actual: null },
  { id: "b13", category: "Activities",    label: "Other entries (teamLab, Kaiyukan, Castle, monkeys)",   planned: 450,  actual: null },
  { id: "b14", category: "Food",          label: "City / non-park meals ×4",                             planned: 1300, actual: null }
  // Pre-bookable subtotal ≈ A$17,000. Incidentals / spending money (~$2,000–3,000) tracked separately, on top.
];

/* User-editable in the app (done state persists to localStorage). */
const checklists = {
  packing: [
    { id: "p1", label: "Snowboard gloves", done: false }
    // extend as needed
  ],
  prep: [
    { id: "x1", label: "Book flights (open-jaw; book early for Jan peak)",                 done: false, due: "2027-06-01" },
    { id: "x2", label: "Book KIX private transfer / airport shuttle",                       done: false, due: "2027-12-01" },
    { id: "x3", label: "Book Shiga snowboard lessons (English) + rentals",                  done: false, due: "2027-10-01" },
    { id: "x4", label: "Buy USJ tickets + Express Pass 4 (release ~2 mths out)",            done: false, due: "2027-11-08" },
    { id: "x5", label: "Buy Disneyland tickets + plan Premier Access",                      done: false, due: "2027-11-15" },
    { id: "x6", label: "Reserve the Good Neighbor Disney shuttle (advance, limited seats)", done: false, due: "2027-12-17" },
    { id: "x7", label: "Reserve shinkansen / Ltd Exp Shinano seats (~1 mth out)",           done: false, due: "2027-12-07" },
    { id: "x8", label: "Book teamLab Planets timed entry",                                  done: false, due: "2027-12-15" },
    { id: "x9", label: "Travel insurance + check passports (6+ mths validity)",             done: false, due: "2027-09-01" }
  ]
};

/* STARTING palette only — run the real visual pass with the frontend-design guidance. */
const theme = {
  bg: "#F5F7FA", surface: "#FFFFFF", text: "#1C2530", muted: "#66707D",
  line: "#E3E7EC", accent: "#3A7CA5", radius: "14px",
  fontStack: "'Inter', system-ui, -apple-system, sans-serif"
};

/* Export for module bundlers; harmless if loaded as a plain <script>. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { trip, segments, legs, locations, days, budget, checklists, theme };
}
