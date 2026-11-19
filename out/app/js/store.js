// Progress store: the earned set lives in localStorage and can be exported to a file
// and imported back. Nothing leaves the browser except through the export button.
export const STORAGE_KEY = 'leonida-ledger-progress-v1';
export const SETTINGS_KEY = 'leonida-ledger-settings-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') || {};
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportProgress(earned) {
  const payload = {
    app: 'Leonida Ledger',
    game: 'Grand Theft Auto VI',
    exported_at: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importProgressFile(file, validNames) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('That file has no trophy list in it.');
  const known = new Set(validNames);
  const earned = new Set(names.filter((n) => typeof n === 'string' && known.has(n)));
  if (earned.size === 0 && names.length > 0) throw new Error('That file names no trophies from this guide.');
  return earned;
}
