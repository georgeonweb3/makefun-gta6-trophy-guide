// Leonida Trophy Companion — bootstrap. Loads the trophy data, wires the
// toolbar, the tabs and the tracker, and renders the checklist. URL params
// drive the views screenshots use: ?tab=roadmap|missables|sources,
// ?spoiler=1, ?demo=1 (a seeded in-memory save), ?open=<id> (open a guide).

import { createStore, downloadText } from './store.js';
import { createFilterState, trophyMatches, describeFilter } from './filters.js';
import { renderCards } from './trophies.js';
import { renderRoadmap, renderMissables } from './roadmap.js';

const params = new URLSearchParams(location.search);
const demo = params.get('demo') === '1';
const store = createStore(demo);
const state = createFilterState();
const openIds = new Set();

const $ = (id) => document.getElementById(id);
const cardsEl = $('cards');
const listMetaEl = $('listMeta');
const emptyEl = $('emptyState');

let trophies = [];

function renderProgress() {
  const earned = store.earned.size;
  $('earnedCount').textContent = String(earned);
  $('progressFill').style.width = `${(earned / 55) * 100}%`;
}

function renderList() {
  const shown = trophies.filter((t) => trophyMatches(t, state, store.earned));
  renderCards(cardsEl, shown, state, store, openIds, {
    onToggleEarned(id) {
      store.toggle(id);
      renderProgress();
      renderList();
    },
    onToggleGuide(id) {
      if (openIds.has(id)) openIds.delete(id);
      else openIds.add(id);
      renderList();
    },
  });
  listMetaEl.textContent = describeFilter(trophies, state, shown.length, store.earned.size);
  emptyEl.hidden = shown.length > 0;
}

function activateTab(name) {
  for (const button of document.querySelectorAll('.tab')) {
    button.classList.toggle('active', button.dataset.tab === name);
  }
  for (const panel of document.querySelectorAll('.panel')) {
    panel.classList.toggle('active', panel.id === `panel-${name}`);
  }
}

function wireToolbar() {
  $('search').addEventListener('input', (event) => {
    state.query = event.target.value;
    renderList();
  });
  $('gradeFilter').addEventListener('change', (event) => {
    state.grade = event.target.value;
    renderList();
  });
  $('kindChips').addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    state.kind = chip.dataset.kind;
    for (const other of document.querySelectorAll('.chip')) {
      other.classList.toggle('active', other === chip);
    }
    renderList();
  });
  $('spoilerToggle').addEventListener('change', (event) => {
    state.spoiler = event.target.checked;
    renderList();
  });
  $('hideEarned').addEventListener('change', (event) => {
    state.hideEarned = event.target.checked;
    renderList();
  });
  $('exportBtn').addEventListener('click', () => {
    downloadText('leonida-trophy-progress.json', store.exportText());
  });
  $('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const result = store.importText(await file.text());
    event.target.value = '';
    if (result.ok) {
      renderProgress();
      renderList();
      listMetaEl.textContent = `Imported ${result.count} earned trophies. ${describeFilter(trophies, state, trophies.filter((t) => trophyMatches(t, state, store.earned)).length, store.earned.size)}`;
    } else {
      listMetaEl.textContent = `Import failed: ${result.error}`;
    }
  });
  $('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Clear every ticked trophy and start again?')) return;
    store.setAll([]);
    openIds.clear();
    renderProgress();
    renderList();
  });
  for (const button of document.querySelectorAll('.tab')) {
    button.addEventListener('click', () => activateTab(button.dataset.tab));
  }
}

async function boot() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  trophies = doc.trophies;

  renderRoadmap($('roadmapBody'), trophies);
  renderMissables($('missablesBody'), trophies);
  wireToolbar();

  if (params.get('spoiler') === '1') {
    state.spoiler = true;
    $('spoilerToggle').checked = true;
  }
  const openId = Number.parseInt(params.get('open') || '', 10);
  if (Number.isInteger(openId) && openId >= 1 && openId <= 55) openIds.add(openId);

  const tab = params.get('tab');
  if (tab === 'roadmap' || tab === 'missables' || tab === 'sources') activateTab(tab);

  renderProgress();
  renderList();

  if (openIds.size > 0) {
    // Land on the card whose guide is open, with the smallest scroll that
    // gets it fully into view ('nearest'): the first card is already on
    // screen, so the cover keeps its header, progress and filters, while a
    // card further down the list (as #28 is) scrolls just enough to show it
    // together with the masked story trophies above it.
    const opened = cardsEl.querySelector('.guide.open');
    const card = opened ? opened.closest('.card') : cardsEl.querySelector('.card');
    if (card) card.scrollIntoView({ block: 'nearest' });
  }
}

boot().catch((error) => {
  cardsEl.replaceChildren();
  const note = document.createElement('p');
  note.className = 'empty-state';
  note.hidden = false;
  note.textContent = `The trophy data could not be loaded (${error.message}). Check that data/trophies.json sits beside this page and reload.`;
  cardsEl.append(note);
});
