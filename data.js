/* =============================================================================
   data.js — Japan 2028 Family Trip
   Single source of truth for the map-first itinerary web app.

   HOW THE APP USES THIS:
   - `locations` render as map pins; `legs` render as the route lines between them.
   - Tapping a location shows the `days` based there (filter days by baseId).
   - Tapping a leg shows its mode / duration / distance detail.
   - `segments` gives each leg/pin its colour. `budget` powers the budget tab.

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
    summary: "Home. Fly out Day 1, back on Day 13 (land the following morning).",
    weather: { high: 29, low: 21, icon: "storm", desc: "Peak summer — hot and humid with afternoon thunderstorms. The opposite of where you're headed." }
  },
  {
    id: "kix", name: "Kansai Airport (KIX)", type: "airport", segment: "transit",
    coords: [34.4342, 135.2333],
    summary: "Arrival airport for Osaka. Private transfer straight to the hotel.",
    weather: { high: 9, low: 3, icon: "sun", desc: "Cold and mostly dry; crisp, often sunny with the odd light shower." }
  },
  {
    id: "osaka", name: "Osaka", type: "base", segment: "osaka",
    coords: [34.7046, 135.4961],
    arrive: "2028-01-07", depart: "2028-01-10", nights: 3,
    summary: "Arrival city — Universal Studios Japan plus an easy Osaka Bay recovery day.",
    weather: { high: 9, low: 3, icon: "sun", desc: "Cold but mild for Japan — dry and often sunny, with occasional light rain. ~5 hrs of sun a day." },
    hotelNote: "Hotel Universal Port, at Universal City. An easy walk to Universal Studios Japan and CityWalk, with the Captain Line pier directly behind the hotel for the ~10-minute ferry to Kaiyukan and Tempozan Harbor Village. This makes both Osaka days low-friction; no direct Shin-Osaka hotel shuttle found, so plan a taxi/private transfer on Day 4.",
    poi: [
      { name: "Universal Studios Japan", coords: [34.6654, 135.4323] },
      { name: "Kaiyukan Aquarium",       coords: [34.6545, 135.4290] },
      { name: "Tempozan Harbor Village", coords: [34.6551, 135.4292] },
      { name: "Tempozan Ferris Wheel",   coords: [34.6558, 135.4288] },
      { name: "Dotonbori",               coords: [34.6687, 135.5013] }
    ],
    bookings: []
  },
  {
    id: "nagoya", name: "Nagoya (change)", type: "waypoint", segment: "matsumoto",
    coords: [35.1706, 136.8816],
    summary: "Train change between the Tokaido Shinkansen and the Ltd Exp Shinano — not an overnight.",
    weather: { high: 9, low: 1, icon: "sun", desc: "Cold, dry and frequently sunny; hard frost possible overnight." }
  },
  {
    id: "matsumoto", name: "Matsumoto", type: "base", segment: "matsumoto",
    coords: [36.2280, 137.9630],
    arrive: "2028-01-10", depart: "2028-01-11", nights: 1,
    summary: "Overnight castle town that breaks up the long Osaka → snow leg.",
    weather: { high: 4, low: -5, icon: "sun", desc: "Crisp mountain-basin cold — clear, sunny days and hard overnight frosts; occasional snow flurries." },
    hotelNote: "Richmond Hotel Matsumoto — a 4-min walk from the station (ideal for this one-night, train-in/train-out stop) and sitting between the station and the castle, so the old streets and restaurants are an easy evening stroll. Family-friendly with a good Shinshu breakfast buffet. Alternatives: Dormy Inn Matsumoto (natural onsen + free late-night ramen) for a soak after the travel day, or Hotel Buena Vista to step up to the city's top full-service hotel.",
    poi: [
      { name: "Matsumoto Castle", coords: [36.2385, 137.9686] }
    ],
    bookings: []
  },
  {
    id: "nagano", name: "Nagano (change)", type: "waypoint", segment: "shiga",
    coords: [36.6430, 138.1890],
    summary: "Change point: Ltd Exp Shinano ↔ Shiga express bus, and the Hokuriku Shinkansen to Tokyo.",
    weather: { high: 4, low: -4, icon: "snow", desc: "Cold and often overcast with frequent snow — the gateway to the snow country." }
  },
  {
    id: "shiga-prince", name: "Shiga Kogen — Prince Hotel", type: "base", segment: "shiga",
    coords: [36.7130, 138.5000],
    arrive: "2028-01-11", depart: "2028-01-16", nights: 5,
    summary: "Ski-in/ski-out snow base: English lessons, family riding, the snow monkeys, onsen.",
    weather: { high: -4, low: -11, icon: "snow", desc: "Deep winter at altitude — frequent snowfall, mostly overcast, peak January powder. Well below freezing; dress for the mountain." },
    hotelNote: "Prince Hotel West Wing (Yakebitai) — family rooms, in-wing onsen, Japanese-and-Western buffets, free inter-wing shuttle. English lessons via the resort school or lift-connected Okushiga International Ski School.",
    poi: [
      { name: "Jigokudani Snow Monkey Park", coords: [36.7325, 138.4620] }
    ],
    bookings: []
  },
  {
    id: "tokyo", name: "Tokyo — Hotel East 21", type: "base", segment: "tokyo",
    coords: [35.6741, 139.8175],
    arrive: "2028-01-16", depart: "2028-01-19", nights: 3,
    summary: "Eastern Tokyo finale: teamLab and Tokyo Bay access, Shibuya/Shinjuku excursion, plus Disneyland via Good Neighbor shuttle.",
    weather: { high: 11, low: 3, icon: "sun", desc: "Crisp, sunny and dry — one of the sunniest months (~69% clear). Little rain and snow is rare." },
    hotelNote: "Hotel East 21 Tokyo, near Toyocho in Koto. A Tokyo Disney Resort Good Neighbor Hotel with complimentary reserved shuttle buses for hotel guests; better for Disney, teamLab/Toyosu and eastern Tokyo, but Shibuya/Shinjuku become a planned cross-town outing.",
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
    summary: "Departure airport (or Narita, 35.7720 / 140.3929). Evening flight home.",
    weather: { high: 10, low: 3, icon: "sun", desc: "Crisp, sunny and dry; cold wind off the bay but little rain." }
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
    title: "Aquarium + Tempozan Harbor Village (easy pace)",
    items: [
      { time: "09:00", text: "Relaxed hotel breakfast (ease off the jet-lag)" },
      { time: "09:40", text: "Walk behind Hotel Universal Port to Universal City Port", mode: "Walk", modeClass: "local" },
      { time: "10:00", text: "Captain Line ferry → Kaiyukan West Wharf (~10 min; check the 2028 timetable)", mode: "Ferry", modeClass: "coach" },
      { time: "10:15", text: "Kaiyukan Aquarium — take it slowly" },
      { time: "13:00", text: "Lunch at Tempozan Marketplace / Naniwa Kuishinbo Yokocho" },
      { time: "14:00", text: "Tempozan Harbor Village — choose LEGOLAND Discovery Center, Anipa petting zoo, shops/arcade, or a waterfront wander" },
      { time: "16:30", text: "Tempozan Giant Ferris Wheel over Osaka Bay" },
      { time: "17:30", text: "Captain Line ferry → Universal City Port", mode: "Ferry", modeClass: "coach" },
      { time: "18:00", text: "Easy dinner at Universal CityWalk" }
    ],
    meals: { breakfast: "Hotel Universal Port buffet", lunch: "Tempozan Marketplace — Naniwa Kuishinbo Yokocho, café, burger, or food court", dinner: "Universal CityWalk — Hard Rock Cafe, Bubba Gump, pizza, burgers, or TAKOPA" }
  },
  {
    n: 3, date: "2028-01-09", weekday: "Sun", baseId: "osaka", segment: "osaka",
    title: "Universal Studios Japan",
    items: [
      { time: "07:00", text: "Early breakfast at Hotel Universal Port" },
      { time: "08:15", text: "Walk to Universal Studios Japan (~5–10 min)", mode: "Walk", modeClass: "local" },
      { time: "08:30", text: "Queue for USJ; park opens 09:00 — straight to Super Nintendo World" },
      { time: "12:30", text: "Lunch in park" },
      { time: "19:00", text: "Dinner at Universal CityWalk" },
      { time: "20:30", text: "Walk back to Hotel Universal Port", mode: "Walk", modeClass: "local" }
    ],
    meals: { breakfast: "Hotel Universal Port buffet — early, before the short walk to USJ", lunch: "In-park — Mel's Drive-In burgers/shakes, pizza, chicken, turkey legs", dinner: "CityWalk — Hard Rock Cafe or Bubba Gump Shrimp" }
  },
  {
    n: 4, date: "2028-01-10", weekday: "Mon", baseId: "matsumoto", segment: "matsumoto", travelFrom: "osaka",
    title: "Osaka → Matsumoto",
    items: [
      { time: "08:45", text: "Check out" },
      { time: "08:50", text: "Hotel Universal Port → Shin-Osaka Station by taxi/private transfer (ask hotel if a 2028 shuttle exists; otherwise taxi)", mode: "Taxi / private transfer", modeClass: "transfer" },
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
      { time: "11:45", text: "Walk back out to Kanbayashi trailhead (~30–40 min)", mode: "Walk", modeClass: "local" },
      { time: "12:25", text: "Bus back up to Shiga Kogen", mode: "Bus", modeClass: "coach" },
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
      { time: "14:00", text: "Arrive Tokyo Station; Hotel East 21 shuttle/transfer if available, otherwise taxi", mode: "Shuttle / taxi", modeClass: "transfer" },
      { time: "15:00", text: "Check in" },
      { time: "16:00", text: "Settle in around Toyocho / Koto + easy dinner" }
    ],
    meals: { breakfast: "Prince buffet", lunch: "Nagano-station Western café/burger before the shinkansen", dinner: "Hotel East 21 / Toyocho area — hotel restaurants, Italian, burger/café, or simple station-area food" }
  },
  {
    n: 11, date: "2028-01-17", weekday: "Mon", baseId: "tokyo", segment: "tokyo",
    title: "teamLab + Shibuya / Shinjuku",
    items: [
      { time: "09:00", text: "Hotel East 21 → teamLab Planets, Toyosu (taxi or local transit)", mode: "Taxi / local transit", modeClass: "local" },
      { time: "09:30", text: "teamLab Planets, Toyosu (book a timed entry)" },
      { time: "11:30", text: "Toyosu / Tokyo Bay lunch" },
      { time: "12:30", text: "Toyosu → Shibuya — crossing, Hachiko, shopping", mode: "Train", modeClass: "local" },
      { time: "15:30", text: "Shibuya → Shinjuku / Kabukicho", mode: "JR Yamanote", modeClass: "local" },
      { time: "16:00", text: "Godzilla head (Hotel Gracery, roars on the hour) + arcade/anime shops" },
      { time: "18:00", text: "Dinner in Shinjuku or Shibuya" },
      { time: "20:00", text: "Return to Hotel East 21", mode: "Subway / taxi", modeClass: "local" }
    ],
    meals: { breakfast: "Hotel East 21 buffet or Toyocho café", lunch: "Toyosu / Ariake — mall cafés, burgers or pizza near teamLab", dinner: "Shibuya/Shinjuku — Shake Shack, steak, Italian, or American diner-style options" }
  },
  {
    n: 12, date: "2028-01-18", weekday: "Tue", baseId: "tokyo", segment: "tokyo",
    title: "Tokyo Disneyland (Land, not Sea)",
    items: [
      { time: "07:00", text: "Breakfast" },
      { time: "07:00", text: "Hotel East 21 → Tokyo Disneyland (Good Neighbor shuttle; reserve in advance; current trip estimate ~30–45 min)", mode: "Good Neighbor shuttle bus", modeClass: "transfer" },
      { time: "07:45", text: "Arrive; park opens 09:00 — full day" },
      { time: "20:00", text: "Evening parade / fireworks" },
      { time: "21:10", text: "Disneyland → Hotel East 21 (evening shuttle, reserved; current trip estimate ~30–45 min)", mode: "Good Neighbor shuttle bus", modeClass: "transfer" }
    ],
    meals: { breakfast: "Hotel buffet early (before the shuttle), or pastries", lunch: "In-park Western — burgers, pizza, chicken", dinner: "In-park table-service or counter burgers; snack back near Toyocho if needed" }
  },
  {
    n: 13, date: "2028-01-19", weekday: "Wed", baseId: "tokyo", segment: "tokyo", travelTo: "haneda",
    title: "Fly home",
    items: [
      { time: "09:00", text: "Check out, store bags at Hotel East 21" },
      { time: "10:00", text: "Final easy Tokyo morning — Ginza / Tokyo Station shopping and lunch", mode: "Subway / taxi", modeClass: "local" },
      { time: "16:30", text: "Return to hotel, collect bags" },
      { time: "17:00", text: "To the airport — Haneda by taxi or subway + airport rail; Narita if flights change", mode: "Airport transfer", modeClass: "transfer" },
      { time: "20:30", text: "Tokyo → Brisbane (overnight, ~9 hr)", mode: "Flight", modeClass: "flight" },
      { time: "~07:00", text: "Land Brisbane (Thu 20 Jan)" }
    ],
    meals: { breakfast: "Hotel buffet", lunch: "Western café, or Western options at Haneda/Narita before the flight" }
  }
];

/* Day-map stops. These are deliberately separate from the country-level route:
   they describe the actual sequence of places seen on each day. Hotel entries
   use the planned neighbourhood until exact accommodation is booked. */
const dayMaps = {
  1: { stops: [
    { time: "19:45", label: "Kansai Airport", kind: "airport", coords: [34.4342, 135.2333], mode: "Jetstar JQ23", modeClass: "flight" },
    { time: "21:45", label: "Hotel Universal Port", kind: "hotel", coords: [34.6674, 135.4367], mode: "Private transfer / taxi", modeClass: "transfer", durationMin: 60, detail: "Universal City — beside the Captain Line pier" }
  ]},
  2: { stops: [
    { time: "09:00", label: "Hotel Universal Port", kind: "hotel", coords: [34.6674, 135.4367], detail: "Relaxed breakfast" },
    { time: "09:40", label: "Universal City Port", kind: "station", coords: [34.6662, 135.4360], mode: "Walk", modeClass: "local", durationMin: 5, detail: "Captain Line pier behind the hotel" },
    { time: "10:00", label: "Kaiyukan West Wharf", kind: "station", coords: [34.6530, 135.4290], mode: "Captain Line ferry", modeClass: "coach", durationMin: 10, via: [[34.6625, 135.4342], [34.6574, 135.4310]], detail: "Direct ferry across Osaka Bay; timetable varies" },
    { time: "10:15", label: "Kaiyukan Aquarium", kind: "attraction", coords: [34.6545, 135.4290], mode: "Walk", modeClass: "local", durationMin: 5, detail: "Unhurried aquarium visit" },
    { time: "13:00", label: "Tempozan Marketplace", kind: "food", coords: [34.6553, 135.4295], mode: "Walk", modeClass: "local", durationMin: 3, detail: "Lunch at Naniwa Kuishinbo Yokocho or the food court" },
    { time: "14:00", label: "Tempozan Harbor Village", kind: "activity", coords: [34.6551, 135.4292], mode: "Walk", modeClass: "local", durationMin: 3, detail: "Flexible: LEGOLAND, Anipa, shops, arcade, or waterfront" },
    { time: "16:30", label: "Tempozan Ferris Wheel", kind: "activity", coords: [34.6558, 135.4288], mode: "Walk", modeClass: "local", durationMin: 3, detail: "Giant wheel over Osaka Bay" },
    { time: "17:20", label: "Kaiyukan West Wharf", kind: "station", coords: [34.6530, 135.4290], mode: "Walk", modeClass: "local", durationMin: 5, detail: "Return to the Captain Line pier" },
    { time: "17:30", label: "Universal City Port", kind: "station", coords: [34.6662, 135.4360], mode: "Captain Line ferry", modeClass: "coach", durationMin: 10, via: [[34.6574, 135.4310], [34.6625, 135.4342]], detail: "Return ferry to Universal City" },
    { time: "18:00", label: "Universal CityWalk", kind: "food", coords: [34.6678, 135.4380], mode: "Walk", modeClass: "local", durationMin: 5, detail: "Easy dinner near the hotel" }
  ]},
  3: { stops: [
    { time: "07:00", label: "Hotel Universal Port", kind: "hotel", coords: [34.6674, 135.4367], detail: "Early hotel buffet" },
    { time: "08:15", label: "Universal Studios", kind: "attraction", coords: [34.6654, 135.4323], mode: "Walk", modeClass: "local", durationMin: 8, detail: "Easy walk to the park entrance" },
    { time: "12:30", label: "Mel's / in-park food", kind: "food", coords: [34.6662, 135.4328], mode: "Walk in park", modeClass: "local", durationMin: 5, detail: "Burgers, shakes, pizza or chicken" },
    { time: "19:00", label: "Universal CityWalk", kind: "food", coords: [34.6678, 135.4380], mode: "Walk to CityWalk", modeClass: "local", durationMin: 8, detail: "Hard Rock Cafe or Bubba Gump" },
    { time: "20:30", label: "Hotel Universal Port", kind: "hotel", coords: [34.6674, 135.4367], mode: "Walk", modeClass: "local", durationMin: 5, detail: "Short walk back after dinner" }
  ]},
  4: { stops: [
    { time: "08:50", label: "Hotel Universal Port", kind: "hotel", coords: [34.6674, 135.4367], detail: "Check out; no direct Shin-Osaka shuttle found in current hotel access info" },
    { time: "09:20", label: "Shin-Osaka Station", kind: "station", coords: [34.7335, 135.5002], mode: "Taxi / private transfer", modeClass: "transfer", durationMin: 30, detail: "Door-to-station with luggage; ask hotel to book ahead" },
    { time: "10:35", label: "Nagoya Station", kind: "station", coords: [35.1706, 136.8816], mode: "Tokaido Shinkansen", modeClass: "bullet", durationMin: 50, railKey: "tokaido_shin_osaka_nagoya" },
    { time: "13:00", label: "Matsumoto Station", kind: "station", coords: [36.2300, 137.9640], mode: "Ltd Exp Shinano", modeClass: "limited-express", durationMin: 120, railKey: "chuo_nagoya_matsumoto" },
    { time: "13:15", label: "Richmond Hotel Matsumoto", kind: "hotel", coords: [36.2318, 137.9678], mode: "Walk / short taxi", modeClass: "local", durationMin: 8, detail: "Drop bags — 4 min from the station, near the castle" },
    { time: "13:30", label: "Matsumoto lunch", kind: "food", coords: [36.2312, 137.9662], mode: "Walk", modeClass: "local", durationMin: 5, detail: "Pizza Verde or local burger" },
    { time: "14:30", label: "Matsumoto Castle", kind: "attraction", coords: [36.2385, 137.9686], mode: "Walk", modeClass: "local", durationMin: 15 },
    { time: "18:00", label: "Old-town dinner", kind: "food", coords: [36.2348, 137.9710], mode: "Walk", modeClass: "local", durationMin: 10, detail: "French/Italian or Hawaiian/American" }
  ]},
  5: { stops: [
    { time: "09:15", label: "Richmond Hotel Matsumoto", kind: "hotel", coords: [36.2318, 137.9678] },
    { time: "09:30", label: "Matsumoto Station", kind: "station", coords: [36.2300, 137.9640], mode: "Walk", modeClass: "local", durationMin: 8 },
    { time: "10:25", label: "Nagano Station", kind: "station", coords: [36.6430, 138.1890], mode: "Ltd Exp Shinano", modeClass: "limited-express", durationMin: 55, railKey: "shinonoi_matsumoto_nagano" },
    { time: "10:45", label: "Nagano station lunch", kind: "food", coords: [36.6424, 138.1880], mode: "Walk", modeClass: "local", durationMin: 5, detail: "Western cafe or burger" },
    { time: "13:00", label: "Prince West Wing", kind: "hotel", coords: [36.7130, 138.5000], mode: "Express bus", modeClass: "coach", durationMin: 80 }
  ]},
  6: { stops: [
    { time: "08:00", label: "Prince West Wing", kind: "hotel", coords: [36.7130, 138.5000], detail: "Breakfast buffet" },
    { time: "09:00", label: "Yakebitai ski school", kind: "activity", coords: [36.7157, 138.4976], mode: "Walk / resort shuttle", modeClass: "local", durationMin: 10 },
    { time: "12:00", label: "Mountain lunch", kind: "food", coords: [36.7180, 138.5030], mode: "Ski / lift", modeClass: "local", durationMin: 10, detail: "Burgers, curry or pasta" },
    { time: "16:00", label: "Prince West Wing", kind: "hotel", coords: [36.7130, 138.5000], mode: "Ski back", modeClass: "local", durationMin: 10, detail: "Onsen and buffet; East Wing French-Italian option" }
  ]},
  7: { stops: [
    { time: "09:00", label: "Prince West Wing", kind: "hotel", coords: [36.7130, 138.5000] },
    { time: "09:15", label: "Lesson area", kind: "activity", coords: [36.7157, 138.4976], mode: "Resort shuttle", modeClass: "local", durationMin: 10 },
    { time: "12:00", label: "Mountain lunch", kind: "food", coords: [36.7180, 138.5030], mode: "Ski / lift", modeClass: "local", durationMin: 10, detail: "Western food or burger van" },
    { time: "18:00", label: "Ichinose dinner option", kind: "food", coords: [36.7205, 138.4915], mode: "Evening shuttle", modeClass: "local", durationMin: 15, detail: "Pizzeria, Chinese or ramen" }
  ]},
  8: { stops: [
    { time: "09:00", label: "Prince West Wing", kind: "hotel", coords: [36.7130, 138.5000] },
    { time: "09:15", label: "Yakebitai slopes", kind: "activity", coords: [36.7240, 138.5090], mode: "Ski / lift", modeClass: "local", durationMin: 10 },
    { time: "12:00", label: "Mountain lunch", kind: "food", coords: [36.7248, 138.5070], mode: "Ski", modeClass: "local", durationMin: 5, detail: "On-mountain Western" },
    { time: "13:00", label: "Okushiga area", kind: "activity", coords: [36.7377, 138.5168], mode: "Connected lifts", modeClass: "local", durationMin: 20 },
    { time: "18:00", label: "East Wing dinner", kind: "food", coords: [36.7146, 138.5054], mode: "Hotel shuttle", modeClass: "local", durationMin: 10, detail: "Formal Western / French-Italian" }
  ]},
  9: { stops: [
    { time: "08:30", label: "Prince West Wing", kind: "hotel", coords: [36.7130, 138.5000] },
    { time: "09:00", label: "Kanbayashi trailhead", kind: "station", coords: [36.7332, 138.4265], mode: "Resort shuttle / bus", modeClass: "coach", durationMin: 35 },
    { time: "10:00", label: "Snow Monkey Park", kind: "attraction", coords: [36.7325, 138.4620], mode: "Snow trail walk", modeClass: "local", durationMin: 35 },
    { time: "12:20", label: "Kanbayashi trailhead", kind: "station", coords: [36.7332, 138.4265], mode: "Snow trail walk", modeClass: "local", durationMin: 35, detail: "Walk back out from the monkey park" },
    { time: "12:45", label: "Mountain lunch", kind: "food", coords: [36.7180, 138.5030], mode: "Bus back up to Shiga", modeClass: "coach", durationMin: 25 },
    { time: "13:30", label: "Final runs", kind: "activity", coords: [36.7240, 138.5090], mode: "Ski / lift", modeClass: "local", durationMin: 10 }
  ]},
  10: { stops: [
    { time: "09:15", label: "Prince West Wing", kind: "hotel", coords: [36.7130, 138.5000] },
    { time: "10:45", label: "Nagano Station", kind: "station", coords: [36.6430, 138.1890], mode: "Express bus", modeClass: "coach", durationMin: 80 },
    { time: "11:00", label: "Nagano station lunch", kind: "food", coords: [36.6424, 138.1880], mode: "Walk", modeClass: "local", durationMin: 5, detail: "Western cafe or burger" },
    { time: "14:00", label: "Tokyo Station", kind: "station", coords: [35.6812, 139.7671], mode: "Hokuriku Shinkansen", modeClass: "bullet", durationMin: 90, railKey: "hokuriku_nagano_tokyo" },
    { time: "15:00", label: "Hotel East 21 Tokyo", kind: "hotel", coords: [35.6741, 139.8175], mode: "Shuttle / taxi", modeClass: "transfer", durationMin: 25, detail: "Ask hotel about a Tokyo Station transfer; if unavailable, take a taxi with luggage" },
    { time: "18:00", label: "Toyocho dinner", kind: "food", coords: [35.6696, 139.8171], mode: "Walk / short taxi", modeClass: "local", durationMin: 10, detail: "Hotel restaurants or easy station-area food" }
  ]},
  11: { stops: [
    { time: "08:00", label: "Hotel East 21 Tokyo", kind: "hotel", coords: [35.6741, 139.8175], detail: "Breakfast at the hotel or Toyocho cafe" },
    { time: "09:30", label: "teamLab Planets", kind: "attraction", coords: [35.6494, 139.7897], mode: "Taxi / local transit", modeClass: "local", durationMin: 25, detail: "Book a timed morning entry" },
    { time: "11:30", label: "Toyosu lunch", kind: "food", coords: [35.6550, 139.7925], mode: "Walk / local transit", modeClass: "local", durationMin: 10, detail: "Mall cafes, burgers or pizza" },
    { time: "13:00", label: "Shibuya Crossing", kind: "attraction", coords: [35.6595, 139.7005], mode: "Train", modeClass: "local", durationMin: 35, via: [[35.6707, 139.7508], [35.6655, 139.7126]] },
    { time: "15:30", label: "Godzilla Head", kind: "attraction", coords: [35.6955, 139.7020], mode: "JR Yamanote", modeClass: "local", durationMin: 20, via: [[35.6580, 139.7016], [35.6633, 139.7015], [35.6705, 139.7024], [35.6815, 139.7029], [35.6895, 139.7002]] },
    { time: "18:00", label: "Shinjuku dinner", kind: "food", coords: [35.6897, 139.7005], mode: "Walk", modeClass: "local", durationMin: 10, detail: "Steak, Italian or American" },
    { time: "20:00", label: "Hotel East 21 Tokyo", kind: "hotel", coords: [35.6741, 139.8175], mode: "Subway / taxi", modeClass: "local", durationMin: 35 }
  ]},
  12: { stops: [
    { time: "07:00", label: "Hotel East 21 Tokyo", kind: "hotel", coords: [35.6741, 139.8175], detail: "Early buffet or pastries" },
    { time: "07:45", label: "Tokyo Disneyland", kind: "attraction", coords: [35.6329, 139.8804], mode: "Good Neighbor shuttle", modeClass: "transfer", durationMin: 45, detail: "Official estimate is about 30-45 min; reserve the guest shuttle in advance" },
    { time: "12:30", label: "Disneyland lunch", kind: "food", coords: [35.6323, 139.8806], mode: "Walk", modeClass: "local", durationMin: 5, detail: "Burgers, pizza or chicken" },
    { time: "18:30", label: "Disneyland dinner", kind: "food", coords: [35.6315, 139.8814], mode: "Walk", modeClass: "local", durationMin: 5, detail: "Table service or counter burgers" },
    { time: "21:10", label: "Hotel East 21 Tokyo", kind: "hotel", coords: [35.6741, 139.8175], mode: "Reserved hotel shuttle", modeClass: "transfer", durationMin: 45, detail: "Current posted return from Disneyland is 21:10; allow 30-45 min" }
  ]},
  13: { stops: [
    { time: "09:00", label: "Hotel East 21 Tokyo", kind: "hotel", coords: [35.6741, 139.8175] },
    { time: "10:00", label: "Ginza / Tokyo Station", kind: "attraction", coords: [35.6764, 139.7657], mode: "Subway / taxi", modeClass: "local", durationMin: 20, detail: "Easy final shopping and lunch before collecting bags" },
    { time: "16:30", label: "Hotel East 21 Tokyo", kind: "hotel", coords: [35.6741, 139.8175], mode: "Return for bags", modeClass: "local", durationMin: 25 },
    { time: "17:00", label: "Airport meal options", kind: "food", coords: [35.5494, 139.7798], mode: "Taxi / airport rail", modeClass: "transfer", durationMin: 45, detail: "Western cafes and restaurants at Haneda" },
    { time: "18:00", label: "Haneda Airport", kind: "airport", coords: [35.5494, 139.7798], mode: "Airport rail", modeClass: "transfer", durationMin: 5 }
  ]}
};

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
  { id: "b13", category: "Activities",    label: "Other entries (teamLab, Kaiyukan, Tempozan options, monkeys)", planned: 450, actual: null },
  { id: "b14", category: "Food",          label: "City / non-park meals ×4",                             planned: 1300, actual: null }
  // Pre-bookable subtotal ≈ A$17,000. Incidentals / spending money (~$2,000–3,000) tracked separately, on top.
];

/* STARTING palette only — run the real visual pass with the frontend-design guidance. */
const theme = {
  bg: "#F5F7FA", surface: "#FFFFFF", text: "#1C2530", muted: "#66707D",
  line: "#E3E7EC", accent: "#3A7CA5", radius: "14px",
  fontStack: "'Inter', system-ui, -apple-system, sans-serif"
};

/* Export for module bundlers; harmless if loaded as a plain <script>. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { trip, segments, legs, locations, days, dayMaps, budget, theme };
}
