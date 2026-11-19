[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/georgeonweb3/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/georgeonweb3/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Ledger — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze), built for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

A static web app under `app/` — no build step, no network at run time. Open `app/index.html` in desktop Chrome (or `node serve.ts` and visit http://localhost:8080) and it works with the network off.

- **Tracker** — every trophy with its official name, description and grade, a checkbox saved in the browser (localStorage), export to a file and import back, search, filters by kind (story, missable, collectibles, activities, online) and grade, and a spoiler setting that hides story trophies' names and descriptions until they are earned.
- **Roadmap to the platinum** — three steps with hours (story 60–80h, 100% checklist ~100h, cleanup ~10h), the platinum facts (4/10, ~200 hours, 1 playthrough, 0 online trophies, cheats off), and the warnings that matter (no mission replay, keep chapter-start saves).
- **Missables** — the one potentially missable trophy, Positive Mental Attitude, with the Chapter 1 meditation spelled out, plus why everything else is safe.
- **A cited guide for every trophy** — each guide is this project's own words, and each names its sources beside it: the tracker lists (Exophase, PSNProfiles) for names, descriptions and grades, and the PowerPyx trophy guide for steps and counts.

## What is confirmed, and what is not

Rockstar, Sony and Microsoft published no official trophy list before launch. The 55 names, descriptions and grades here are the list Exophase and PSNProfiles carried before this guide was written, the two agreeing on every entry, and the same 55 went live on PlayStation and Xbox data on launch day, 19 November 2026.

Five trophies had no verified method in any published guide on 18 November 2026 — In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, and Ten Pin. Their guides say so plainly, with the unconfirmed lead labelled as a lead, instead of guessing.

## Layout

- `app/index.html` — the shell: progress card, tabs, toolbar
- `app/style.css` — the paper-ledger look
- `app/js/main.js` — boot and wiring
- `app/js/store.js` — localStorage progress, export/import
- `app/js/filters.js` — kind, grade, search and spoiler predicates
- `app/js/views.js` — checklist, roadmap, missables and sources rendering
- `app/data/trophies.json` — the 55 trophies with guides and sources
- `app/data/roadmap.json` — roadmap facts, steps and warnings
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — 4 real renders of the app in a browser (see `shots.json`)

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT. See [LICENSE](LICENSE). Unofficial fan guide; no Rockstar logo, artwork or game screenshots are used.
