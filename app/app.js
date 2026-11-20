// app.js — boot and wiring for the Vice City Trophy Companion.
//
// Loads data/trophies.json, restores saved progress, wires the tabs,
// the filters, the spoiler setting and export/import, and renders the
// checklist, the roadmap and the missables page. Address parameters
// let a view be deep-linked: ?tab=roadmap|missables|sources,
// ?spoiler=1 to turn the spoiler setting on, ?demo=1 to seed the
// example progress used for the entry's screenshots, and ?open=<id>
// to open one trophy's guide.

import { clearProgress, exportProgress, importProgressFile, loadProgress, saveProgress, seedDemoProgress } from './store.js';
import { renderDetail, renderList, renderProgress } from './tracker.js';
import { renderMissables, renderRoadmap } from './roadmap.js';

const state = {
  trophies: [],
  earned: new Set(),
  search: '',
  kind: 'all',
  grade: 'all',
  earnedOnly: false,
  spoilerOn: false,
  selectedId: null,
};

function renderAll() {
  renderProgress(state.trophies, state.earned);
  renderList(state.trophies, state, toggleEarned, selectTrophy);
  const selected = state.trophies.find((t) => t.id === state.selectedId) ?? null;
  renderDetail(selected, state.earned, state.spoilerOn);
  renderRoadmap(document.getElementById('roadmap'), state.trophies, state.earned);
  renderMissables(document.getElementById('missables'), state.trophies, state.earned);
}

function toggleEarned(id, checked) {
  if (checked) state.earned.add(id);
  else state.earned.delete(id);
  saveProgress(state.earned);
  renderAll();
}

function selectTrophy(id) {
  state.selectedId = id;
  renderList(state.trophies, state, toggleEarned, selectTrophy);
  const selected = state.trophies.find((t) => t.id === id) ?? null;
  renderDetail(selected, state.earned, state.spoilerOn);
}

function showTab(name) {
  for (const button of document.querySelectorAll('.tab')) {
    const active = button.dataset.tab === name;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  for (const panel of document.querySelectorAll('.panel')) {
    panel.hidden = panel.id !== `panel-${name}`;
  }
}

function buildSourceList(sources) {
  const list = document.getElementById('source-list');
  list.innerHTML = '';
  for (const source of sources) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    item.appendChild(link);
    list.appendChild(item);
  }
}

async function boot() {
  const params = new URLSearchParams(window.location.search);
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  state.trophies = data.trophies;
  state.earned = params.has('demo') ? seedDemoProgress() : loadProgress();

  state.spoilerOn = params.get('spoiler') === '1';
  document.getElementById('spoiler-toggle').checked = state.spoilerOn;

  const openId = Number(params.get('open'));
  state.selectedId = Number.isInteger(openId) && state.trophies.some((t) => t.id === openId)
    ? openId
    : state.trophies[0].id;

  buildSourceList(data.sources ?? []);
  renderAll();

  for (const button of document.querySelectorAll('.tab')) {
    button.addEventListener('click', () => showTab(button.dataset.tab));
  }
  const tabParam = params.get('tab');
  if (['checklist', 'roadmap', 'missables', 'sources'].includes(tabParam)) showTab(tabParam);

  document.getElementById('search').addEventListener('input', (event) => {
    state.search = event.target.value;
    renderList(state.trophies, state, toggleEarned, selectTrophy);
  });
  document.getElementById('kind-filter').addEventListener('change', (event) => {
    state.kind = event.target.value;
    renderList(state.trophies, state, toggleEarned, selectTrophy);
  });
  document.getElementById('grade-filter').addEventListener('change', (event) => {
    state.grade = event.target.value;
    renderList(state.trophies, state, toggleEarned, selectTrophy);
  });
  document.getElementById('earned-only').addEventListener('change', (event) => {
    state.earnedOnly = event.target.checked;
    renderList(state.trophies, state, toggleEarned, selectTrophy);
  });
  document.getElementById('spoiler-toggle').addEventListener('change', (event) => {
    state.spoilerOn = event.target.checked;
    renderAll();
  });
  document.getElementById('export-btn').addEventListener('click', () => {
    exportProgress(state.earned, state.trophies);
  });
  const importFile = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    if (!file) return;
    try {
      state.earned = await importProgressFile(file, state.trophies.map((t) => t.id));
      renderAll();
    } catch (error) {
      window.alert(`Could not import that file: ${error.message}`);
    }
    importFile.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies?')) {
      state.earned = new Set();
      clearProgress();
      renderAll();
    }
  });
}

boot();
