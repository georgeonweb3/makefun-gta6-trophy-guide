// Roadmap and missables panels: the staged order to the platinum, and the
// one trophy that can be missed, both built from the official descriptions.
import { gradeLabel } from './render.js';

export function renderRoadmap(container, stages, trophies, earned, settings) {
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  container.replaceChildren();
  for (const stage of stages) {
    const block = document.createElement('article');
    block.className = 'stage';
    const heading = document.createElement('h2');
    heading.textContent = stage.title;
    const hours = document.createElement('p');
    hours.className = 'stage-hours';
    hours.textContent = stage.hours;
    const summary = document.createElement('p');
    summary.textContent = stage.summary;
    const done = stage.ids.filter((id) => earned.has(byId.get(id).name)).length;
    const count = document.createElement('p');
    count.textContent = `${done} of ${stage.ids.length} earned in this stage`;
    const list = document.createElement('ol');
    list.className = 'stage-list';
    for (const id of stage.ids) {
      const trophy = byId.get(id);
      const row = document.createElement('li');
      const mark = document.createElement('span');
      mark.className = earned.has(trophy.name) ? 'done' : 'todo';
      mark.textContent = earned.has(trophy.name) ? '✓' : '○';
      const label = document.createElement('span');
      // The spoiler setting hides story trophies here too until they are earned.
      label.textContent = settings.spoiler && trophy.kind === 'story' && !earned.has(trophy.name)
        ? 'Hidden story trophy'
        : `${trophy.name} — ${trophy.description}`;
      const grade = document.createElement('span');
      grade.className = 'stage-grade';
      grade.textContent = gradeLabel(trophy.grade);
      row.append(mark, label, grade);
      list.append(row);
    }
    block.append(heading, hours, summary, count, list);
    container.append(block);
  }
  const platinum = trophies.find((trophy) => trophy.kind === 'platinum');
  const finale = document.createElement('article');
  finale.className = 'stage';
  const heading = document.createElement('h2');
  heading.textContent = 'Finale — Vice Got a Price!';
  const text = document.createElement('p');
  text.textContent = earned.has(platinum.name)
    ? 'Platinum earned. You are a Leonida Legend.'
    : 'Earn the other 54 trophies and the platinum pops on its own. No online play or DLC is needed.';
  finale.append(heading, text);
  container.append(finale);
}

export function renderMissables(container, trophies, earned, settings) {
  container.replaceChildren();
  const flagged = trophies.filter((trophy) => trophy.missable);
  for (const trophy of flagged) {
    const card = document.createElement('article');
    card.className = 'missable-card' + (earned.has(trophy.name) ? ' earned' : '');
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    name.textContent = settings.spoiler && trophy.kind === 'story' && !earned.has(trophy.name)
      ? 'Hidden story trophy'
      : `${trophy.name} — ${gradeLabel(trophy.grade)}`;
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = settings.spoiler && trophy.kind === 'story' && !earned.has(trophy.name)
      ? 'Spoilers hidden: earn this trophy to reveal its name and description.'
      : trophy.description;
    const guide = document.createElement('div');
    guide.className = 'guide';
    const text = document.createElement('p');
    text.textContent = trophy.guide;
    const source = document.createElement('p');
    source.className = 'source';
    source.textContent = `Source: ${trophy.source}. `;
    const link = document.createElement('a');
    link.href = 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/';
    link.textContent = 'PowerPyx GTA 6 Trophy Guide & Roadmap';
    link.rel = 'noopener';
    source.append(link);
    guide.append(text, source);
    const note = document.createElement('p');
    note.className = 'missable-note';
    note.textContent = `Where it can be missed — ${trophy.missable_note}`;
    card.append(name, desc, guide, note);
    container.append(card);
  }
  const tally = document.createElement('p');
  tally.className = 'panel-intro';
  tally.textContent = `${flagged.length} of 55 trophies is flagged missable. The other 54 can all be earned after the story.`;
  container.append(tally);
}
