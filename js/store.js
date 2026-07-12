/* =============================================================================
   store.js — localStorage persistence
   Static itinerary lives in data.js; only actual spend persists here.
============================================================================= */

const Store = (() => {
  const KEY = "japan2028:v1";

  const empty = { actuals: {} };

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...empty };
      const parsed = JSON.parse(raw);
      return {
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
