// Filters: which trophies the checklist shows. Kind is the trophy's own
// category in the data file; "missable" is a flag, not a kind, so it cuts
// across the others. Search matches the name, the official description, the
// guide and the source name, all case-insensitive.

export const KIND_LABELS = {
  story: 'Story',
  side: 'Side strand',
  collectible: 'Collectible',
  activity: 'Activity',
  crime: 'Crime & heist',
  world: 'World & money',
  platinum: 'Platinum',
};

export function createFilterState() {
  return {
    query: '',
    grade: 'all',
    kind: 'all',
    hideEarned: false,
    spoiler: false,
  };
}

export function trophyMatches(trophy, state, earned) {
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  if (state.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (state.kind !== 'all' && trophy.kind !== state.kind) {
    return false;
  }
  if (state.hideEarned && earned.has(trophy.id)) return false;
  const q = state.query.trim().toLowerCase();
  if (q) {
    const haystack = [trophy.name, trophy.description, trophy.guide, trophy.source, KIND_LABELS[trophy.kind] || '']
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

export function describeFilter(trophies, state, shown, earnedCount) {
  const parts = [];
  if (state.kind !== 'all') parts.push(state.kind === 'missable' ? 'missable only' : KIND_LABELS[state.kind] || state.kind);
  if (state.grade !== 'all') parts.push(`${state.grade} only`);
  if (state.query.trim()) parts.push(`matching "${state.query.trim()}"`);
  if (state.hideEarned) parts.push('unearned only');
  const scope = parts.length ? ` — ${parts.join(', ')}` : '';
  return `Showing ${shown} of ${trophies.length} trophies${scope}. ${earnedCount} earned in total.`;
}
