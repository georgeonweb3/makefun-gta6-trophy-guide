// Checklist rendering: one card per trophy. The card shows the official name,
// description and grade as PlayStation publishes them, the kind tag, the
// tracked count where PlayStation has one, and a guide that opens on demand
// with its source named beside it. Spoiler-safe mode masks every trophy
// PlayStation hides until earned — name, description and guide all stay
// hidden until the box is ticked, which is how the player reveals them.

import { KIND_LABELS } from './filters.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function countLine(trophy) {
  if (trophy.count === null || trophy.count === undefined) return null;
  const money = trophy.id === 52 || trophy.id === 53;
  const shown = money
    ? `$${trophy.count.toLocaleString('en-US')}`
    : trophy.count.toLocaleString('en-US');
  const line = el('p', 'card-count');
  line.append('PlayStation tracks: ', el('strong', null, shown));
  return line;
}

function buildCard(trophy, state, store, openIds, onToggleEarned, onToggleGuide) {
  const earned = store.isEarned(trophy.id);
  // Spoiler-safe mode masks every trophy PlayStation hides until earned —
  // the 12 story trophies and the 16 hidden side trophies alike. Name,
  // description and guide all stay hidden until the box is ticked, which is
  // how the player reveals them.
  const masked = state.spoiler && trophy.hidden && !earned;
  const card = el('article', `card grade-${trophy.grade}${earned ? ' earned' : ''}`);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', masked ? `Mark hidden story trophy ${trophy.id} as earned` : `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => onToggleEarned(trophy.id));
  card.append(box);

  const head = el('div', 'card-head');
  head.append(el('h3', 'card-name', masked ? 'Hidden trophy' : trophy.name));
  head.append(el('span', `grade-badge ${trophy.grade}`, trophy.grade));
  head.append(el('span', 'kind-tag', KIND_LABELS[trophy.kind] || trophy.kind));
  if (trophy.missable) head.append(el('span', 'flag missable', 'Possibly missable'));
  if (trophy.hidden) head.append(el('span', 'flag hidden', 'Hidden on PSN'));
  card.append(head);

  const body = el('div', 'card-body');
  if (masked) {
    body.append(el('p', 'spoiler-mask', 'A hidden trophy — its name and description stay hidden on PlayStation until you earn it. Tick the box when it pops in-game and it will reveal itself here.'));
  } else {
    body.append(el('p', 'card-desc', trophy.description));
    const count = countLine(trophy);
    if (count) body.append(count);
    const open = openIds.has(trophy.id);
    const toggle = el('button', 'guide-toggle', open ? 'Hide the guide' : 'Read the guide');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.addEventListener('click', () => onToggleGuide(trophy.id));
    body.append(toggle);
    const guide = el('div', `guide${open ? ' open' : ''}`);
    guide.append(el('p', null, trophy.guide));
    const src = el('p', 'guide-source', 'Source: ');
    const link = document.createElement('a');
    link.href = trophy.sourceUrl;
    link.textContent = trophy.source;
    link.target = '_blank';
    link.rel = 'noopener';
    src.append(link);
    guide.append(src);
    body.append(guide);
  }
  card.append(body);
  return card;
}

export function renderCards(container, trophies, state, store, openIds, callbacks) {
  container.replaceChildren();
  for (const trophy of trophies) {
    container.append(buildCard(trophy, state, store, openIds, callbacks.onToggleEarned, callbacks.onToggleGuide));
  }
}
