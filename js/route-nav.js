/* =============================================================================
   route-nav.js — Route-view location switcher.
   A horizontal pill row (mirrors the Day view's day picker). Tapping a pill
   opens that location's detail — identical to tapping its map marker.
============================================================================= */

const RouteNav = (() => {
  const host = document.getElementById("routePicker");
  const mapped = locations.filter((l) => !l.offMap); // only pins that exist on the map
  const segColor = (k) => (segments[k] && segments[k].color) || segments.transit.color;
  const TYPE = { base: "Base", airport: "Airport", waypoint: "Change", origin: "Home", activity: "Stop" };
  let buttons = {};

  // "Tokyo — Shinjuku" -> "Tokyo"; "Kansai Airport (KIX)" -> "Kansai Airport"
  function shortName(loc) {
    return loc.name.split(/\s+[—(]/)[0].trim();
  }
  function subLabel(loc) {
    if (loc.nights) return `${loc.nights} night${loc.nights > 1 ? "s" : ""}`;
    return TYPE[loc.type] || "";
  }

  function build() {
    if (!host) return;
    host.innerHTML = "";
    buttons = {};
    mapped.forEach((loc) => {
      const btn = el("button", {
        type: "button",
        "aria-label": `Show ${loc.name}`,
        onclick: () => Sheets.openLocation(loc.id),
      }, [
        el("span", { class: "route-picker__top" }, [
          el("span", { class: "route-picker__dot", style: "background:" + segColor(loc.segment) }),
          el("b", { text: shortName(loc) }),
        ]),
        el("span", { class: "route-picker__sub", text: subLabel(loc) }),
      ]);
      buttons[loc.id] = btn;
      host.appendChild(btn);
    });
  }

  function setActive(id) {
    for (const [key, btn] of Object.entries(buttons)) {
      const on = key === id;
      btn.classList.toggle("is-active", on);
      if (on) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  function clear() {
    for (const btn of Object.values(buttons)) btn.classList.remove("is-active");
  }

  function show() { if (host) host.hidden = false; }
  function hide() { if (host) host.hidden = true; }

  function init() { build(); show(); }

  return { init, setActive, clear, show, hide };
})();
