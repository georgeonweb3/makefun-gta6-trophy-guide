// The checklist: one card per trophy with its official name, description and
// grade, a tick box, its guide and its sources. Also the progress bar and the
// next-up hint, which names the first unearned trophy in roadmap order.
import { KIND_LABELS, trophyIsSpoilerHidden, visibleTrophies } from './filters.js';

export function renderProgress(trophies, earned) {
  const done = trophies.filter((trophy) => earned.has(trophy.name)).length;
  const total = trophies.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progress-text').textContent = `${done} of ${total} earned`;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
}

export function nextUpTrophy(trophies, earned) {
  const rest = trophies.filter((trophy) => !earned.has(trophy.name));
  if (rest.length === 0) return null;
  if (rest.length === 1) return rest[0];
  const nonPlatinum = rest.filter((trophy) => trophy.name !== 'Vice Got a Price!');
  const ordered = [...nonPlatinum].sort((a, b) => a.stage - b.stage || a.id - b.id);
  return ordered[0];
}

export function renderNextUp(trophies, earned) {
  const next = nextUpTrophy(trophies, earned);
  const line = document.getElementById('next-up');
  if (!next) {
    line.textContent = 'Platinum earned: you are a Leonida Legend.';
    return;
  }
  line.textContent = `Next up: ${next.name} — ${next.description}`;
}

export function renderChecklist(trophies, state, onToggleEarned) {
  const list = document.getElementById('trophy-list');
  const shown = visibleTrophies(trophies, state);
  const countLine = document.getElementById('count-line');
  const emptyNote = document.getElementById('empty-note');
  const earnedCount = trophies.filter((t) => state.earned.has(t.name)).length;
  countLine.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${earnedCount} earned`;

  if (state.kind === 'online') {
    emptyNote.hidden = false;
    emptyNote.textContent = 'No online trophies in GTA VI: all 55 are single-player. PowerPyx and Push Square both list 0 online trophies, and the platinum needs no multiplayer or DLC.';
  } else if (shown.length === 0) {
    emptyNote.hidden = false;
    emptyNote.textContent = 'No trophies match these filters. Clear the search or pick another kind.';
  } else {
    emptyNote.hidden = true;
  }

  list.replaceChildren();
  for (const trophy of shown) {
    list.append(buildTrophyCard(trophy, state, onToggleEarned));
  }
}

function buildTrophyCard(trophy, state, onToggleEarned) {
  const earned = state.earned.has(trophy.name);
  const hidden = trophyIsSpoilerHidden(trophy, state.spoiler, state.earned);
  const card = document.createElement('article');
  card.className = `trophy${earned ? ' earned' : ''}`;
  card.dataset.name = trophy.name;

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('change', () => onToggleEarned(trophy.name, box.checked));
  card.append(box);

  const body = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = hidden ? 'Hidden story trophy — earn it to reveal' : trophy.name;
  body.append(name);

  const desc = document.createElement('div');
  desc.className = hidden ? 'spoiler-hidden' : 'trophy-desc';
  desc.textContent = hidden ? 'Spoiler hidden until earned.' : trophy.description;
  body.append(desc);

  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.append(gradeBadge(trophy.grade));
  badges.append(textBadge(KIND_LABELS[trophy.kind] || trophy.kind));
  if (trophy.missable) badges.append(missableBadge());
  if (trophy.guide.startsWith('NOT YET KNOWN')) badges.append(unknownBadge());
  body.append(badges);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  toggle.textContent = hidden ? 'Guide hidden (spoiler)' : 'Show guide + sources';
  toggle.disabled = hidden;
  body.append(toggle);

  const guide = document.createElement('div');
  guide.className = 'guide';
  guide.hidden = true;
  const guideText = document.createElement('p');
  guideText.textContent = trophy.guide;
  guide.append(guideText);
  const sources = document.createElement('p');
  sources.className = 'sources';
  sources.textContent = 'Sources: ';
  trophy.sources.forEach((source, index) => {
    if (index > 0) sources.append(document.createTextNode(' · '));
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    sources.append(link);
  });
  guide.append(sources);
  body.append(guide);

  toggle.addEventListener('click', () => {
    guide.hidden = !guide.hidden;
    toggle.textContent = guide.hidden ? 'Show guide + sources' : 'Hide guide';
  });
  if (state.openGuides.has(trophy.name)) {
    guide.hidden = false;
    toggle.textContent = 'Hide guide';
  }
  card.append(body);
  return card;
}

function gradeBadge(grade) {
  const badge = document.createElement('span');
  badge.className = `badge grade-${grade}`;
  badge.textContent = grade;
  return badge;
}

function textBadge(label) {
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = label;
  return badge;
}

function missableBadge() {
  const badge = document.createElement('span');
  badge.className = 'badge missable';
  badge.textContent = 'Possibly missable';
  return badge;
}

function unknownBadge() {
  const badge = document.createElement('span');
  badge.className = 'badge unknown';
  badge.textContent = 'Not yet known';
  return badge;
}
