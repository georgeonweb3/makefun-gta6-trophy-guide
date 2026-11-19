// Filtering for the trophy checklist: text search, kind, grade and the
// spoiler setting, which hides story trophies until they are earned.
export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  side: 'Side quests',
  crime: 'Crime & robberies',
  secrets: 'One-off secrets',
  platinum: 'Platinum & 100%',
  online: 'Online',
};

export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'online') return false;
  if (kind === 'missable') return trophy.missable === true;
  return trophy.kind === kind;
}

export function trophyMatchesSearch(trophy, query) {
  if (!query) return true;
  const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function trophyMatchesGrade(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function trophyIsSpoilerHidden(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

export function visibleTrophies(trophies, state) {
  return trophies.filter((trophy) =>
    trophyMatchesKind(trophy, state.kind) &&
    trophyMatchesGrade(trophy, state.grade) &&
    trophyMatchesSearch(trophy, state.search));
}
