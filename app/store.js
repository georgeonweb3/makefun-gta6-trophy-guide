// Progress and settings storage for the Vice City Trophy Companion.
// Progress lives in localStorage under this guide's own keys, and can be
// exported to a file and imported back. Nothing leaves the browser.
export const PROGRESS_KEY = 'vice-city-companion-progress-v1';
export const SETTINGS_KEY = 'vice-city-companion-settings-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const names = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(names) ? names : []);
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { spoiler: Boolean(parsed && parsed.spoiler) };
  } catch {
    return { spoiler: false };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportProgress(earned) {
  const blob = new Blob([JSON.stringify([...earned], null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'vice-city-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function readImportedProgress(file, knownNames) {
  const parsed = JSON.parse(await file.text());
  if (!Array.isArray(parsed)) throw new Error('not a list');
  return new Set(parsed.filter((name) => knownNames.has(name)));
}
