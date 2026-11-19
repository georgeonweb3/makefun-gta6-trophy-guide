// Boot: load the trophy and roadmap data, wire the tabs, filters, spoiler setting,
// search, and the export/import buttons, then render.
import { loadEarned, saveEarned, loadSettings, saveSettings, exportProgress, importProgressFile } from './store.js';
import { matchesKind, matchesGrade, matchesSearch, countByKind } from './filters.js';
import { renderChecklist, renderProgress, renderRoadmap, renderMissables, renderSources } from './views.js';

const state = {
  trophies: [],
  sources: {},
  earned: loadEarned(),
  settings: loadSettings(),
  kind: 'all',
  grade: 'all',
  query: '',
  spoiler: false,
  hideEarned: false,
};

const listEl = document.getElementById('trophyList');
const resultsLine = document.getElementById('resultsLine');
const emptyNote = document.getElementById('emptyNote');

function visibleTrophies() {
  return state.trophies.filter((t) => {
    if (!matchesKind(t, state.kind)) return false;
    if (!matchesGrade(t, state.grade)) return false;
    if (!matchesSearch(t, state.query)) return false;
    if (state.hideEarned && state.earned.has(t.name)) return false;
    return true;
  });
}

function render() {
  const visible = visibleTrophies();
  renderChecklist(listEl, visible, state.sources, state, onToggle);
  renderProgress(state, state.trophies.length);
  resultsLine.textContent = `Showing ${visible.length} of ${state.trophies.length} trophies.`;
  emptyNote.hidden = visible.length > 0;
}

function onToggle(name, earned) {
  if (earned) state.earned.add(name);
  else state.earned.delete(name);
  saveEarned(state.earned);
  render();
}

function saveSettingsNow() {
  saveSettings({ spoiler: state.spoiler, hideEarned: state.hideEarned, kind: state.kind, grade: state.grade });
}

function wireTabs() {
  const tabs = [...document.querySelectorAll('.tab')];
  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      for (const other of tabs) other.classList.toggle('active', other === tab);
      for (const panel of document.querySelectorAll('.tab-panel')) {
        panel.hidden = panel.id !== `tab-${tab.dataset.tab}`;
      }
    });
  }
}

function wireFilters() {
  document.getElementById('search').addEventListener('input', (event) => {
    state.query = event.target.value.trim();
    render();
  });
  document.getElementById('gradeFilter').addEventListener('change', (event) => {
    state.grade = event.target.value;
    saveSettingsNow();
    render();
  });
  document.getElementById('kindFilters').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-kind]');
    if (!button) return;
    state.kind = button.dataset.kind;
    for (const other of document.querySelectorAll('#kindFilters button')) {
      other.classList.toggle('active', other === button);
    }
    saveSettingsNow();
    render();
  });
  const spoilerToggle = document.getElementById('spoilerToggle');
  spoilerToggle.checked = state.settings.spoiler === true;
  state.spoiler = spoilerToggle.checked;
  spoilerToggle.addEventListener('change', () => {
    state.spoiler = spoilerToggle.checked;
    saveSettingsNow();
    render();
  });
  const hideEarned = document.getElementById('hideEarned');
  hideEarned.checked = state.settings.hideEarned === true;
  state.hideEarned = hideEarned.checked;
  hideEarned.addEventListener('change', () => {
    state.hideEarned = hideEarned.checked;
    saveSettingsNow();
    render();
  });
  if (typeof state.settings.kind === 'string') {
    const button = document.querySelector(`#kindFilters button[data-kind="${state.settings.kind}"]`);
    if (button) button.click();
  }
  if (typeof state.settings.grade === 'string') {
    const select = document.getElementById('gradeFilter');
    if ([...select.options].some((o) => o.value === state.settings.grade)) {
      select.value = state.settings.grade;
      state.grade = state.settings.grade;
    }
  }
}

function wireSaveButtons() {
  document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state.earned));
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      state.earned = await importProgressFile(file, state.trophies.map((t) => t.name));
      saveEarned(state.earned);
      render();
      resultsLine.textContent = `Imported ${state.earned.size} earned trophies from ${file.name}.`;
    } catch (error) {
      resultsLine.textContent = `Import failed: ${error.message}`;
    }
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Clear all earned trophies?')) return;
    state.earned = new Set();
    saveEarned(state.earned);
    render();
  });
}

async function boot() {
  const [trophyDoc, roadmapDoc] = await Promise.all([
    (await fetch('data/trophies.json')).json(),
    (await fetch('data/roadmap.json')).json(),
  ]);
  state.trophies = trophyDoc.trophies;
  state.sources = trophyDoc.sources;
  const counts = countByKind(state.trophies);
  for (const [kind, count] of Object.entries(counts)) {
    const span = document.querySelector(`[data-count="${kind}"]`);
    if (span) span.textContent = `(${count})`;
  }
  renderRoadmap(roadmapDoc);
  renderMissables(state.trophies);
  renderSources(trophyDoc);
  wireTabs();
  wireFilters();
  wireSaveButtons();
  render();
}

boot();
