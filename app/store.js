// store.js — saving progress in the browser, nothing sent anywhere.
//
// Progress lives in localStorage under one key, as a JSON list of earned
// trophy ids. Export downloads that list as a file; import reads such a
// file back. A ?demo=1 address seeds a fixed example set (used for the
// entry's screenshots) so the first paint already shows progress.

export const STORAGE_KEY = 'vice-city-trophy-companion-v1';

// A fixed example set for screenshots: the story through Chapter 2, the
// first named missions, and a few early activities — 17 of 55 earned.
export const DEMO_EARNED = [2, 3, 4, 8, 9, 10, 15, 16, 21, 28, 35, 39, 41, 46, 51, 53, 55];

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // A full or blocked store just means progress is not kept this visit.
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

export function seedDemoProgress() {
  const earned = new Set(DEMO_EARNED);
  saveProgress(earned);
  return earned;
}

export function exportProgress(earned, trophies) {
  const payload = {
    app: 'Vice City Trophy Companion',
    exportedAt: new Date().toISOString(),
    total: trophies.length,
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vice-city-trophies-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importProgressFile(file, trophyIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('That file does not hold a list of earned trophies.');
  const known = new Set(trophyIds);
  const earned = new Set(list.filter((id) => Number.isInteger(id) && known.has(id)));
  saveProgress(earned);
  return earned;
}
