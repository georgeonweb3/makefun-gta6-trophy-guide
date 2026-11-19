// Export and import of tracker progress as a plain JSON file.
export function exportProgress(earned) {
  const payload = {
    app: 'Leonida Trophy Atlas',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-trophy-atlas-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export async function readImportedFile(file) {
  const parsed = JSON.parse(await file.text());
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.earned)) return parsed.earned;
  throw new Error('That file does not hold a trophy progress list.');
}
