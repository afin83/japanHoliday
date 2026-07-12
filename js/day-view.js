/* Day-level map: numbered stops, A-to-B transport and food highlights. */
const DayView = (() => {
  let map;
  let activeDay = 1;
  let activeFocus = null;
  let isBriefCollapsed = false;
  let drawVersion = 0;
  const routeCache = new Map();
  const layer = L.layerGroup();
  const picker = document.getElementById("dayPicker");
  const brief = document.getElementById("dayBrief");
  const host = document.getElementById("dayView");

  const COLORS = {
    hotel: "#0b2545", attraction: "#2f6fb0", station: "#6B7280",
    food: "#E4572E", airport: "#6B7280", activity: "#17A398"
  };
  const LINE = {
    flight: { dashArray: "3 8", weight: 3, color: "#6B7280", label: "Flight" },
    coach: { dashArray: "9 7", weight: 4, color: "#9B5DE5", label: "Bus / shuttle" },
    transfer: { dashArray: "3 7", weight: 4, color: "#E9A23B", label: "Taxi / transfer" },
    local: { dashArray: "6 6", weight: 4, color: "#17A398", label: "Walk / local train" },
    bullet: { dashArray: null, weight: 5, color: "#2F6FB0", label: "Shinkansen" },
    "limited-express": { dashArray: null, weight: 4, color: "#3A7CA5", label: "Limited express" }
  };

  function compactDuration(min) {
    if (min == null || Number.isNaN(min)) return "";
    if (min < 60) return `${Math.max(1, Math.round(min))}min`;
    const hours = min / 60;
    return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}hr`;
  }

  function transportLabel(a, b, fallback) {
    const duration = compactDuration(b.durationMin);
    return `${b.mode || fallback} · ${duration ? "~" + duration : "time TBC"}`;
  }

  function stopPopup(stop, transport) {
    const title = `${stop.time || ""} ${stop.label}`.trim();
    return [
      `<b>${escapeHtml(title)}</b>`,
      stop.detail ? `<br>${escapeHtml(stop.detail)}` : "",
      transport ? `<br><small>${escapeHtml(transport)}</small>` : "",
      `<br>${googleSearchLinkHtml(`${stop.label} Japan`)}`
    ].join("");
  }

  function icon(stop, index) {
    const color = COLORS[stop.kind] || COLORS.activity;
    const glyph = stop.kind === "hotel" ? "H" : stop.kind === "food" ? "F" : String(index + 1);
    const label = stop.kind === "hotel" ? `HOTEL · ${stop.label}` : stop.label;
    return L.divIcon({
      className: "",
      html: `<div class="day-pin day-pin--${stop.kind}" style="--pin-color:${color}">${glyph}<span>${label}</span></div>`,
      iconSize: stop.kind === "hotel" ? [38, 38] : [30, 30],
      iconAnchor: stop.kind === "hotel" ? [19, 19] : [15, 15]
    });
  }

  function renderPicker() {
    picker.innerHTML = "";
    days.forEach((day) => {
      const btn = el("button", {
        type: "button", class: day.n === activeDay ? "is-active" : "",
        "aria-pressed": String(day.n === activeDay),
        "aria-label": `Day ${day.n}: ${day.title}`,
        onclick: () => select(day.n)
      }, [el("b", { text: `D${day.n}` }), el("span", { text: day.weekday })]);
      picker.appendChild(btn);
    });
    picker.querySelector(".is-active")?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function hasSharedToken(a, b) {
    const left = new Set(normalize(a).split(" ").filter((word) => word.length >= 4));
    return normalize(b).split(" ").some((word) => word.length >= 4 && left.has(word));
  }

  function travelBlocks(day, plan) {
    let lastEnd = -1;
    return day.items.map((item) => {
      if (!item.mode || plan.stops.length < 2) return null;
      const itemText = `${item.text} ${item.mode}`;
      const preferred = plan.stops.findIndex((stop, i) =>
        i > lastEnd + 1 &&
        stop.modeClass === item.modeClass &&
        hasSharedToken(itemText, `${stop.label} ${stop.mode || ""}`)
      );
      const fallback = plan.stops.findIndex((stop, i) =>
        i > lastEnd + 1 &&
        stop.modeClass === item.modeClass
      );
      const stopIndex = preferred > 0 ? preferred : fallback;
      if (stopIndex <= 0) return null;
      const block = {
        start: lastEnd + 1,
        end: stopIndex - 1,
        label: `${plan.stops[lastEnd + 1]?.label || "Start"} to ${plan.stops[stopIndex].label}`
      };
      lastEnd = block.end;
      return block;
    });
  }

  function itemStopIndex(item, itemIndex, day, plan, block) {
    if (block) return block.end + 1;
    const itemText = item.text;
    const matched = plan.stops.findIndex((stop) =>
      hasSharedToken(itemText, `${stop.time || ""} ${stop.label} ${stop.detail || ""}`)
    );
    if (matched >= 0) return matched;
    const sameTime = plan.stops.findIndex((stop) => stop.time === item.time);
    if (sameTime >= 0) return sameTime;
    const ratio = itemIndex / Math.max(1, day.items.length - 1);
    return Math.min(plan.stops.length - 1, Math.round(ratio * (plan.stops.length - 1)));
  }

  function renderBrief(day, plan) {
    const blocks = travelBlocks(day, plan);
    const selectedKey = activeFocus ? `${activeFocus.type}:${activeFocus.start ?? activeFocus.stop}` : "";
    const timeline = day.items.map((item, i) => {
      const block = blocks[i];
      const stopIndex = itemStopIndex(item, i, day, plan, block);
      const selectable = block || stopIndex >= 0;
      const focus = block
        ? { type: "travel", start: block.start, end: block.end, label: block.label }
        : { type: "place", stop: stopIndex, label: plan.stops[stopIndex]?.label };
      const key = block ? `travel:${block.start}` : `place:${stopIndex}`;
      const attrs = {
        class: `day-brief__item${selectable ? " is-clickable" : ""}${key === selectedKey ? " is-active" : ""}`,
        role: selectable ? "button" : null,
        tabindex: selectable ? "0" : null,
        "aria-label": selectable ? `Show ${block ? `travel from ${block.label}` : focus.label}` : null,
        onclick: selectable ? () => toggleFocus(focus) : null,
        onkeydown: selectable ? (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleFocus(focus);
          }
        } : null
      };
      return el("li", attrs, [
        el("span", { class: "day-brief__time", text: item.time }),
        el("span", { class: "day-brief__event", text: item.text }),
        item.mode ? el("span", { class: `day-brief__mode mode-${item.modeClass || "local"}`, text: item.mode }) : null
      ]);
    });
    const mealNames = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };
    const meals = Object.entries(day.meals || {}).map(([key, value]) =>
      el("div", { class: "meal-option" }, [el("b", { text: mealNames[key] }), el("span", { text: value })])
    );
    brief.innerHTML = "";
    brief.classList.toggle("is-collapsed", isBriefCollapsed);
    brief.append(
      el("header", { class: "day-brief__head" }, [
        el("div", {}, [el("span", { class: "day-brief__eyebrow", text: `DAY ${day.n} · ${Fmt.shortDate(day.date)}` }), el("h2", { text: day.title })]),
        el("div", { class: "day-brief__actions" }, [
          activeFocus
            ? el("button", { type: "button", class: "day-brief__count day-brief__count--button", text: "Full day", onclick: () => select(activeDay) })
            : el("span", { class: "day-brief__count", text: `${plan.stops.length} mapped stops` }),
          el("button", {
            type: "button",
            class: "day-brief__toggle",
            text: isBriefCollapsed ? "Show" : "Hide",
            "aria-expanded": String(!isBriefCollapsed),
            "aria-controls": "dayBriefContent",
            "aria-label": isBriefCollapsed ? "Expand day summary" : "Collapse day summary",
            onclick: toggleBriefCollapsed
          })
        ])
      ]),
      el("div", { id: "dayBriefContent", class: "day-brief__scroll" }, [
        el("ol", { class: "day-brief__timeline" }, timeline),
        el("div", { class: "day-food" }, [el("h3", { text: "Food options" }), ...meals])
      ])
    );
  }

  function toggleBriefCollapsed() {
    isBriefCollapsed = !isBriefCollapsed;
    const day = days.find((entry) => entry.n === activeDay);
    const plan = dayMaps[activeDay];
    if (day && plan) renderBrief(day, plan);
  }

  function decodePolyline6(encoded) {
    let index = 0, lat = 0, lng = 0;
    const points = [];
    while (index < encoded.length) {
      let result = 0, shift = 0, byte;
      do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 31) << shift; shift += 5; } while (byte >= 32);
      lat += (result & 1) ? ~(result >> 1) : (result >> 1);
      result = 0; shift = 0;
      do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 31) << shift; shift += 5; } while (byte >= 32);
      lng += (result & 1) ? ~(result >> 1) : (result >> 1);
      points.push([lat / 1e6, lng / 1e6]);
    }
    return points;
  }

  async function routedGeometry(a, b) {
    const modeText = (b.mode || "").toLowerCase();
    const routeKey = b.railKey || JSON.stringify(b.via || []);
    const key = `${a.coords.join(",")}|${b.coords.join(",")}|${modeText}|${routeKey}`;
    if (routeCache.has(key)) return routeCache.get(key);

    const isRail = /train|metro|subway|jr |shinkansen|shinano|yamanote|monorail|keikyu/.test(modeText);
    const isFoot = /walk/.test(modeText);
    let points;
    try {
      if (isRail && b.railKey && typeof railGeometry !== "undefined" && railGeometry[b.railKey]) {
        points = railGeometry[b.railKey];
      } else if (isRail && Array.isArray(b.via) && b.via.length) {
        // Short urban lines can use curated station geometry when no complete
        // OpenStreetMap railway relation is attached to the stop.
        points = [a.coords, ...b.via, b.coords];
      } else if (isRail) {
        const request = {
          locations: [
            { lat: a.coords[0], lon: a.coords[1] },
            { lat: b.coords[0], lon: b.coords[1] }
          ],
          costing: "multimodal",
          directions_options: { units: "kilometers" }
        };
        const response = await fetch(`https://valhalla1.openstreetmap.de/route?json=${encodeURIComponent(JSON.stringify(request))}`);
        if (!response.ok) throw new Error("Rail route unavailable");
        const json = await response.json();
        const shapes = (json.trip?.legs || []).map((leg) => decodePolyline6(leg.shape));
        points = shapes.flat();
      } else {
        const server = isFoot
          ? "https://routing.openstreetmap.de/routed-foot/route/v1/driving"
          : "https://router.project-osrm.org/route/v1/driving";
        const coords = `${a.coords[1]},${a.coords[0]};${b.coords[1]},${b.coords[0]}`;
        const response = await fetch(`${server}/${coords}?overview=full&geometries=geojson`);
        if (!response.ok) throw new Error("Street route unavailable");
        const json = await response.json();
        points = json.routes?.[0]?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]);
      }
      if (!points || points.length < 2) throw new Error("Empty route");
    } catch (_) {
      points = [a.coords, b.coords];
    }
    routeCache.set(key, points);
    return points;
  }

  async function draw(day, plan, focus = null) {
    const version = ++drawVersion;
    layer.clearLayers();
    const isPlaceFocus = focus?.type === "place";
    const start = focus?.type === "travel" ? Math.max(0, focus.start) : 0;
    const end = focus?.type === "travel" ? Math.min(plan.stops.length - 2, focus.end) : plan.stops.length - 2;
    const visibleStops = isPlaceFocus
      ? [plan.stops[focus.stop]]
      : focus ? plan.stops.slice(start, end + 2) : plan.stops;
    const bounds = L.latLngBounds(visibleStops.map((s) => s.coords));
    const legIndexes = [];
    if (!isPlaceFocus) {
      for (let i = start; i <= end; i += 1) legIndexes.push(i);
    }
    const legs = await Promise.all(legIndexes.map((i) =>
      routedGeometry(plan.stops[i], plan.stops[i + 1]).then((points) => ({ a: plan.stops[i], b: plan.stops[i + 1], points }))
    ));
    if (version !== drawVersion) return;
    for (const { a, b, points } of legs) {
      points.forEach((point) => bounds.extend(point));
      const mode = b.modeClass || "local";
      const style = LINE[mode] || LINE.local;
      L.polyline(points, { color: "#fff", weight: style.weight + 5, opacity: .92 }).addTo(layer);
      const legLine = L.polyline(points, {
        color: style.color,
        weight: style.weight,
        dashArray: style.dashArray,
        opacity: .98,
        className: `day-route-line mode-${mode}`
      }).addTo(layer);
      const label = transportLabel(a, b, style.label);
      legLine.bindTooltip(label, {
        permanent: true,
        direction: "center",
        className: `transport-label transport-label--${mode}`,
        opacity: 1
      });
    }
    visibleStops.forEach((stop) => {
      const i = plan.stops.indexOf(stop);
      const marker = L.marker(stop.coords, {
        icon: icon(stop, i),
        keyboard: true,
        title: stop.label,
        zIndexOffset: stop.kind === "hotel" ? 2000 : 0
      }).addTo(layer);
      const prev = plan.stops[i - 1];
      const transport = prev && stop.mode ? transportLabel(prev, stop, stop.mode) : stop.mode;
      marker.bindPopup(stopPopup(stop, transport));
    });
    if (isPlaceFocus) map.setView(visibleStops[0].coords, 16, { animate: true });
    else if (bounds.isValid()) map.fitBounds(bounds.pad(plan.stops.length === 1 ? 1.8 : .28), { animate: true, maxZoom: 14 });
  }

  function select(n) {
    const day = days.find((d) => d.n === n);
    const plan = dayMaps[n];
    if (!day || !plan) return;
    activeDay = n;
    activeFocus = null;
    renderPicker();
    renderBrief(day, plan);
    draw(day, plan);
  }

  function selectFocus(focus) {
    const day = days.find((d) => d.n === activeDay);
    const plan = dayMaps[activeDay];
    if (!day || !plan) return;
    activeFocus = focus;
    renderBrief(day, plan);
    draw(day, plan, focus);
  }

  function sameFocus(a, b) {
    if (!a || !b || a.type !== b.type) return false;
    if (a.type === "travel") return a.start === b.start && a.end === b.end;
    return a.stop === b.stop;
  }

  function toggleFocus(focus) {
    if (sameFocus(activeFocus, focus)) select(activeDay);
    else selectFocus(focus);
  }

  function show() {
    map = MapView.getMap();
    MapView.showRoute(false);
    if (!map.hasLayer(layer)) layer.addTo(map);
    host.hidden = false;
    document.body.classList.add("is-day-view");
    select(activeDay);
  }

  function hide() {
    host.hidden = true;
    document.body.classList.remove("is-day-view");
    if (map?.hasLayer(layer)) map.removeLayer(layer);
    MapView.showRoute(true);
    MapView.fitAll();
  }

  return { show, hide, select };
})();
