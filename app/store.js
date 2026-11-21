// Progress store: the earned set lives in localStorage, so a tick survives a
// reload. Export writes it to a file; import reads one back. Demo mode
// (?demo=1) seeds 17 earned trophies in memory only and never touches the
// real save, so screenshots never disturb a player's own progress.

export const STORAGE_KEY = 'leonida-trophy-companion-v1';

// A plausible early-game save for screenshots: the opening, Chapters 1-3,
// three story missions, and a handful of open-world trophies.
export const DEMO_EARNED = [2, 3, 4, 5, 8, 9, 10, 15, 16, 18, 19, 20, 21, 28, 35, 42, 44];

function readSavedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55);
  } catch {
    return [];
  }
}

export function createStore(demo) {
  const earned = new Set(demo ? DEMO_EARNED : readSavedIds());
  const store = {
    demo: Boolean(demo),
    earned,
    isEarned(id) {
      return earned.has(id);
    },
    toggle(id) {
      if (earned.has(id)) earned.delete(id);
      else earned.add(id);
      store.save();
    },
    setAll(ids) {
      earned.clear();
      for (const id of ids) earned.add(id);
      store.save();
    },
    save() {
      if (store.demo) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
      } catch {
        // Private mode or a full store: progress still works for the session.
      }
    },
    exportText() {
      return JSON.stringify({ app: 'leonida-trophy-companion', version: 1, earned: [...earned].sort((a, b) => a - b) }, null, 2);
    },
    // Returns { ok: true, count } or { ok: false, error }.
    importText(text) {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return { ok: false, error: 'That file is not valid JSON.' };
      }
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) return { ok: false, error: 'That file holds no earned list.' };
      const clean = ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55);
      if (clean.length === 0 && ids.length > 0) return { ok: false, error: 'That file holds no trophy numbers 1-55.' };
      store.setAll(clean);
      return { ok: true, count: clean.length };
    },
  };
  return store;
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
