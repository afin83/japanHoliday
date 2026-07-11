/* =============================================================================
   sheets.js — bottom-sheet detail for a tapped location or leg.
============================================================================= */

const Sheets = (() => {
  const sheet = document.getElementById("sheet");
  const scrim = document.getElementById("scrim");
  const elEyebrow = document.getElementById("sheetEyebrow");
  const elTitle = document.getElementById("sheetTitle");
  const elBody = document.getElementById("sheetBody");

  const byId = Object.fromEntries(locations.map((l) => [l.id, l]));
  const daysByBase = {};
  for (const d of days) (daysByBase[d.baseId] ||= []).push(d);

  const segLabel = (k) => (segments[k] && segments[k].label) || "Transit";
  const segColor = (k) => (segments[k] && segments[k].color) || segments.transit.color;

  const TYPE_LABEL = { base: "Trip base", airport: "Airport", waypoint: "Change point", origin: "Home", activity: "Activity" };

  /* Weather icon set (inline SVG, currentColor) + accent colour per condition. */
  const CLOUD = 'M6.5 19a4.5 4.5 0 0 1-.5-8.97 6 6 0 0 1 11.5.72A4 4 0 0 1 17.5 19h-11Z';
  const WEATHER_ICONS = {
    sun: '<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></g></svg>',
    cloud: '<svg viewBox="0 0 24 24" width="30" height="30"><path fill="currentColor" d="' + CLOUD + '"/></svg>',
    rain: '<svg viewBox="0 0 24 24" width="30" height="30"><path fill="currentColor" d="M6.5 16a4.5 4.5 0 0 1-.5-8.97 6 6 0 0 1 11.5.72A4 4 0 0 1 17.5 16h-11Z"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/></g></svg>',
    snow: '<svg viewBox="0 0 24 24" width="30" height="30"><path fill="currentColor" d="M6.5 15a4.5 4.5 0 0 1-.5-8.97 6 6 0 0 1 11.5.72A4 4 0 0 1 17.5 15h-11Z"/><g fill="currentColor"><circle cx="8" cy="19" r="1.2"/><circle cx="12" cy="20.5" r="1.2"/><circle cx="16" cy="19" r="1.2"/></g></svg>',
    storm: '<svg viewBox="0 0 24 24" width="30" height="30"><path fill="currentColor" d="M6.5 14a4.5 4.5 0 0 1-.5-8.97 6 6 0 0 1 11.5.72A4 4 0 0 1 17.5 14h-11Z"/><path fill="currentColor" d="M12.5 14l-3.5 5h2.4l-1 3.5 4.1-6h-2.6l1.4-2.5z"/></svg>',
  };
  const WEATHER_COLOR = { sun: "#E9A23B", cloud: "#8092ad", rain: "#3A7CA5", snow: "#3A7CA5", storm: "#9B5DE5" };
  const temp = (n) => (n < 0 ? "−" + Math.abs(n) : String(n)) + "°C"; // proper minus sign

  function weatherBlock(loc) {
    const w = loc.weather;
    if (!w) return null;
    const color = WEATHER_COLOR[w.icon] || "var(--accent)";
    return el("div", {}, [
      el("div", { class: "section-label", text: "Average conditions" }),
      el("div", { class: "weather" }, [
        el("div", { class: "weather__icon", style: "color:" + color, html: WEATHER_ICONS[w.icon] || WEATHER_ICONS.cloud }),
        el("div", { class: "weather__main" }, [
          el("div", { class: "weather__temps" }, [
            el("span", { class: "weather__hi", html: '<span aria-hidden="true">↑</span> ' + temp(w.high) }),
            el("span", { class: "weather__lo", html: '<span aria-hidden="true">↓</span> ' + temp(w.low) }),
          ]),
          el("div", { class: "weather__desc", text: w.desc }),
        ]),
      ]),
      el("div", { class: "weather__caption", text: "Typical mid-January averages — reconfirm nearer the trip." }),
    ]);
  }

  /* ---------- reveal / hide ---------- */
  function reveal(segKey) {
    sheet.className = "sheet seg-" + (segKey || "transit");
    sheet.hidden = false;
    scrim.hidden = false;
    elBody.scrollTop = 0;
  }

  function hide() {
    sheet.hidden = true;
    scrim.hidden = true;
    MapView.deselect();
    MapView.clearLegHighlight();
  }

  /* ---------- content builders ---------- */
  function renderDay(day) {
    const items = day.items.map((it) =>
      el("li", { class: "day__item" }, [
        el("span", { class: "day__time", text: it.time }),
        el("span", { class: "day__text" }, [
          it.text,
          it.mode ? el("span", { class: "day__mode", text: it.mode }) : null,
        ]),
      ])
    );

    const meals = day.meals
      ? el("div", { class: "day__meals", html:
          `<b>B</b> ${day.meals.breakfast || "—"} &nbsp;·&nbsp; <b>L</b> ${day.meals.lunch || "—"}` +
          (day.meals.dinner ? ` &nbsp;·&nbsp; <b>D</b> ${day.meals.dinner}` : "")
        })
      : null;

    return el("div", { class: "day" }, [
      el("div", { class: "day__head" }, [
        el("span", { class: "day__n", text: "DAY " + day.n }),
        el("span", { class: "day__date", text: Fmt.shortDate(day.date) }),
        el("span", { class: "day__title", text: day.title }),
      ]),
      el("ul", { class: "day__items" }, items),
      meals,
    ]);
  }

  function connectionRows(id) {
    const touching = legs.filter((l) => (l.from === id || l.to === id) && l.mapLine !== false);
    if (!touching.length) return null;
    const rows = touching.map((leg) => {
      const other = byId[leg.from === id ? leg.to : leg.from];
      const dir = leg.from === id ? "→ " : "← ";
      return el("button", {
        class: "bline",
        style: "cursor:pointer;text-align:left;width:100%",
        onclick: () => openLeg(leg.id),
      }, [
        el("span", { class: "bline__label", text: dir + (other ? other.name : leg.to) }),
        el("span", { class: "bline__planned", text: `${leg.mode} · ${Fmt.duration(leg.durationMin)}` }),
      ]);
    });
    return el("div", {}, [el("div", { class: "section-label", text: "Connections" }), ...rows]);
  }

  function bookingsBlock(loc) {
    const list = Array.isArray(loc.bookings) ? loc.bookings : [];
    if (!list.length) {
      return el("div", {}, [
        el("div", { class: "section-label", text: "Bookings" }),
        el("div", { class: "empty", text: "No bookings saved yet. Add confirmation numbers to this location in data.js as you book." }),
      ]);
    }
    const rows = list.map((b) =>
      el("div", { class: "booking" }, [
        el("div", { style: "font-weight:800;font-size:0.9rem", text: b.title || b.label || "Booking" }),
        b.ref ? el("div", { style: "font-size:0.8rem;color:var(--ink-soft);margin-top:2px", text: "Ref: " + b.ref }) : null,
        b.time ? el("div", { style: "font-size:0.8rem;color:var(--muted);margin-top:2px", text: b.time }) : null,
      ])
    );
    return el("div", {}, [el("div", { class: "section-label", text: "Bookings" }), ...rows]);
  }

  /* ---------- location ---------- */
  function openLocation(id) {
    const loc = byId[id];
    if (!loc) return;

    elEyebrow.innerHTML =
      `<span style="color:${segColor(loc.segment)}">●</span> ${segLabel(loc.segment)} · ${TYPE_LABEL[loc.type] || ""}`;
    elTitle.textContent = loc.name;

    elBody.innerHTML = "";

    // Stat chips
    const chips = [];
    if (loc.arrive) chips.push(el("span", { class: "chip", text: Fmt.dateRange(loc.arrive, loc.depart) }));
    if (loc.nights) chips.push(el("span", { class: "chip", text: `${loc.nights} night${loc.nights > 1 ? "s" : ""}` }));
    if (chips.length) elBody.appendChild(el("div", { class: "stat-row" }, chips));

    if (loc.summary) elBody.appendChild(el("p", { class: "summary-line", text: loc.summary }));

    const weather = weatherBlock(loc);
    if (weather) elBody.appendChild(weather);

    if (loc.hotelNote) {
      elBody.appendChild(el("div", { class: "note" }, [
        el("span", { html: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 7h-8v6h8V7Zm2-4H3a2 2 0 0 0-2 2v14h2v-4h18v4h2V5a2 2 0 0 0-2-2ZM7 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg>' }),
        el("span", { text: loc.hotelNote }),
      ]));
    }

    if (Array.isArray(loc.poi) && loc.poi.length) {
      elBody.appendChild(el("div", { class: "section-label", text: "Highlights nearby" }));
      elBody.appendChild(el("div", { class: "stat-row" },
        loc.poi.map((p) => el("span", { class: "chip" }, [
          el("span", { class: "chip__dot", style: "background:var(--accent)" }), p.name,
        ]))
      ));
    }

    const dd = daysByBase[loc.id] || [];
    if (dd.length) {
      elBody.appendChild(el("div", { class: "section-label", text: "Day by day" }));
      dd.forEach((d) => elBody.appendChild(renderDay(d)));
    }

    if (loc.type !== "base") {
      const conn = connectionRows(loc.id);
      if (conn) elBody.appendChild(conn);
    }

    if (loc.type === "base") elBody.appendChild(bookingsBlock(loc));

    App.openOverlay(hide);
    reveal(loc.segment);
    MapView.selectLocation(loc.id);
  }

  /* ---------- leg ---------- */
  function openLeg(id) {
    const leg = legs.find((l) => l.id === id);
    if (!leg) return;
    const from = byId[leg.from], to = byId[leg.to];

    const segKey = to ? to.segment : "transit";
    elEyebrow.innerHTML = `<span style="color:${segColor(segKey)}">●</span> Transit leg`;
    elTitle.textContent = `${from ? from.name : leg.from} → ${to ? to.name : leg.to}`;

    elBody.innerHTML = "";
    elBody.appendChild(el("div", { class: "stat-row" }, [
      el("span", { class: "chip", text: leg.mode }),
    ]));

    elBody.appendChild(el("div", { class: "leg-grid" }, [
      el("div", { class: "leg-stat" }, [
        el("div", { class: "leg-stat__val", text: Fmt.duration(leg.durationMin) }),
        el("div", { class: "leg-stat__lbl", text: "Duration" }),
      ]),
      el("div", { class: "leg-stat" }, [
        el("div", { class: "leg-stat__val", text: Fmt.km(leg.distanceKm) }),
        el("div", { class: "leg-stat__lbl", text: "Distance" }),
      ]),
    ]));

    if (leg.notes) {
      elBody.appendChild(el("div", { class: "note" }, [
        el("span", { html: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z"/></svg>' }),
        el("span", { text: leg.notes }),
      ]));
    }

    // endpoints -> jump to those locations
    const jump = (loc, arrow) => loc && !loc.offMap
      ? el("button", { class: "bline", style: "cursor:pointer;text-align:left;width:100%", onclick: () => openLocation(loc.id) }, [
          el("span", { class: "bline__label", text: arrow + loc.name }),
          el("span", { class: "bline__planned", text: "View" }),
        ])
      : null;
    const ends = [jump(from, "From: "), jump(to, "To: ")].filter(Boolean);
    if (ends.length) {
      elBody.appendChild(el("div", { class: "section-label", text: "Stops" }));
      ends.forEach((e) => elBody.appendChild(e));
    }

    App.openOverlay(hide);
    reveal(segKey);
    MapView.highlightLeg(leg.id);
  }

  return { openLocation, openLeg, hide };
})();
