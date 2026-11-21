// Roadmap and missables: both built from the official descriptions and the
// working guides' findings. The roadmap runs in three stages — story, then
// the 100% checklist, then strangers and cleanup — and the missables panel
// says plainly that only one trophy is even possibly missable, and why.

const STAGES = [
  {
    title: 'Stage 1 — Play the story',
    hours: 'About 60 to 80 hours',
    intro: 'Play the five chapters at your own pace. The story trophies all unlock automatically, so there is nothing to chase here — but a few habits now save hours later.',
    steps: [
      'Do the Chapter 1 meditation. One morning at Jason’s house, Lucia says she is going to meditate and walks out to the balcony — follow her and accept the optional quest. It takes a minute, and it is the one thing on this list that may not come back.',
      'Take optional missions as they appear. The 100% checklist needs any 100 of them, out of several hundred, and the ones you do now count.',
      'Scan every new vehicle with the WAiNK app. The checklist needs 200 of the 277 base-model vehicles, and Whip It Good comes on the way.',
      'Study new animals through the binoculars. The checklist needs 100 of 255, and you do not have to hunt them.',
      'Turn on progress and criminal profile notifications in the UI settings, so you can see what counts.',
      'Answer the phone. Side strands open by call or by place — Andy in Chapter 3, Billy in Chapter 2 — and starting them when they open keeps the cleanup short.',
    ],
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    title: 'Stage 2 — The 100% checklist and challenges',
    hours: 'About 100 hours',
    intro: 'After the story, the checklist appears under Progress, then Stats, then 100% Completion. Everything you did during the story already counts, and nothing on it is missable. PowerPyx calls it lenient — closer to 60% true completion — but it is still the biggest single job on the road to the platinum.',
    steps: [
      'Work the checklist in order and tick each line off in the tracker as you finish it.',
      'Challenges: 70 of the 80. One Last Thing pops at 50, so the last twenty are the tail of this stage.',
      'Meditation: 15 of the 18 spots. The Chapter 1 balcony session from Stage 1 is already done.',
      'Stunts: 300 for the checklist, 250 for the silver. There are 397 in the world, so there is slack.',
      'Bank vaults: all 8. Maximum Withdrawal pops at 5.',
      'Gang operations: all 39. Pest Control pops at one per gang, nine in total.',
      'Shooting ranges, drone races and Bret’s hunting decks: everything.',
      'Card sets: Push Square’s version of the checklist asks for 15 of the 18 sets — keep collecting past the three the silver needs.',
    ],
    trophyIds: [14, 15, 17, 18, 28, 30, 32, 40, 43],
  },
  {
    title: 'Stage 3 — Strangers & Freaks and cleanup',
    hours: 'About 10 hours',
    intro: 'Most trophies should be done by now. Strangers & Freaks is not part of 100%, so you may still need those 8 strands — finish them, sweep whatever is left on the checklist, and the platinum follows.',
    steps: [
      'Finish 8 stranger strands. Andy, Kenton, Billy, Randy, Tyrone and Bret each have one with its own trophy; there are further strands beyond them.',
      'Money: launder $250,000 in marked bills through fences, spend $100,000 in shops, buy all 8 garages and register 10 vehicles to the Scooter Bros app.',
      'Sweep the stragglers: the 14 drone race locations, the 20 different race wins, the 100 WAiNK locations, the 100 vehicles.',
      'Check the tracker, finish the last card, and Vice Got a Price! pops.',
    ],
    trophyIds: [16, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 31, 33, 34, 35, 36, 37, 38, 39, 41, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
  },
];

const NOT_MISSABLE = [
  ['Kenton goes quiet', 'Kenton disappears after Chapter 1 and returns later in the story. All trophy quest givers come back and stay after the story.'],
  ['The bowling robbery', 'The Kingpin Bowling gang operation in Port Gellhorn comes back later if you miss it the first time.'],
  ['Fences leave for good', 'Some fences leave the map permanently. None of them has a trophy quest, so nothing is lost.'],
  ['Magazines in story buildings', 'A few magazine collectibles sit in buildings that close off after the story. They also spawn elsewhere.'],
  ['Hourglass quests', 'Quests with an hourglass icon can fail on a timer. None of them is tied to a trophy.'],
  ['The relationship', 'The relationship between Jason and Lucia does not matter for any trophy.'],
  ['Optional missions', 'Many optional missions disappear after a while. There are far more than the 100 the checklist needs.'],
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderRoadmap(container, trophies) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const head = el('div');
  head.append(el('h2', null, 'Roadmap to the platinum'));
  const intro = el('p');
  intro.textContent = 'One playthrough is enough, there are no difficulty settings, and there is no mission replay — so the order matters more than the difficulty. PowerPyx’s roadmap has three steps and Push Square’s has the same shape in two: story first, then 100% cleanup. Difficulty does not affect trophies, and the Accessible Combat and Reduced Vehicle Damage options are safe to use.';
  head.append(intro);
  container.append(head);

  for (const stage of STAGES) {
    const box = el('section', 'stage');
    box.append(el('h3', null, stage.title));
    box.append(el('p', 'stage-hours', stage.hours));
    box.append(el('p', null, stage.intro));
    const list = el('ul');
    for (const step of stage.steps) {
      list.append(el('li', null, step));
    }
    box.append(list);
    const chips = el('div', 'trophy-chips');
    for (const id of stage.trophyIds) {
      const t = byId.get(id);
      if (t) chips.append(el('span', null, t.name));
    }
    box.append(chips);
    container.append(box);
  }

  const box100 = el('section', 'stage');
  box100.append(el('h3', null, 'What 100% completion actually needs'));
  box100.append(el('p', null, 'The checklist behind A Long Road, as PowerPyx and Push Square report it. The lenient lines are the ones with a partial count; the strict lines need everything.'));
  const list = el('ul', 'checklist-100');
  const needs = [
    '70 of 80 challenges',
    '15 of 18 meditation spots',
    '300 stunts (of 397)',
    'All 8 bank vaults',
    'All 39 gang operations',
    'All 42 shooting range golds',
    'All 14 drone race locations',
    'All 15 of Bret’s target decks',
    '200 of 277 vehicles discovered',
    '100 of 255 animals studied',
    'Any 100 optional missions',
    '15 of 18 card sets (Push Square)',
  ];
  for (const need of needs) list.append(el('li', null, need));
  box100.append(list);
  container.append(box100);
}

export function renderMissables(container, trophies) {
  const risky = trophies.find((t) => t.missable);

  const head = el('div');
  head.append(el('h2', null, 'Missable trophies'));
  const intro = el('p');
  intro.textContent = 'Good news first: PowerPyx flags only one trophy as possibly missable, and Push Square lists no known missables at all. Nobody has confirmed the one either way yet — so this panel is a one-minute precaution, not a second playthrough.';
  head.append(intro);
  container.append(head);

  if (risky) {
    const callout = el('section', 'callout');
    callout.append(el('h3', null, `Possibly missable: ${risky.name}`));
    callout.append(el('p', null, risky.description));
    callout.append(el('p', null, risky.guide));
    const src = el('p', 'guide-source', 'Source: ');
    const link = document.createElement('a');
    link.href = risky.sourceUrl;
    link.textContent = risky.source;
    link.target = '_blank';
    link.rel = 'noopener';
    src.append(link);
    callout.append(src);
    container.append(callout);
  }

  const safe = el('section', 'note-box');
  safe.append(el('h3', null, 'Looks missable, but it is not'));
  const list = el('ul');
  for (const [title, why] of NOT_MISSABLE) {
    const item = el('li');
    item.append(el('strong', null, `${title} — `));
    item.append(why);
    list.append(item);
  }
  safe.append(list);
  container.append(safe);

  const saves = el('section', 'note-box');
  saves.append(el('h3', null, 'Save habits that cover everything else'));
  const saveList = el('ul');
  for (const tip of [
    'The game has 15 manual save slots and 1 autosave. Missions cannot be replayed, so keep a save at the start and end of each chapter, then rotate the rest during free roam.',
    'Cheats disable trophies — and they also stop the game saving. Keep them off the file you take to the platinum.',
    'The Irredeemable criminal profile is permanent and makes police more aggressive. It does not block any trophy, but it makes the cleanup harder — worth knowing before you go loud in every mission.',
  ]) saveList.append(el('li', null, tip));
  saves.append(saveList);
  container.append(saves);
}
