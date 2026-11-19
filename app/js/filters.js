// Filter predicates for the tracker: kind, grade, search text, spoiler mode, hide-earned.
export function kindOf(trophy) {
  return trophy.kind;
}

export function isMissable(trophy) {
  return trophy.missable === true;
}

export function isUnknown(trophy) {
  return typeof trophy.guide === 'string' && trophy.guide.startsWith('NOT YET KNOWN');
}

export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return isMissable(trophy);
  if (kind === 'online') return false;
  return trophy.kind === kind;
}

export function matchesGrade(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function matchesSearch(trophy, query) {
  if (!query) return true;
  const hay = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.chapter ?? ''}`.toLowerCase();
  return query.toLowerCase().split(/\s+/).every((word) => hay.includes(word));
}

export function countByKind(trophies) {
  const counts = { all: trophies.length, story: 0, missable: 0, collectibles: 0, activities: 0, online: 0 };
  for (const t of trophies) {
    if (t.kind === 'story') counts.story += 1;
    if (t.kind === 'collectibles') counts.collectibles += 1;
    if (t.kind === 'activities') counts.activities += 1;
    if (isMissable(t)) counts.missable += 1;
  }
  return counts;
}
