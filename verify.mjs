// Functional check of the Leonida Trophy Atlas in headless Chromium:
// render, save/load, export/import, filters, spoiler mode, roadmap, missables.
import { chromium } from '/home/hatch/workspace/tools/pptr/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';

const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`;
const BASE = 'http://localhost:8092';
const results = [];
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
const badRequests = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', (r) => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:')) badRequests.push(u); });

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('.trophy', { timeout: 10000 });

check('renders 55 trophies', (await page.locator('.trophy').count()) === 55, `${await page.locator('.trophy').count()} cards`);
check('progress starts 0 of 55', (await page.locator('#progressCount').textContent()).includes('0 of 55'));
check('next-up names a story trophy', (await page.locator('#nextUp').textContent()).includes('Just Like Paradise'));

// Tick two trophies, reload, confirm persistence.
await page.locator('.trophy-check').nth(1).click();
await page.locator('.trophy-check').nth(14).click();
await page.waitForTimeout(300);
check('progress updates to 2 of 55', (await page.locator('#progressCount').textContent()).includes('2 of 55'));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('.trophy');
check('ticks survive reload (localStorage)', (await page.locator('#progressCount').textContent()).includes('2 of 55'));
check('next-up skips earned trophies', (await page.locator('#nextUp').textContent()).includes('Paradise Lost'));

// Guide toggle shows guide + source.
await page.locator('.trophy', { hasText: 'Positive Mental Attitude' }).first().locator('.guide-toggle').click();
await page.waitForTimeout(200);
const guideText = await page.locator('.trophy', { hasText: 'Positive Mental Attitude' }).first().locator('.guide').textContent();
check('guide opens with source', guideText.includes('PowerPyx') && guideText.includes('Chapter 1'));
check('missable note shown', guideText.includes('Missable'));

// Kind filter: missable shows exactly 1.
await page.selectOption('#kindFilter', 'missable');
await page.waitForTimeout(200);
check('missable filter shows 1', (await page.locator('.trophy').count()) === 1);
await page.selectOption('#kindFilter', 'online');
await page.waitForTimeout(200);
check('online filter shows 0 + note', (await page.locator('.trophy').count()) === 0 && (await page.locator('#filterNote').textContent()).includes('no online trophies'));
await page.selectOption('#kindFilter', 'all');

// Search.
await page.fill('#search', 'maximum withdrawal');
await page.waitForTimeout(200);
check('search finds Maximum Withdrawal', (await page.locator('.trophy').count()) === 1);
await page.fill('#search', '');

// Spoiler mode hides story names until earned.
await page.check('#spoilerToggle');
await page.waitForTimeout(200);
const names = await page.locator('.trophy-name').allTextContents();
check('spoiler hides un-earned story names', names.includes('Hidden story trophy') && !names.includes('Paradise Lost'));
check('spoiler keeps earned story name visible', names.includes('Just Like Paradise'));
check('spoiler masks next-up story name', (await page.locator('#nextUp').textContent()).includes('hidden story trophy') && !(await page.locator('#nextUp').textContent()).includes('Paradise Lost'));
await page.uncheck('#spoilerToggle');

// Export: capture the download.
const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
await page.click('#exportBtn');
const download = await downloadPromise;
const exportPath = '/tmp/export-test.json';
await download.saveAs(exportPath);
const exported = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
check('export writes earned names', exported.earned.length === 2 && exported.earned.includes('Just Like Paradise'));

// Import: clear via file input with a 3-name payload.
const importPayload = { app: 'Leonida Trophy Atlas', version: 1, earned: ['Vice City, Baby!', 'Top Of The World, Ma', 'No Such Trophy'] };
fs.writeFileSync('/tmp/import-test.json', JSON.stringify(importPayload));
await page.setInputFiles('#importFile', '/tmp/import-test.json');
await page.waitForTimeout(300);
check('import loads 2 known, drops unknown', (await page.locator('#progressCount').textContent()).includes('2 of 55') && (await page.locator('#savedNote').textContent()).includes('Imported 2'));

// Roadmap tab renders 3 stages + finale, counts add up.
await page.click('button[data-tab="roadmap"]');
await page.waitForTimeout(200);
check('roadmap shows 3 stages + finale', (await page.locator('.stage').count()) === 4);
const stageCounts = await page.locator('.stage-list li').count();
check('roadmap lists 54 stage trophies', stageCounts === 54, `${stageCounts} rows`);

// Missables tab flags the one trophy.
await page.click('button[data-tab="missables"]');
await page.waitForTimeout(200);
check('missables tab names Positive Mental Attitude', (await page.locator('#panel-missables').textContent()).includes('Positive Mental Attitude'));
check('missables tally says 1 of 55', (await page.locator('#panel-missables').textContent()).includes('1 of 55 trophies is flagged missable'));

check('zero console/page errors', errors.length === 0, errors.join(' | '));
check('zero non-local requests', badRequests.length === 0, badRequests.join(', '));

console.log(results.join('\n'));
console.log(results.some((r) => r.startsWith('FAIL')) ? 'OVERALL: FAIL' : 'OVERALL: ALL PASS');
await browser.close();
