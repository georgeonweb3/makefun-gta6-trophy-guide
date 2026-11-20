// filters.js — deciding which trophies a list shows, and what the
// spoiler setting hides.
//
// Kinds follow the guide's own grouping: story chapters, named story
// missions, stranger strands, collectibles, activities, crime and
// partner jobs, and the odd ones left over as miscellaneous. The spoiler
// setting masks only story trophies (chapters, named missions and
// stranger strands) that the reader has not earned yet: their name and
// description become a plain "Hidden story trophy" line, while their
// grade and kind still show, so the checklist stays countable.

export const KIND_LABELS = {
  story: 'Story',
  mission: 'Story mission',
  stranger: 'Stranger',
  collectible: 'Collectible',
  activity: 'Activity',
  crime: 'Crime & partner',
  misc: 'Miscellaneous',
  platinum: 'Platinum',
};

export const SPOILER_KINDS = new Set(['story', 'mission', 'stranger']);

export function trophyIsHiddenBySpoiler(trophy, earned, spoilerOn) {
  return spoilerOn && !earned.has(trophy.id) && SPOILER_KINDS.has(trophy.kind);
}

export function visibleName(trophy, earned, spoilerOn) {
  return trophyIsHiddenBySpoiler(trophy, earned, spoilerOn)
    ? 'Hidden story trophy'
    : trophy.name;
}

export function visibleDescription(trophy, earned, spoilerOn) {
  return trophyIsHiddenBySpoiler(trophy, earned, spoilerOn)
    ? 'Earn this trophy in the game to reveal its name and description.'
    : trophy.description;
}

export function applyFilters(trophies, state) {
  const query = state.search.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (state.kind !== 'all' && trophy.kind !== state.kind) return false;
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (state.earnedOnly && !state.earned.has(trophy.id)) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function gradeCounts(trophies, earned) {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const trophy of trophies) {
    counts[trophy.grade][1] += 1;
    if (earned.has(trophy.id)) counts[trophy.grade][0] += 1;
  }
  return counts;
}
