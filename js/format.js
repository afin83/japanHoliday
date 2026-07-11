/* =============================================================================
   format.js — small shared formatting + DOM helpers (no dependencies)
============================================================================= */

const Fmt = {
  /* "2028-01-07" -> "Fri 7 Jan" */
  shortDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (Number.isNaN(d.getTime())) return iso;
    const wd = d.toLocaleDateString("en-AU", { weekday: "short" });
    const day = d.getDate();
    const mon = d.toLocaleDateString("en-AU", { month: "short" });
    return `${wd} ${day} ${mon}`;
  },

  /* "2028-01-07" + "2028-01-10" -> "7–10 Jan 2028" */
  dateRange(fromIso, toIso) {
    if (!fromIso) return "";
    const a = new Date(fromIso + "T00:00:00");
    const b = toIso ? new Date(toIso + "T00:00:00") : null;
    const day = (d) => d.getDate();
    const mon = (d) => d.toLocaleDateString("en-AU", { month: "short" });
    const yr = (d) => d.getFullYear();
    if (!b) return `${day(a)} ${mon(a)} ${yr(a)}`;
    if (mon(a) === mon(b) && yr(a) === yr(b)) return `${day(a)}–${day(b)} ${mon(a)} ${yr(a)}`;
    return `${day(a)} ${mon(a)} – ${day(b)} ${mon(b)} ${yr(b)}`;
  },

  /* 90 -> "1h 30m", 50 -> "50m" */
  duration(min) {
    if (min == null) return "—";
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  },

  /* AUD, no cents */
  money(n) {
    if (n == null) return "—";
    return "$" + Math.round(n).toLocaleString("en-AU");
  },

  km(n) {
    if (n == null) return "—";
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k km` : `${n} km`;
  },

  /* Days until an ISO date from today (negative = past) */
  daysUntil(iso) {
    if (!iso) return null;
    const target = new Date(iso + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((target - now) / 86400000);
  },
};

/* Tiny DOM builder: el("div", {class:"x"}, [child, "text"]) */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else node.setAttribute(k, v);
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const c of kids) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}
