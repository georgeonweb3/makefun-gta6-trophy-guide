// Vice City Trophy Companion: load the 55 trophies, wire the checklist,
// filters, roadmap and missables, and keep progress in the browser.
import {
  loadProgress, saveProgress, loadSettings, saveSettings,
  exportProgress, readImportedProgress,
} from './store.js';
import { renderChecklist, renderProgress, renderNextUp } from './tracker.js';
import { renderRoadmap, renderMissables } from './roadmap.js';

const state = {
  trophies: [],
  earned: loadProgress(),
  settings: loadSettings(),
  search: '',
  kind: 'all',
  grade: 'all',
  spoiler: false,
  openGuides: new Set(),
};
state.spoiler = state.settings.spoiler;

function renderAll() {
  renderProgress(state.trophies, state.earned);
  renderNextUp(state.trophies, state.earned);
  renderChecklist(state.trophies, state, toggleEarned);
  renderRoadmap(state.trophies, state.earned);
  renderMissables(state.trophies, state.earned);
}

function toggleEarned(name, checked) {
  if (checked) state.earned.add(name);
  else state.earned.delete(name);
  saveProgress(state.earned);
  renderAll();
}

function switchTab(tab) {
  for (const button of document.querySelectorAll('.tab')) {
    const active = button.dataset.tab === tab;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  for (const panel of document.querySelectorAll('.panel')) {
    panel.hidden = panel.id !== `panel-${tab}`;
  }
}

async function bootCompanion() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  state.trophies = doc.trophies;

  const search = document.getElementById('search');
  const kind = document.getElementById('kind');
  const grade = document.getElementById('grade');
  const spoiler = document.getElementById('spoiler');
  spoiler.checked = state.spoiler;

  search.addEventListener('input', () => {
    state.search = search.value;
    renderChecklist(state.trophies, state, toggleEarned);
  });
  kind.addEventListener('change', () => {
    state.kind = kind.value;
    renderChecklist(state.trophies, state, toggleEarned);
  });
  grade.addEventListener('change', () => {
    state.grade = grade.value;
    renderChecklist(state.trophies, state, toggleEarned);
  });
  spoiler.addEventListener('change', () => {
    state.spoiler = spoiler.checked;
    saveSettings({ spoiler: state.spoiler });
    renderChecklist(state.trophies, state, toggleEarned);
  });

  document.getElementById('export').addEventListener('click', () => {
    exportProgress(state.earned);
  });
  document.getElementById('import').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const known = new Set(state.trophies.map((trophy) => trophy.name));
      state.earned = await readImportedProgress(file, known);
      saveProgress(state.earned);
      renderAll();
    } catch {
      alert('That file is not a trophy-progress export from this guide.');
    }
    event.target.value = '';
  });
  document.getElementById('reset').addEventListener('click', () => {
    if (!confirm('Clear every tick? Your exported file stays safe if you saved one.')) return;
    state.earned = new Set();
    saveProgress(state.earned);
    renderAll();
  });

  for (const button of document.querySelectorAll('.tab')) {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  }

  renderAll();
}

bootCompanion();
