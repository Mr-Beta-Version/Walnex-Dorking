
"use strict";

const state = {
  domain: "",
  searchFilter: "",
  activeTag: null, // string | null
  categoriesExpanded: false, // category pills toggle (default collapsed)
};

function extractDomain(raw) {
  let v = raw.trim();
  if (!v) return v;
  v = v.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, ""); // strip scheme (https://, ftp://, ...)
  v = v.split(/[\/?#]/)[0]; // strip path, query string, hash
  v = v.replace(/^www\./i, ""); // strip a leading "www."
  return v;
}

function getAllTags() {
  const tags = new Set();
  dorkCategories.forEach((cat) => cat.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

function tagCount(tag) {
  return dorkCategories.filter((c) => c.tags.includes(tag)).length;
}

/** Categories matching the current search + active tag (mirrors filter useMemo). */
function filteredCategories() {
  const s = state.searchFilter.toLowerCase();
  return dorkCategories.filter((cat) => {
    const matchesSearch =
      state.searchFilter === "" ||
      cat.name.toLowerCase().includes(s) ||
      cat.description.toLowerCase().includes(s) ||
      cat.tags.some((t) => t.toLowerCase().includes(s));
    const matchesTag = state.activeTag === null || cat.tags.includes(state.activeTag);
    return matchesSearch && matchesTag;
  });
}

/* ------------------------------ Utilities ------------------------------- */

/** Escape user-supplied strings before injecting into innerHTML. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Small on-screen notice (used when the browser blocks pop-up tabs). */
let toastTimer = null;
function showToast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 9000);
}


function openUrls(urls) {
  let blocked = 0;
  urls.forEach((url) => {
    const w = window.open(url, "_blank");
    if (w) {
      try {
        w.opener = null;
      } catch (e) {
        /* ignore */
      }
    } else {
      blocked++;
    }
  });
  if (blocked > 0 && urls.length > 1) {
    showToast(
      "Your browser blocked " + blocked + " of " + urls.length +
        " tabs. Allow pop-ups for this site (icon in the address bar), then click again."
    );
  }
}

/** Build + open the dork URL (mirrors handleDorkClick in App.tsx). */
function openDork(category) {
  const targetDomain = state.domain.trim();
  if (!targetDomain) {
    warnNoDomain();
    return;
  }
  openUrls([category.url(targetDomain)]);
}

/** Open a batch of currently-filtered dork URLs in new tabs (10 per batch). */
function openBatch(start, end) {
  const targetDomain = state.domain.trim();
  if (!targetDomain) {
    warnNoDomain();
    return;
  }
  const list = filteredCategories().slice(start, end);
  openUrls(list.map((c) => c.url(targetDomain)));
}

/** Show a warning and focus the domain field when no target domain is set. */
function warnNoDomain() {
  showToast("Please enter a target domain first.");
  const input = document.getElementById("domain-input");
  if (input) input.focus();
}

/* ------------------------------- Rendering ------------------------------ */

/** HTML for a single dork card (mirrors DorkCard in App.tsx). */
function dorkCardHtml(category) {
  const hasDomain = state.domain.trim() !== "";
  const tagsHtml = category.tags
    .map((t) => `<span class="card-tag">${escapeHtml(t)}</span>`)
    .join("");
  const readyHtml = hasDomain
    ? '<span class="ready-badge"><span class="ready-dot"></span>ready</span>'
    : "";

  return (
    '<button type="button" class="dork-card" data-id="' +
      escapeHtml(category.id) +
      '">' +
      '<div class="card-glow"></div>' +
      '<div class="card-body">' +
      '<div class="card-head">' +
      `<h3 class="card-title">${escapeHtml(category.name)}</h3>` +
      '<svg class="card-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" ' +
      'd="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />' +
      "</svg>" +
      "</div>" +
      `<p class="card-desc line-clamp-2">${escapeHtml(category.description)}</p>` +
      `<div class="card-tags">${tagsHtml}</div>` +
      readyHtml +
      "</div>" +
      "</button>"
  );
}

function renderTags() {
  const el = document.getElementById("tags-row");
  let html =
    '<button type="button" class="tag-btn' +
    (state.activeTag === null ? " active" : " inactive") +
    (state.activeTag === null ? '" aria-pressed="true"' : '" aria-pressed="false"') +
    ' data-tag="">All (' +
    dorkCategories.length +
    ")</button>";

  getAllTags().forEach((tag) => {
    const active = state.activeTag === tag;
    html +=
      '<button type="button" class="tag-btn' +
      (active ? " active" : " inactive") +
      (active ? '" aria-pressed="true"' : '" aria-pressed="false"') +
      ' data-tag="' +
      escapeHtml(tag) +
      '">' +
      escapeHtml(tag) +
      " (" +
      tagCount(tag) +
      ")</button>";
  });

  el.innerHTML = html;
}

/** Render the category toggle + the collapsed active-filter chip. */
function renderCategories() {
  const toggle = document.getElementById("categories-toggle");
  const count = document.getElementById("categories-count");
  const tagsRow = document.getElementById("tags-row");
  const chip = document.getElementById("active-tag-chip");

  toggle.setAttribute("aria-expanded", String(state.categoriesExpanded));
  count.textContent = String(getAllTags().length);
  tagsRow.hidden = !state.categoriesExpanded;

  if (state.activeTag === null) {
    chip.hidden = true;
    chip.innerHTML = "";
  } else {
    chip.hidden = false;
    chip.innerHTML =
      '<span class="active-tag-name">' +
      escapeHtml(state.activeTag) +
      "</span>" +
      '<button type="button" class="active-tag-clear" ' +
      'title="Clear category filter" aria-label="Clear ' +
      escapeHtml(state.activeTag) +
      ' filter">\u2715</button>';
  }
}

function renderGrid() {
  document.getElementById("dork-grid").innerHTML = filteredCategories()
    .map(dorkCardHtml)
    .join("");
}

function renderResults() {
  const shown = filteredCategories().length;
  document.getElementById("shown-count").innerHTML = String(shown);
  document.getElementById("total-count").innerHTML = String(dorkCategories.length);

  // Batch-open buttons (10 tabs each) follow the current filter results
  renderBulkOpen();
}

/** Render one "Tabs a-b" button per batch of 10 in the filtered results. */
function renderBulkOpen() {
  const container = document.getElementById("bulk-open-row");
  const list = filteredCategories().length;
  if (list === 0) {
    container.innerHTML = "";
    return;
  }
  const BATCH = 10;
  let html = "";
  for (let start = 0; start < list; start += BATCH) {
    const end = Math.min(start + BATCH, list);
    html +=
      '<button type="button" class="bulk-open-btn" data-start="' +
      start +
      '" data-end="' +
      end +
      '" title="Open tabs ' +
      (start + 1) +
      "-" +
      end +
      ' in new tabs">' +
      "Tabs " +
      (start + 1) +
      "-" +
      end +
      "</button>";
  }
  container.innerHTML = html;
}

function renderEmpty() {
  document.getElementById("empty-state").hidden = filteredCategories().length !== 0;
}

function renderDomain() {
  const hasDomain = state.domain.trim() !== "";
  document.getElementById("clear-domain").hidden = !hasDomain;

  const hint = document.getElementById("domain-hint");
  hint.hidden = !hasDomain;
  hint.innerHTML = hasDomain
    ? `Target: <code>${escapeHtml(state.domain)}</code>`
    : "";
}

function renderAll() {
  renderCategories();
  renderTags();
  renderGrid();
  renderResults();
  renderEmpty();
  renderDomain();
}

/* -------------------------------- Events -------------------------------- */

function onDomainInput(e) {
  const raw = e.target.value;
  const clean = extractDomain(raw);
  if (clean !== raw) {
    e.target.value = clean; // reflect the normalized value back into the field
  }
  state.domain = clean;
  renderDomain();
  renderGrid(); // refresh "ready" badges (domain presence drives them)
}

/** Also normalize on paste, in case the pasted text needs cleanup mid-field. */
function onDomainPaste() {
  // Run after the paste has landed in the field.
  setTimeout(() => {
    const input = document.getElementById("domain-input");
    const clean = extractDomain(input.value);
    if (clean !== input.value) {
      input.value = clean;
    }
    state.domain = clean;
    renderDomain();
    renderGrid();
  }, 0);
}

function onSearchInput(e) {
  state.searchFilter = e.target.value;
  renderGrid();
  renderResults();
  renderEmpty();
}

function onTagClick(e) {
  const tag = e.target.getAttribute("data-tag");
  state.activeTag = tag === "" ? null : state.activeTag === tag ? null : tag;
  renderAll();
}

function onTagsToggle() {
  state.categoriesExpanded = !state.categoriesExpanded;
  renderCategories();
}

function onChipClear(e) {
  if (!e.target.closest(".active-tag-clear")) return;
  state.activeTag = null;
  renderAll();
}

function onGridClick(e) {
  const card = e.target.closest(".dork-card");
  if (!card) return;
  const category = dorkCategories.find((c) => c.id === card.getAttribute("data-id"));
  if (category) openDork(category);
}

function onBulkClick(e) {
  const btn = e.target.closest(".bulk-open-btn");
  if (!btn) return;
  openBatch(Number(btn.getAttribute("data-start")), Number(btn.getAttribute("data-end")));
}

function onClearDomain() {
  state.domain = "";
  document.getElementById("domain-input").value = "";
  renderDomain();
  renderGrid();
}

function onClearFilters() {
  state.searchFilter = "";
  state.activeTag = null;
  document.getElementById("search-input").value = "";
  renderAll();
}

function init() {
  document.getElementById("domain-input").addEventListener("input", onDomainInput);
  document.getElementById("domain-input").addEventListener("paste", onDomainPaste);
  document.getElementById("search-input").addEventListener("input", onSearchInput);
  document.getElementById("clear-domain").addEventListener("click", onClearDomain);
  document.getElementById("categories-toggle").addEventListener("click", onTagsToggle);
  document.getElementById("active-tag-chip").addEventListener("click", onChipClear);
  document.getElementById("tags-row").addEventListener("click", onTagClick);
  document.getElementById("dork-grid").addEventListener("click", onGridClick);
  document.getElementById("clear-filters").addEventListener("click", onClearFilters);
  document.getElementById("bulk-open-row").addEventListener("click", onBulkClick);
  renderAll();
}

/* Run as soon as the DOM is ready (scripts are loaded at end of <body>). */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}