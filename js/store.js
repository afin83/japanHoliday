/* =============================================================================
   store.js — localStorage persistence
   Static itinerary lives in data.js; only user state persists here:
   checklist ticks + actual spend, keyed by item id.
============================================================================= */

const Store = (() => {
  const KEY = "japan2028:v1";

  const empty = { checks: {}, actuals: {} };

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...empty };
      const parsed = JSON.parse(raw);
      return {
        checks: parsed.checks || {},
        actuals: parsed.actuals || {},
      };
    } catch (e) {
      // Private mode / disabled storage — fall back to in-memory only.
      console.warn("Store: localStorage unavailable, using memory only.", e);
      return { ...empty };
    }
  }

  let state = read();

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Store: could not persist.", e);
    }
  }

  return {
    /* Checklist done-state ---------------------------------------------- */
    isDone(id, fallback = false) {
      return id in state.checks ? !!state.checks[id] : fallback;
    },
    setDone(id, done) {
      state.checks[id] = !!done;
      persist();
    },

    /* Actual spend ------------------------------------------------------ */
    getActual(id) {
      const v = state.actuals[id];
      return typeof v === "number" ? v : null;
    },
    setActual(id, value) {
      if (value === null || value === "" || Number.isNaN(value)) {
        delete state.actuals[id];
      } else {
        state.actuals[id] = Number(value);
      }
      persist();
    },
  };
})();
