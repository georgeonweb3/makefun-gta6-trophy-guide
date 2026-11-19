// Tracker state: the earned set and the reader's settings, kept in localStorage.
// Keys belong to this guide only, so another guide's ticks never leak in.
export const EARNED_KEY = 'leonida-trophy-atlas-earned-v1';
export const SETTINGS_KEY = 'leonida-trophy-atlas-settings-v1';

export function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((name) => typeof name === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}

export function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    return { spoiler: Boolean(raw && raw.spoiler) };
  } catch {
    return { spoiler: false };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Keep only names this guide actually lists, so a stale import cannot invent trophies.
export function cleanEarned(names, trophies) {
  const known = new Set(trophies.map((trophy) => trophy.name));
  return new Set(names.filter((name) => known.has(name)));
}
