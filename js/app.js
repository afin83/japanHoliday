/* =============================================================================
   app.js — bootstrap, bottom-nav, and a single-overlay history controller
   (so the phone's Back button / swipe closes an open sheet or panel).
============================================================================= */

const App = (() => {
  let activeClose = null; // fn that hides whatever overlay is currently open

  /* One overlay at a time. Opening while one is open replaces it without
     touching history; going none -> open pushes exactly one history entry. */
  function openOverlay(closeFn) {
    if (activeClose) {
      const prev = activeClose;
      activeClose = null;
      prev();
    } else {
      history.pushState({ overlay: true }, "");
    }
    activeClose = closeFn;
  }

  function closeOverlay(viaPop) {
    if (!activeClose) return;
    const fn = activeClose;
    activeClose = null;
    fn();
    setActiveTab("map");
    if (!viaPop) history.back();
  }

  function hasOverlay() { return !!activeClose; }

  /* ---------- nav ---------- */
  function setActiveTab(view) {
    document.querySelectorAll(".tabbar__btn").forEach((b) => {
      const on = b.dataset.view === view;
      b.classList.toggle("is-active", on);
      if (on) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  function onTab(view) {
    if (view === "map") {
      if (activeClose) closeOverlay(false);
      if (!document.body.classList.contains("is-day-view")) MapView.fitAll();
      setActiveTab("map");
      return;
    }
    setActiveTab(view);
    Tabs.open(view); // registers its own overlay
  }

  /* ---------- trip strip ---------- */
  function fillTripStrip() {
    document.getElementById("tripTitle").textContent = trip.title.replace(" — Family Trip", "");
  }

  /* ---------- wiring ---------- */
  function wire() {
    document.querySelectorAll("[data-map-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mapMode;
        document.querySelectorAll("[data-map-mode]").forEach((other) => {
          const on = other.dataset.mapMode === mode;
          other.classList.toggle("is-active", on);
          other.setAttribute("aria-pressed", String(on));
        });
        if (activeClose) closeOverlay(false);
        if (mode === "day") { DayView.show(); RouteNav.hide(); }
        else { DayView.hide(); RouteNav.show(); }
      });
    });
    document.querySelectorAll(".tabbar__btn").forEach((btn) => {
      btn.addEventListener("click", () => onTab(btn.dataset.view));
    });

    document.getElementById("sheetClose").addEventListener("click", () => closeOverlay(false));
    document.getElementById("panelClose").addEventListener("click", () => closeOverlay(false));
    document.getElementById("scrim").addEventListener("click", () => closeOverlay(false));
    document.getElementById("recenterBtn").addEventListener("click", () => MapView.fitAll());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && activeClose) closeOverlay(false);
    });

    window.addEventListener("popstate", () => { if (activeClose) closeOverlay(true); });
    window.addEventListener("resize", () => MapView.invalidate());
  }

  function init() {
    fillTripStrip();
    MapView.init();
    RouteNav.init();
    wire();
    // Leaflet occasionally needs a nudge once layout settles.
    setTimeout(() => MapView.invalidate(), 200);
  }

  return { init, openOverlay, closeOverlay, hasOverlay, setActiveTab };
})();

document.addEventListener("DOMContentLoaded", App.init);
