// Checklist rendering: one card per trophy, with its official name, description
// and grade, its guide and source, plus search, kind/grade/state filters and
// the spoiler setting that hides story trophies until they are earned.
import { saveEarned } from './tracker.js';

const SOURCE_LINKS = {
  PowerPyx: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
};

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function spoilerHidden(trophy, earned, settings) {
  return settings.spoiler && trophy.kind === 'story' && !earned.has(trophy.name);
}

function matchesFilters(trophy, earned, filters) {
  if (filters.kind === 'missable' && !trophy.missable) return false;
  if (filters.kind === 'online') return false; // This list has no online trophies.
  if (filters.kind !== 'all' && filters.kind !== 'missable' && trophy.kind !== filters.kind) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.state === 'earned' && !earned.has(trophy.name)) return false;
  if (filters.state === 'remaining' && earned.has(trophy.name)) return false;
  if (filters.query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(filters.query)) return false;
  }
  return true;
}

function buildGuideBlock(trophy) {
  const guide = document.createElement('div');
  guide.className = 'guide';
  guide.hidden = true;
  const text = document.createElement('p');
  text.textContent = trophy.guide;
  guide.append(text);
  const source = document.createElement('p');
  source.className = 'source';
  source.textContent = `Source: ${trophy.source}. `;
  const link = document.createElement('a');
  link.href = SOURCE_LINKS.PowerPyx;
  link.textContent = 'PowerPyx GTA 6 Trophy Guide & Roadmap';
  link.rel = 'noopener';
  source.append(link);
  guide.append(source);
  if (trophy.missable && trophy.missable_note) {
    const note = document.createElement('p');
    note.className = 'missable-note';
    note.textContent = `Missable — ${trophy.missable_note}`;
    guide.append(note);
  }
  if (/NOT YET KNOWN/.test(trophy.guide)) {
    const note = document.createElement('p');
    note.className = 'unknown-note';
    note.textContent = 'Status at launch: no guide has a confirmed method for this trophy yet. This entry says so rather than inventing one.';
    guide.append(note);
  }
  return guide;
}

export function renderChecklist(list, trophies, earned, settings, filters, onToggle) {
  list.replaceChildren();
  let shown = 0;
  for (const trophy of trophies) {
    if (!matchesFilters(trophy, earned, filters)) continue;
    shown += 1;
    const item = document.createElement('li');
    item.className = 'trophy' + (earned.has(trophy.name) ? ' earned' : '');
    const head = document.createElement('div');
    head.className = 'trophy-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'trophy-check';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveEarned(earned);
      onToggle();
    });
    const main = document.createElement('div');
    main.className = 'trophy-main';
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    if (spoilerHidden(trophy, earned, settings)) {
      name.textContent = 'Hidden story trophy';
      name.classList.add('spoiler-hidden');
      desc.textContent = 'Spoilers hidden: earn this trophy to reveal its name and description.';
    } else {
      name.textContent = trophy.name;
      desc.textContent = trophy.description;
    }
    main.append(name, desc);
    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    const gradeTag = document.createElement('span');
    gradeTag.className = `tag tag-${trophy.grade}`;
    gradeTag.textContent = gradeLabel(trophy.grade);
    tags.append(gradeTag);
    if (trophy.kind !== 'platinum') {
      const kindTag = document.createElement('span');
      kindTag.className = `tag tag-kind-${trophy.kind}`;
      kindTag.textContent = trophy.kind;
      tags.append(kindTag);
    }
    if (trophy.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag tag-missable';
      missTag.textContent = 'Missable';
      tags.append(missTag);
    }
    main.append(tags);
    if (!spoilerHidden(trophy, earned, settings)) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'guide-toggle';
      toggle.textContent = 'Show guide';
      const guide = buildGuideBlock(trophy);
      toggle.addEventListener('click', () => {
        guide.hidden = !guide.hidden;
        toggle.textContent = guide.hidden ? 'Show guide' : 'Hide guide';
      });
      main.append(toggle, guide);
    }
    head.append(box, main);
    item.append(head);
    list.append(item);
  }
  return shown;
}

// The next trophy to earn, in roadmap order: lowest stage first, platinum last.
export function nextUpTrophy(trophies, earned) {
  const ordered = [...trophies].sort((a, b) => a.stage - b.stage || a.id - b.id);
  const rest = ordered.filter((trophy) => trophy.kind !== 'platinum' && !earned.has(trophy.name));
  if (rest.length > 0) return rest[0];
  const platinum = trophies.find((trophy) => trophy.kind === 'platinum');
  return earned.has(platinum.name) ? null : platinum;
}
