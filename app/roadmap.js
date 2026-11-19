// The roadmap to the platinum and the missables panel, both built from the
// trophy data: stages in earning order, and the one trophy that may be missed.
const STAGES = [
  {
    stage: 1,
    title: 'Stage 1: Story and side quests — about 60 to 80 hours',
    text: 'Play the story at your own pace and take optional missions as they appear. Scan every new vehicle with the WAiNK app (100% needs 200 of 277), study new animals through the binoculars (100% needs 100 of 255), and do the Chapter 1 meditation the moment it is offered. There are no mission medals this time, so nothing about how you play a mission matters.',
  },
  {
    stage: 2,
    title: 'Stage 2: The 100% checklist — about 100 hours',
    text: 'After the credits, open Progress, then Stats, then 100% Completion and work through what is left. PowerPyx calls the list lenient, closer to 60% of true completion; Push Square says you still need almost everything, including 15 of the 18 card sets. Robberies, underwater finds, shooting ranges, drone races and Bret\u2019s quests need everything; the rest need only a share: 70 of 80 challenges, 15 of 18 meditations, 300 stunts, 100 optional missions.',
  },
  {
    stage: 3,
    title: 'Stage 3: Strangers & Freaks and cleanup — about 10 hours',
    text: 'Stranger strands are not part of 100%, so finish the 8 that count, mop up any trophy left on the list, and the platinum follows. The two trophies still marked NOT YET KNOWN sit here too: check back once a guide confirms them.',
  },
];

export function renderRoadmap(trophies, earned) {
  const host = document.getElementById('roadmap-stages');
  host.replaceChildren();
  for (const stage of STAGES) {
    const members = trophies
      .filter((trophy) => trophy.stage === stage.stage)
      .sort((a, b) => a.id - b.id);
    const box = document.createElement('div');
    box.className = 'stage';
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    box.append(heading);
    const blurb = document.createElement('p');
    blurb.textContent = stage.text;
    box.append(blurb);
    const list = document.createElement('ul');
    for (const trophy of members) {
      const item = document.createElement('li');
      if (earned.has(trophy.name)) item.className = 'done';
      item.textContent = `${earned.has(trophy.name) ? '✓ ' : ''}${trophy.name} (${trophy.grade})`;
      list.append(item);
    }
    box.append(list);
    host.append(box);
  }
}

export function renderMissables(trophies, earned) {
  const host = document.getElementById('missable-list');
  host.replaceChildren();
  const flagged = trophies.filter((trophy) => trophy.missable);
  if (flagged.length === 0) {
    host.textContent = 'No trophy is flagged missable.';
    return;
  }
  for (const trophy of flagged) {
    const card = document.createElement('div');
    card.className = 'missable-card';
    const heading = document.createElement('h3');
    heading.textContent = `${trophy.name} — possibly missable`;
    card.append(heading);
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    card.append(guide);
    const note = document.createElement('p');
    note.textContent = 'The sources disagree here, and this guide does not hide it: PowerPyx and GTABase flag this one as possibly missable, while Push Square lists no known missables. Doing the Chapter 1 meditation costs a minute and removes the risk either way.';
    card.append(note);
    const state = document.createElement('p');
    state.textContent = earned.has(trophy.name) ? 'Earned ✓' : 'Not earned yet.';
    card.append(state);
    host.append(card);
  }
  const others = document.createElement('p');
  others.textContent = 'Every other trophy can be earned after the story in free roam. PowerPyx and GTABase agree on that, and Push Square\u2019s guide lists no missables at all.';
  host.append(others);
}
