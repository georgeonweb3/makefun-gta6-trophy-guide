// Views: render the checklist, the roadmap, the missables page and the sources page
// from the trophy data. Spoiler mode hides story trophies' names and descriptions
// until they are earned.
import { isMissable, isUnknown } from './filters.js';

const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function sourceLink(source) {
  const a = document.createElement('a');
  a.href = source.url;
  a.textContent = source.label;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

function trophyRow(trophy, sources, state, onToggle) {
  const earned = state.earned.has(trophy.name);
  const li = el('li', 'trophy' + (earned ? ' earned' : ''));
  const head = el('div', 'trophy-head');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'trophy-check';
  box.checked = earned;
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('change', () => onToggle(trophy.name, box.checked));
  const title = el('div', 'trophy-title');
  const name = el('h3', 'trophy-name');
  const hiddenBySpoiler = state.spoiler && trophy.kind === 'story' && !earned;
  if (hiddenBySpoiler) {
    name.textContent = 'Hidden story trophy';
    const note = el('span', 'hidden-note', ' — earn it to reveal the name');
    name.append(note);
  } else {
    name.textContent = trophy.name;
  }
  title.append(name);
  const desc = el('p', 'trophy-desc', hiddenBySpoiler ? 'Story trophy — its name and description stay hidden while spoilers are on.' : trophy.description);
  title.append(desc);
  const meta = el('div', 'trophy-meta');
  meta.append(el('span', `chip ${trophy.grade}`, GRADE_LABELS[trophy.grade]));
  if (trophy.kind !== 'platinum') meta.append(el('span', 'chip', trophy.kind));
  if (trophy.chapter) meta.append(el('span', 'chip', trophy.chapter));
  if (isMissable(trophy)) meta.append(el('span', 'chip missable', 'Potentially missable'));
  if (isUnknown(trophy)) meta.append(el('span', 'chip unknown', 'Method not yet known'));
  if (earned) meta.append(el('span', 'chip earned-chip', 'Earned'));
  title.append(meta);
  head.append(box, title);
  li.append(head);
  if (!hiddenBySpoiler) {
    const guide = el('div', 'trophy-guide');
    guide.append(el('p', null, trophy.guide));
    if (trophy.target !== undefined) {
      const target = el('p', 'trophy-target');
      target.textContent = `Target: ${trophy.target.toLocaleString()} of ${trophy.target_of.toLocaleString()}.`;
      guide.append(target);
    }
    const srcLine = el('p', 'trophy-sources', 'Sources: ');
    for (const key of trophy.src || []) {
      if (sources[key]) srcLine.append(sourceLink(sources[key]));
    }
    guide.append(srcLine);
    li.append(guide);
  } else {
    const detail = document.createElement('details');
    detail.className = 'guide-detail';
    const summary = el('summary', null, 'Why is this hidden?');
    detail.append(summary);
    detail.append(el('p', null, 'Spoiler mode hides the names and descriptions of story trophies until you earn them. Tick the box when you earn it, or switch spoilers off, to see the guide.'));
    li.append(detail);
  }
  return li;
}

export function renderChecklist(listEl, trophies, sources, state, onToggle) {
  listEl.replaceChildren();
  for (const trophy of trophies) {
    listEl.append(trophyRow(trophy, sources, state, onToggle));
  }
}

export function renderProgress(state, total) {
  const earnedCount = state.earned.size;
  document.getElementById('earnedCount').textContent = String(earnedCount);
  document.getElementById('progressFill').style.width = `${Math.round((earnedCount / total) * 100)}%`;
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of state.trophies) {
    totals[t.grade] += 1;
    if (state.earned.has(t.name)) byGrade[t.grade] += 1;
  }
  document.getElementById('progressDetail').textContent =
    `Platinum ${byGrade.platinum}/${totals.platinum} · Gold ${byGrade.gold}/${totals.gold} · Silver ${byGrade.silver}/${totals.silver} · Bronze ${byGrade.bronze}/${totals.bronze}`;
  const next = state.trophies.find((t) => t.kind !== 'platinum' && !state.earned.has(t.name));
  const nextEl = document.getElementById('nextUp');
  if (!next) {
    nextEl.innerHTML = '';
    nextEl.append(el('strong', null, 'Platinum earned — Leonida Legend!'));
  } else {
    nextEl.innerHTML = '';
    nextEl.append('Next up: ');
    nextEl.append(el('strong', null, next.name));
  }
}

export function renderRoadmap(roadmap) {
  const factsEl = document.getElementById('roadmapFacts');
  factsEl.replaceChildren();
  for (const fact of roadmap.facts) {
    const dl = el('dl', 'fact');
    dl.append(el('dt', null, fact.label));
    dl.append(el('dd', null, fact.value));
    factsEl.append(dl);
  }
  const srcNote = el('p', 'section-note', `Roadmap facts: ${roadmap.facts_source}.`);
  factsEl.append(srcNote);
  const stepsEl = document.getElementById('roadmapSteps');
  stepsEl.replaceChildren();
  for (const step of roadmap.steps) {
    const li = el('li', 'roadmap-step');
    li.append(el('h3', null, `Step ${step.n}: ${step.title}`));
    li.append(el('p', 'step-hours', step.hours));
    li.append(el('p', null, step.body));
    li.append(el('p', 'step-trophies', `Trophies in this step: ${step.trophies}.`));
    stepsEl.append(li);
  }
  const warnEl = document.getElementById('roadmapWarnings');
  warnEl.replaceChildren();
  warnEl.append(el('h3', null, 'Watch out for'));
  const ul = document.createElement('ul');
  for (const warning of roadmap.warnings) ul.append(el('li', null, warning));
  warnEl.append(ul);
  warnEl.append(el('p', 'section-note', `Source: ${roadmap.warnings_source}.`));
}

export function renderMissables(trophies) {
  const body = document.getElementById('missablesBody');
  body.replaceChildren();
  const flagged = trophies.filter(isMissable);
  for (const trophy of flagged) {
    const card = el('div', 'missable-card flagged');
    card.append(el('h2', null, `${trophy.name} — potentially missable`));
    card.append(el('p', null, trophy.guide));
    card.append(el('p', 'section-note', 'Source: PowerPyx GTA 6 Trophy Guide & Roadmap, 18 Nov 2026. The guide is still confirming whether the Chapter 1 meditation is required; do it in Chapter 1 to be safe.'));
    body.append(card);
  }
  const safe = el('div', 'missable-card');
  safe.append(el('h2', null, 'Everything else is safe'));
  safe.append(el('p', null, 'PowerPyx flags only one trophy as potentially missable. Every other trophy is still earnable after the story in free-roam: there is no mission replay, but nothing needed for the platinum is locked behind a story moment. Optional missions with black icons and pink letters disappear after a while, some quest givers go quiet for a chapter, and some fences become permanently unavailable, but none of that affects any trophy or the 100% checklist. Keep a manual save at the start of each chapter anyway: with 15 manual slots, that costs 10 saves and leaves 5 to rotate.'));
  safe.append(el('p', 'section-note', 'Source: PowerPyx GTA 6 Trophy Guide & Roadmap, 18 Nov 2026.'));
  body.append(safe);
}

export function renderSources(data) {
  const body = document.getElementById('sourcesBody');
  body.replaceChildren();
  const card = el('div', 'source-card');
  card.append(el('h2', null, 'Where every fact comes from'));
  card.append(el('p', null, 'This guide was built on 19 November 2026, launch day. Rockstar, Sony and Microsoft published no official trophy list before launch, so the list below is the one the trackers carried, confirmed live on launch day. Every trophy’s name, description and grade comes from the tracker lists; every how-to step comes from the PowerPyx guide, rewritten in this guide’s own words; anything no source had pinned down is marked “not yet known” instead of guessed.'));
  const ul = document.createElement('ul');
  ul.className = 'source-list';
  for (const key of Object.keys(data.sources)) {
    const li = document.createElement('li');
    li.append(sourceLink(data.sources[key]));
    ul.append(li);
  }
  card.append(ul);
  card.append(el('p', null, data.list_note));
  const unknown = data.trophies.filter(isUnknown);
  card.append(el('h2', null, 'What is still unknown'));
  card.append(el('p', null, `Five trophies have no verified method yet: ${unknown.map((t) => t.name).join(', ')}. Their guides say so plainly, with the unconfirmed lead labelled as a lead. This guide updates when the methods are confirmed.`));
  const method = el('div', 'source-card');
  method.append(el('h2', null, 'Method'));
  method.append(el('p', null, 'Names, descriptions and grades: Exophase and PSNProfiles, agreeing on all 55, cross-checked against the live TrueAchievements and TrueTrophies lists on 19 November 2026. Steps, counts and the roadmap: PowerPyx’s trophy guide of 18 November 2026, the first full guide published, read in full and rewritten here. Counts such as 42 shooting range challenges, 250 stunts and 18 meditation spots are the numbers PlayStation tracks, as the trackers and PowerPyx report them. No guide text was copied: each guide is this site’s own wording of the sourced facts.'));
  body.append(card, method);
}
