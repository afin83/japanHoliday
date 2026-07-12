/* =============================================================================
   map.js — Leaflet map: segment-coloured pins + annotated route lines.
   The map is the home screen. Tap a pin -> location sheet; tap a line -> leg.
============================================================================= */

const MapView = (() => {
  let map;
  const routeLayer = L.layerGroup();
  const markers = {};   // locationId -> Leaflet marker
  const poiLayer = L.layerGroup();
  const lines = [];     // { leg, layer }
  let selectedId = null;
  let baseBounds = null;

  const byId = Object.fromEntries(locations.map((l) => [l.id, l]));

  /* modeClass -> polyline style */
  const LINE_STYLE = {
    bullet:            { weight: 5, dashArray: null },
    "limited-express": { weight: 4, dashArray: null },
    coach:             { weight: 4, dashArray: "9 7" },
    transfer:          { weight: 3, dashArray: "2 8" },
    local:             { weight: 3, dashArray: "4 6" },
  };

  function segColor(segKey) {
    return (segments[segKey] && segments[segKey].color) || segments.transit.color;
  }

  function compactDuration(min) {
    if (min == null || Number.isNaN(min)) return "";
    if (min < 60) return `${Math.round(min)}min`;
    const hours = min / 60;
    return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}hr`;
  }

  function transportLabel(leg) {
    const duration = compactDuration(leg.durationMin);
    return duration ? `${leg.mode} · ${duration}` : leg.mode;
  }

  /* Base pins are numbered in route order; others get a small dot. */
  function baseNumbers() {
    const nums = {};
    let n = 0;
    for (const l of locations) if (l.type === "base") nums[l.id] = ++n;
    return nums;
  }

  function makeIcon(loc, num) {
    const color = segColor(loc.segment);
    const isBase = loc.type === "base";
    const cls = isBase ? "pin pin--base" : `pin pin--${loc.type}`;
    const size = isBase ? 30 : 20;
    const label = isBase ? `<span class="pin__label">${loc.name}</span>` : "";
    const inner = isBase ? num : "";
    return L.divIcon({
      className: "",
      html: `<div class="${cls}" style="background:${color}">${inner}${label}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  function init() {
    map = L.map("map", {
      zoomControl: false,
      attributionControl: true,
      tap: true,
    });
    // Establish a view immediately so Leaflet "loads" and renders tiles/markers.
    map.setView([36.2, 138.2], 6);
    routeLayer.addTo(map);

    const tiles = L.tileLayer(
      "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Graceful fallback if the CARTO CDN is ever unreachable.
    let swapped = false;
    tiles.on("tileerror", () => {
      if (swapped) return;
      swapped = true;
      map.removeLayer(tiles);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
    });

    L.control.zoom({ position: "bottomleft" }).addTo(map);

    drawLines();
    drawMarkers();
    poiLayer.addTo(map);

    // Fit to everything on-map (excludes off-map Brisbane).
    const pts = locations.filter((l) => !l.offMap).map((l) => l.coords);
    baseBounds = L.latLngBounds(pts).pad(0.12);
    map.fitBounds(baseBounds); // synchronous first fit (no animation)
  }

  function drawLines() {
    const ordered = legs.filter((leg) => leg.mapLine !== false);
    for (const leg of ordered) {
      const from = byId[leg.from];
      const to = byId[leg.to];
      if (!from || !to) continue;

      const color = segColor(to.segment);
      const style = LINE_STYLE[leg.modeClass] || LINE_STYLE.local;

      // Halo underneath for legibility on the light basemap.
      L.polyline([from.coords, to.coords], {
        color: "#ffffff",
        weight: style.weight + 3,
        opacity: 0.85,
        lineCap: "round",
      }).addTo(routeLayer);

      const layer = L.polyline([from.coords, to.coords], {
        color,
        weight: style.weight,
        opacity: 0.95,
        dashArray: style.dashArray,
        lineCap: "round",
        className: "route-line",
      }).addTo(routeLayer);
      layer.bindTooltip(transportLabel(leg), {
        permanent: true,
        direction: "center",
        className: `transport-label transport-label--${leg.modeClass || "local"}`,
        opacity: 1
      });

      // Fat invisible hit-area so lines are easy to tap on a phone.
      const hit = L.polyline([from.coords, to.coords], {
        color: "#000",
        weight: 22,
        opacity: 0,
      }).addTo(routeLayer);
      hit.on("click", () => Sheets.openLeg(leg.id));
      layer.on("click", () => Sheets.openLeg(leg.id));

      lines.push({ leg, layer });
    }
  }

  function drawMarkers() {
    const nums = baseNumbers();
    for (const loc of locations) {
      if (loc.offMap) continue;
      const marker = L.marker(loc.coords, {
        icon: makeIcon(loc, nums[loc.id]),
        keyboard: true,
        title: loc.name,
        riseOnHover: true,
        zIndexOffset: loc.type === "base" ? 400 : 0,
      }).addTo(routeLayer);
      marker.on("click", () => Sheets.openLocation(loc.id));
      markers[loc.id] = marker;
    }
  }

  /* Show a base's points of interest as light secondary markers. */
  function showPois(loc) {
    poiLayer.clearLayers();
    if (!loc || !Array.isArray(loc.poi)) return;
    for (const p of loc.poi) {
      const m = L.marker(p.coords, {
        icon: L.divIcon({
          className: "",
          html: `<div class="pin pin--poi" title="${p.name}"></div>`,
          iconSize: [13, 13],
          iconAnchor: [6.5, 6.5],
        }),
        title: p.name,
      })
        .bindTooltip(p.name, { direction: "top", offset: [0, -8], className: "poi-tip" })
        .bindPopup(`<b>${escapeHtml(p.name)}</b><br>${googleSearchLinkHtml(`${p.name} Japan`)}`);
      poiLayer.addLayer(m);
    }
  }

  function clearPois() {
    poiLayer.clearLayers();
  }

  function selectLocation(id, { pan = true } = {}) {
    // clear previous
    if (selectedId && markers[selectedId]) {
      const prev = markers[selectedId].getElement();
      if (prev) prev.querySelector(".pin")?.classList.remove("is-selected");
    }
    selectedId = id;
    const loc = byId[id];
    if (!loc) return;
    const cur = markers[id]?.getElement();
    if (cur) cur.querySelector(".pin")?.classList.add("is-selected");
    showPois(loc);
    if (pan) {
      const target = L.latLng(loc.coords);
      map.flyTo(target, Math.max(map.getZoom(), 9), { duration: 0.5 });
    }
  }

  function deselect() {
    if (selectedId && markers[selectedId]) {
      markers[selectedId].getElement()?.querySelector(".pin")?.classList.remove("is-selected");
    }
    selectedId = null;
    clearPois();
  }

  function highlightLeg(id) {
    for (const { leg, layer } of lines) {
      const on = leg.id === id;
      layer.setStyle({ opacity: on ? 1 : 0.5, weight: (LINE_STYLE[leg.modeClass] || LINE_STYLE.local).weight + (on ? 2 : 0) });
      if (on) layer.bringToFront();
    }
    const leg = legs.find((l) => l.id === id);
    if (leg) {
      const from = byId[leg.from], to = byId[leg.to];
      if (from && to) map.flyToBounds(L.latLngBounds([from.coords, to.coords]).pad(0.4), { duration: 0.5 });
    }
  }

  function clearLegHighlight() {
    for (const { leg, layer } of lines) {
      layer.setStyle({ opacity: 0.95, weight: (LINE_STYLE[leg.modeClass] || LINE_STYLE.local).weight });
    }
  }

  function fitAll() {
    if (baseBounds) map.flyToBounds(baseBounds, { duration: 0.5 });
    deselect();
    clearLegHighlight();
  }

  function invalidate() {
    if (map) map.invalidateSize();
  }

  function showRoute(show) {
    if (!map) return;
    if (show && !map.hasLayer(routeLayer)) routeLayer.addTo(map);
    if (!show && map.hasLayer(routeLayer)) map.removeLayer(routeLayer);
    if (!show) deselect();
  }

  function getMap() { return map; }

  return {
    init, fitAll, invalidate,
    selectLocation, deselect,
    highlightLeg, clearLegHighlight,
    byId, showRoute, getMap,
  };
})();
