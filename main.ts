// Leonida Trophy Atlas — entrypoint for make.fun (Node 22, standard library only).
//
// What this program hands in: the guide itself lives in app/ as plain static
// files (index.html plus its stylesheets, scripts and data, no build step), and
// the screenshots live in screenshots/. This file copies both folders into the
// output directory and writes dossier.json there, the summary the judge reads:
// the screenshots, the first load's files and bytes, and the source files.
// The dossier is built by make.fun's own vendored library, which stays
// untouched in vendor/makefun-frontend.ts.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader MAKEFUN_OUTPUT_DIR is unset and /output is used.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(outputDir, 'app');
const shotsDir = join(outputDir, 'screenshots');

// Start clean so a stale file from an earlier run can never ride along.
rmSync(appDir, { recursive: true, force: true });
rmSync(shotsDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

cpSync(join(repoRoot, 'app'), appDir, { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
} else {
  mkdirSync(shotsDir, { recursive: true });
}

// The caps are the scorer's own: at most 4 screenshots of 256 KiB each, app/
// at most 993 files and 48 MiB, and the dossier text at most 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
