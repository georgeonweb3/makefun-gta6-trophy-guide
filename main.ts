// Vice City Trophy Companion — the hand-in program for make.fun's
// gta6-trophy-guide-01. Node 22, standard library only.
//
// The guide itself is app/: plain static files (index.html, one CSS
// file, small ES modules, data/trophies.json with the 55 trophies and
// their cited guides, and an SVG favicon). There is no build step and
// the app fetches nothing over the network at run time.
//
// This program hands the guide in: it copies app/ and screenshots/
// from beside this file into the output directory and writes
// dossier.json there, using the vendored make.fun library to build
// the dossier. vendor/makefun-frontend.ts is left exactly as the kit
// shipped it — the scorer rebuilds the dossier from its own copy of
// the same library and expects the two to match byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps match the gate: at most 4 screenshots, each at most 256 KiB;
// app/ at most 993 files and 48 MiB; the dossier text at most 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
