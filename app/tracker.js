// tracker.js — the checklist, the detail pane, and the progress header.
//
// The list is rendered from the trophy data with the filters applied;
// each row carries a checkbox that toggles the trophy earned, and
// clicking a row opens its guide in the detail pane. Spoiler-masked
// trophies show a placeholder name and description until earned, and
// their guide stays closed until then as well.

import { KIND_LABELS, applyFilters, gradeCounts, trophyIsHiddenBySpoiler, visibleDescription, visibleName } from './filters.js';

const NEXT_UP = [
  { when: (earned) => earned.size === 0, text: 'Next up: play the story — the first trophies come free.' },
  { when: (earned) => !earned.has(7), text: 'Next up: finish the story to unlock the 100% checklist.' },
  { when: (earned) => !earned.has(14), text: 'Next up: work the 100% checklist — A Long Road is the long pole.' },
  { when: (earned) => !earned.has(25), text: 'Next up: finish the stranger strands for Strangers & Freaks.' },
  { when: () => true, text: 'Next up: the platinum — one trophy left.' },
];

export function nextUpText(earned, total) {
  if (earned.size >= total) return 'Platinum earned — every trophy is yours. Leonida Legend.';
  for (const step of NEXT_UP) {
    if (step.when(earned)) return step.text;
  }
  return 'Keep going.';
}

export function renderProgress(trophies, earned) {
  const total = trophies.length;
  const pct = total === 0 ? 0 : Math.round((earned.size / total) * 100);
  document.getElementById('progress-text').textContent = `${earned.size} of ${total} earned`;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('next-up').textContent = nextUpText(earned, total);
  const counts = gradeCounts(trophies, earned);
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map(
    (grade) => `${counts[grade][0]}/${counts[grade][1]} ${grade}`,
  );
  document.getElementById('progress-sub').textContent = `By grade: ${parts.join(' · ')}.`;
}

export function renderList(trophies, state, onToggle, onSelect) {
  const list = document.getElementById('trophy-list');
  const shown = applyFilters(trophies, state);
  list.innerHTML = '';
  for (const trophy of shown) {
    const item = document.createElement('li');
    item.className = 'trophy' + (state.earned.has(trophy.id) ? ' earned' : '') +
      (state.selectedId === trophy.id ? ' selected' : '');
    const head = document.createElement('div');
    head.className = 'trophy-head';
    const check = document.createElement('label');
    check.className = 'trophy-check';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(trophy.id);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      onToggle(trophy.id, box.checked);
    });
    check.appendChild(box);
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = visibleName(trophy, state.earned, state.spoilerOn);
    const grade = document.createElement('span');
    grade.className = `grade ${trophy.grade}`;
    grade.textContent = trophy.grade;
    head.append(name, grade, check);
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = visibleDescription(trophy, state.earned, state.spoilerOn);
    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
    tags.appendChild(kindTag);
    if (trophy.hidden) {
      const hiddenTag = document.createElement('span');
      hiddenTag.className = 'tag hidden-t';
      hiddenTag.textContent = 'Hidden on PSN';
      tags.appendChild(hiddenTag);
    }
    if (trophy.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = '⚠ Possibly missable';
      tags.appendChild(missTag);
    }
    if (trophy.count) {
      const countTag = document.createElement('span');
      countTag.className = 'tag';
      countTag.textContent = `Target: ${trophy.count.toLocaleString('en-US')}`;
      tags.appendChild(countTag);
    }
    item.append(head, desc, tags);
    item.addEventListener('click', () => onSelect(trophy.id));
    list.appendChild(item);
  }
  const meta = document.getElementById('list-meta');
  meta.textContent = shown.length === trophies.length
    ? `Showing all ${trophies.length} trophies.`
    : `Showing ${shown.length} of ${trophies.length} trophies.`;
}

export function renderDetail(trophy, earned, spoilerOn) {
  const panel = document.getElementById('detail');
  panel.innerHTML = '';
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Pick a trophy on the left to read its guide and sources here.';
    panel.appendChild(empty);
    return;
  }
  if (trophyIsHiddenBySpoiler(trophy, earned, spoilerOn)) {
    const heading = document.createElement('h2');
    heading.textContent = 'Hidden story trophy';
    const body = document.createElement('p');
    body.textContent = 'Spoilers are hidden. Earn this trophy in the game — or turn the spoiler setting off — to read its name, description and guide here.';
    panel.append(heading, body);
    return;
  }
  const heading = document.createElement('h2');
  heading.textContent = trophy.name;
  const official = document.createElement('div');
  official.className = 'official';
  const gradeLine = document.createElement('p');
  const grade = document.createElement('strong');
  grade.textContent = trophy.grade[0].toUpperCase() + trophy.grade.slice(1);
  gradeLine.appendChild(grade);
  const descLine = document.createElement('p');
  descLine.textContent = trophy.description;
  const kindLine = document.createElement('p');
  kindLine.className = 'note';
  kindLine.textContent =
    `${KIND_LABELS[trophy.kind] ?? trophy.kind}` +
    (trophy.hidden ? ' · Hidden on PSN until earned' : '') +
    (trophy.missable ? ' · Possibly missable' : '') +
    (trophy.count ? ` · PSN target: ${trophy.count.toLocaleString('en-US')}` : '') +
    (earned.has(trophy.id) ? ' · Earned ✓' : ' · Not earned yet');
  official.append(gradeLine, descLine, kindLine);
  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'How to earn it';
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophy.guide;
  panel.append(heading, official, guideHeading, guide);
  if (trophy.uncertain) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = 'Still being confirmed: the guide sites have not yet settled on one exact method for this trophy. This guide gives the best reading of the official description and labels it as a lead, not a fact.';
    panel.appendChild(warn);
  }
  const sourcesHeading = document.createElement('h3');
  sourcesHeading.textContent = 'Sources';
  const sourcesList = document.createElement('ul');
  sourcesList.className = 'sources';
  for (const source of trophy.sources ?? []) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    item.appendChild(link);
    sourcesList.appendChild(item);
  }
  const note = document.createElement('p');
  note.className = 'note';
  note.textContent = 'Guides are written here in fresh words from the sources above; the official name and description are shown as PlayStation publishes them.';
  panel.append(sourcesHeading, sourcesList, note);
}
