// roadmap.js — the road to the platinum, and the missables page.
//
// Both are built from the trophy data itself: each stage lists the
// trophies whose stage it is, and the missables page lists the trophies
// whose missable flag is set, with the save habits that cover the rest.
// The stage texts come from the published roadmaps (PowerPyx, Push
// Square, GTABase) as cited on the Sources tab.

export const STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Play the story (60–80 hours)',
    text: 'Finish the five chapters and enjoy the campaign. Story and named-mission trophies pop as you go, and there are no mission gold medals to chase. Along the way, scan vehicles with WAiNK and study animals with binoculars whenever you meet them — the 100% checklist counts progress made during the story. Do the Chapter 1 balcony meditation the moment Lucia offers it (see Missables), and keep a manual save at the start and end of every chapter: there is no mission replay and no chapter select.',
  },
  {
    stage: 2,
    title: 'Stage 2 — The 100% checklist and the open-world grind (about 100 hours)',
    text: 'After the credits, open Progress, then Stats, then 100% Completion. Work the checklist: every robbery, bank vault and gang operation, every underwater discovery, every shooting range gold, every drone race, every Bret quest, 200 of 277 vehicles scanned, 100 of 255 animals studied, 15 of 18 card sets, and 70 of the 80 challenges. The checklist is lenient — about 60% true completion — so skip the hardest ten challenges. Most of the grind trophies land here.',
  },
  {
    stage: 3,
    title: 'Stage 3 — Strangers & Freaks and the leftovers (about 10 hours)',
    text: 'Finish the eight stranger strands and whatever is still open: Andy, Kenton, Billy, Randy, Tyrone and Bret, each to their final mission. After the story every quest giver tied to a trophy comes back, so half-finished strands can be closed in free-roam. The platinum pops the moment the last trophy does.',
  },
];

export function renderRoadmap(container, trophies, earned) {
  container.innerHTML = '';
  for (const item of STAGES) {
    const members = trophies.filter((t) => t.stage === item.stage);
    const done = members.filter((t) => earned.has(t.id)).length;
    const card = document.createElement('article');
    card.className = 'roadmap-stage';
    const heading = document.createElement('h3');
    heading.textContent = item.title;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${done} of ${members.length} trophies in this stage earned.`;
    const body = document.createElement('p');
    body.textContent = item.text;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const trophy of members) {
      const chip = document.createElement('span');
      if (earned.has(trophy.id)) chip.className = 'done';
      chip.textContent = (earned.has(trophy.id) ? '✓ ' : '') + trophy.name;
      chips.appendChild(chip);
    }
    card.append(heading, count, body, chips);
    container.appendChild(card);
  }
}

export function renderMissables(container, trophies, earned) {
  container.innerHTML = '';
  const flagged = trophies.filter((t) => t.missable);
  if (flagged.length === 0) {
    const none = document.createElement('p');
    none.textContent = 'No trophy in this guide is flagged as missable.';
    container.appendChild(none);
    return;
  }
  for (const trophy of flagged) {
    const card = document.createElement('article');
    card.className = 'missable-card';
    const heading = document.createElement('h3');
    heading.textContent = `⚠ ${trophy.name} — possibly missable`;
    const body = document.createElement('p');
    body.textContent = trophy.guide;
    const sources = document.createElement('p');
    sources.className = 'note';
    sources.textContent =
      'Sources: PowerPyx and KeenGamer agree this is the one trophy to watch; Push Square and GTABase give the same roadmap. See the trophy’s guide for the full detail.';
    card.append(heading, body, sources);
    container.appendChild(card);
  }
  const reassurance = document.createElement('p');
  reassurance.textContent =
    'Everything else can be earned after the story: free-roam stays open, the 100% checklist only appears after the credits, and every quest giver tied to a trophy returns. The guides agree there is no other missable trophy — only this one is flagged, and even it is “potentially” missable, because whether the first meditation counts is still unsettled.';
  container.appendChild(reassurance);
}
