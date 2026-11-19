// Leonida Ledger hands itself in: a Node 22 program, standard library only, that
// copies this repository's app/ and screenshots/ into /output (or MAKEFUN_OUTPUT_DIR
// outside the grader) and writes /output/dossier.json with the vendored make.fun
// library. The library must stay byte for byte the kit's copy: the scorer rebuilds
// the dossier with its own copy and compares the two.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the guide while you work on it with:
//   node serve.ts
// then open http://localhost:8080 in desktop Chrome.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: at most 4 screenshots, each at most 256 KiB; app/ at most
// 993 files and directories and 48 MiB in all. The dossier text is capped at
// 163,840 bytes, so the guide's source files are kept small and single-purpose.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
console.log(`Leonida Ledger written to ${out}`);
