/* =============================================================================
   tabs.js — full-screen panels: Budget, Checklists, Bookings.
   User edits (ticks, actual spend) persist via Store.
============================================================================= */

const Tabs = (() => {
  const panel = document.getElementById("panel");
  const panelTitle = document.getElementById("panelTitle");
  const panelBody = document.getElementById("panelBody");

  const byId = Object.fromEntries(locations.map((l) => [l.id, l]));
  const segColor = (k) => (segments[k] && segments[k].color) || segments.transit.color;
  const TARGET = 20000; // ~A$20k overall trip target

  function reveal(title) {
    panelTitle.textContent = title;
    panelBody.scrollTop = 0;
    panel.hidden = false;
  }
  function hide() { panel.hidden = true; }

  /* ---------------- Budget ---------------- */
  function budget_() {
    panelBody.innerHTML = "";

    const hero = el("div", { class: "budget-hero" });
    const heroPlanned = el("span", { class: "budget-hero__big" });
    const heroActual = el("span", { class: "budget-hero__sub" });
    const fill = el("div", { class: "budget-hero__fill" });
    hero.appendChild(el("div", { class: "budget-hero__row" }, [
      el("span", { class: "budget-hero__lbl", text: "Planned (pre-bookable)" }),
      el("span", { class: "budget-hero__lbl", text: "Actual so far" }),
    ]));
    hero.appendChild(el("div", { class: "budget-hero__row" }, [heroPlanned, heroActual]));
    hero.appendChild(el("div", { class: "budget-hero__bar" }, [fill]));
    panelBody.appendChild(hero);
    panelBody.appendChild(el("p", { class: "summary-line", style: "margin-top:12px",
      text: `Target for the whole trip ≈ ${Fmt.money(TARGET)}. Incidentals / spending money sit on top of the figures below.` }));

    // group by category, preserving first-seen order
    const cats = [];
    const catMap = {};
    for (const b of budget) {
      if (!catMap[b.category]) { catMap[b.category] = []; cats.push(b.category); }
      catMap[b.category].push(b);
    }

    const catTotalEls = {};
    for (const cat of cats) {
      const totEl = el("span", { class: "cat__tot" });
      catTotalEls[cat] = totEl;
      const wrap = el("div", { class: "cat" }, [
        el("div", { class: "cat__head" }, [el("span", { class: "cat__name", text: cat }), totEl]),
      ]);
      for (const b of catMap[cat]) {
        const input = el("input", {
          class: "bline__input",
          type: "number",
          inputmode: "decimal",
          min: "0",
          "aria-label": "Actual spend for " + b.label,
          placeholder: "—",
        });
        const saved = Store.getActual(b.id);
        if (saved != null) input.value = saved;
        input.addEventListener("input", () => {
          const v = input.value === "" ? null : parseFloat(input.value);
          Store.setActual(b.id, v);
          recompute();
        });
        wrap.appendChild(el("div", { class: "bline" }, [
          el("span", { class: "bline__label", text: b.label }),
          el("span", { class: "bline__planned", text: "Plan " + Fmt.money(b.planned) }),
          el("span", { class: "bline__actual" }, [el("label", { text: "A$" }), input]),
        ]));
      }
      panelBody.appendChild(wrap);
    }

    function recompute() {
      const planned = budget.reduce((s, b) => s + (b.planned || 0), 0);
      let actual = 0;
      for (const b of budget) { const a = Store.getActual(b.id); if (a != null) actual += a; }
      heroPlanned.textContent = Fmt.money(planned);
      heroActual.textContent = actual > 0 ? Fmt.money(actual) : "—";
      fill.style.width = Math.min(100, (actual / TARGET) * 100) + "%";
      for (const cat of cats) {
        const items = catMap[cat];
        const p = items.reduce((s, b) => s + (b.planned || 0), 0);
        let a = 0, any = false;
        for (const b of items) { const v = Store.getActual(b.id); if (v != null) { a += v; any = true; } }
        catTotalEls[cat].textContent = any ? `${Fmt.money(a)} / ${Fmt.money(p)}` : Fmt.money(p);
      }
    }
    recompute();
  }

  /* ---------------- Checklists ---------------- */
  function checklists_() {
    panelBody.innerHTML = "";
    const listWrap = el("div", {});
    const toggle = el("div", { class: "seg-toggle" });
    const btnPack = el("button", { type: "button", text: `Packing (${checklists.packing.length})` });
    const btnPrep = el("button", { type: "button", text: `Prep (${checklists.prep.length})` });
    toggle.append(btnPrep, btnPack);
    panelBody.append(toggle, listWrap);

    function row(item, withDue) {
      const done = Store.isDone(item.id, item.done);
      const input = el("input", { type: "checkbox", "aria-label": item.label });
      input.checked = done;
      const rowEl = el("label", { class: "check" + (done ? " is-done" : "") }, [
        input,
        el("span", { class: "check__box", html: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' }),
        el("span", { class: "check__body" }, [
          el("span", { class: "check__label", text: item.label }),
          withDue && item.due ? dueEl(item.due) : null,
        ]),
      ]);
      input.addEventListener("change", () => {
        Store.setDone(item.id, input.checked);
        rowEl.classList.toggle("is-done", input.checked);
      });
      return rowEl;
    }

    function dueEl(due) {
      const days = Fmt.daysUntil(due);
      const soon = days != null && days <= 45;
      const txt = days != null && days >= 0
        ? `Due ${Fmt.shortDate(due)} · ${days} day${days === 1 ? "" : "s"} away`
        : `Due ${Fmt.shortDate(due)}`;
      return el("span", { class: "check__due " + (soon ? "is-soon" : "is-ok"), text: txt });
    }

    function show(which) {
      const isPrep = which === "prep";
      btnPrep.classList.toggle("is-active", isPrep);
      btnPack.classList.toggle("is-active", !isPrep);
      listWrap.innerHTML = "";
      const items = isPrep
        ? [...checklists.prep].sort((a, b) => (a.due || "").localeCompare(b.due || ""))
        : checklists.packing;
      if (!items.length) {
        listWrap.appendChild(el("div", { class: "empty", text: "Nothing here yet." }));
        return;
      }
      items.forEach((it) => listWrap.appendChild(row(it, isPrep)));
    }

    btnPrep.addEventListener("click", () => show("prep"));
    btnPack.addEventListener("click", () => show("packing"));
    show("prep");
  }

  /* ---------------- Bookings ---------------- */
  function bookings_() {
    panelBody.innerHTML = "";
    panelBody.appendChild(el("p", { class: "summary-line",
      text: "Confirmations by stop. Add references to each location's bookings in data.js as you lock things in." }));

    const bases = locations.filter((l) => l.type === "base");
    for (const loc of bases) {
      const block = el("div", { class: "book-loc" }, [
        el("div", { class: "book-loc__head" }, [
          el("span", { class: "book-loc__dot", style: "background:" + segColor(loc.segment) }),
          el("span", { class: "book-loc__name", text: loc.name }),
          el("span", { class: "book-loc__dates", text: Fmt.dateRange(loc.arrive, loc.depart) }),
        ]),
      ]);
      const list = Array.isArray(loc.bookings) ? loc.bookings : [];
      if (!list.length) {
        block.appendChild(el("div", { class: "empty" }, [
          el("span", { html: '<svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Z"/></svg>' }),
          el("div", { text: "No bookings saved yet." }),
        ]));
      } else {
        list.forEach((b) => block.appendChild(el("div", { class: "booking" }, [
          el("div", { style: "font-weight:800;font-size:0.9rem", text: b.title || b.label || "Booking" }),
          b.ref ? el("div", { style: "font-size:0.8rem;color:var(--ink-soft);margin-top:2px", text: "Ref: " + b.ref }) : null,
          b.time ? el("div", { style: "font-size:0.8rem;color:var(--muted);margin-top:2px", text: b.time }) : null,
        ])));
      }
      panelBody.appendChild(block);
    }
  }

  function open(view) {
    if (view !== "budget" && view !== "checklists" && view !== "bookings") return;
    // Register (and close any prior overlay) BEFORE revealing this one,
    // otherwise a panel→panel switch would re-hide what we just built.
    App.openOverlay(hide);
    if (view === "budget") { reveal("Budget"); budget_(); }
    else if (view === "checklists") { reveal("Checklists"); checklists_(); }
    else if (view === "bookings") { reveal("Bookings"); bookings_(); }
  }

  return { open, hide };
})();
