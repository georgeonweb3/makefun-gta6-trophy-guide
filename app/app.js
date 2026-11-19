// Leonida Trophy Atlas — entry point. Loads the trophy list and the roadmap,
// then wires the tracker, the filters, the spoiler setting and the tabs.
// Nothing here reaches the network: both files live under app/data/.
import { loadEarned, saveEarned, loadSettings, saveSettings, cleanEarned } from './tracker.js';
import { renderChecklist, nextUpTrophy } from './render.js';
import { renderRoadmap, renderMissables } from './roadmap.js';
import { exportProgress, readImportedFile } from './export.js';

const trophiesDoc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const trophies = trophiesDoc.trophies;
const stages = roadmapDoc.stages;

const earned = cleanEarned([...loadEarned()], trophies);
const settings = loadSettings();

const list = document.getElementById('trophyList');
const progressCount = document.getElementById('progressCount');
const progressFill = document.getElementById('progressFill');
const progressSub = document.getElementById('progressSub');
const nextUp = document.getElementById('nextUp');
const filterNote = document.getElementById('filterNote');
const emptyNote = document.getElementById('emptyNote');
const searchInput = document.getElementById('search');
const kindFilter = document.getElementById('kindFilter');
const gradeFilter = document.getElementById('gradeFilter');
const stateFilter = document.getElementById('stateFilter');
const spoilerToggle = document.getElementById('spoilerToggle');
const savedNote = document.getElementById('savedNote');

const filters = { query: '', kind: 'all', grade: 'all', state: 'all' };
spoilerToggle.checked = settings.spoiler;

function currentFilters() {
  return {
    query: searchInput.value.trim().toLowerCase(),
    kind: kindFilter.value,
    grade: gradeFilter.value,
    state: stateFilter.value,
  };
}

function refresh() {
  const active = currentFilters();
  const shown = renderChecklist(list, trophies, earned, settings, active, refresh);
  emptyNote.hidden = shown !== 0;
  const total = trophies.length;
  const percent = Math.round((earned.size / total) * 100);
  progressCount.textContent = `${earned.size} of ${total} earned`;
  progressFill.style.width = `${percent}%`;
  progressSub.textContent = `${percent}% to the platinum`;
  const next = nextUpTrophy(trophies, earned);
  nextUp.innerHTML = '';
  if (next) {
    const label = document.createElement('span');
    label.textContent = 'Next up: ';
    // The spoiler setting hides story trophies everywhere, including here.
    if (settings.spoiler && next.kind === 'story' && !earned.has(next.name)) {
      const hidden = document.createElement('span');
      hidden.textContent = 'a hidden story trophy — keep playing the story.';
      nextUp.append(label, hidden);
    } else {
      const strong = document.createElement('strong');
      strong.textContent = next.name;
      const rest = document.createElement('span');
      rest.textContent = ` — ${next.description}`;
      nextUp.append(label, strong, rest);
    }
  } else {
    nextUp.textContent = 'Platinum earned. You are a Leonida Legend.';
  }
  filterNote.textContent = active.kind === 'online'
    ? 'This list has no online trophies: all 55 are single-player and offline.'
    : `Showing ${shown} of ${total} trophies.`;
  renderRoadmap(document.getElementById('roadmapStages'), stages, trophies, earned, settings);
  renderMissables(document.getElementById('missableList'), trophies, earned, settings);
}

for (const control of [searchInput, kindFilter, gradeFilter, stateFilter]) {
  control.addEventListener('input', refresh);
}
spoilerToggle.addEventListener('change', () => {
  settings.spoiler = spoilerToggle.checked;
  saveSettings(settings);
  refresh();
});

document.getElementById('exportBtn').addEventListener('click', () => exportProgress(earned));
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const names = await readImportedFile(file);
    const cleaned = cleanEarned(names, trophies);
    earned.clear();
    for (const name of cleaned) earned.add(name);
    saveEarned(earned);
    savedNote.textContent = `Imported ${cleaned.size} earned trophies from ${file.name}.`;
  } catch (error) {
    savedNote.textContent = `Import failed: ${error.message}`;
  }
  event.target.value = '';
  refresh();
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!window.confirm('Clear all earned trophies?')) return;
  earned.clear();
  saveEarned(earned);
  savedNote.textContent = 'Progress reset.';
  refresh();
});

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => {
    for (const other of document.querySelectorAll('.tab')) other.classList.remove('active');
    tab.classList.add('active');
    for (const panel of document.querySelectorAll('.panel')) panel.hidden = true;
    document.getElementById(`panel-${tab.dataset.tab}`).hidden = false;
  });
}

refresh();
