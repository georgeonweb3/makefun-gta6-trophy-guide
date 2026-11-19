// Screenshot the Leonida Trophy Atlas in a real browser (Playwright Chromium)
// and write 4 JPEGs into the entry's screenshots/. Progress is seeded through
// the app's own localStorage keys, exactly as a player would have it.
import { chromium } from '/home/hatch/workspace/tools/pptr/node_modules/playwright-core/index.mjs';

const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`;
const ENTRY = `${process.env.HOME}/workspace/makefun/gta6-trophy-guide-01/entry`;
const BASE = 'http://localhost:8092';

// A mid-story save: chapters 1-2 done, a few side quests and activities ticked.
const STORY_EARNED = [
  'Just Like Paradise', 'Paradise Lost', 'T**s Ass Drug Money', 'Vice City, Baby!',
  'Trust', 'Break the Bank', 'Baited My Tackle', 'Stick Fiddler',
  'Road to Rehabilitation', 'This Was No Boat Accident', 'Supply & Demand',
  'Spin On This!', 'Master of None', 'Whip It Good',
];
// A free-roam save used for the spoiler shot: story untouched, activities done.
const ACTIVITY_EARNED = [
  'Cunning Stunts', 'Master of None', 'The Shootist', 'Top Fun',
  'Earn Cash, Not Kudos', 'Stick Fiddler', 'Whip It Good', 'One Last Thing',
  'Treat Yo Self', 'Little Boxes', 'On the Spot', 'The Goodtime State',
];

const SHOTS = [
  { file: '1-tracker.jpg', earned: STORY_EARNED, tab: null, spoiler: false, openGuide: null, scroll: 0 },
  { file: '2-guide.jpg', earned: STORY_EARNED, tab: null, spoiler: false, openGuide: 'Positive Mental Attitude', scroll: 0 },
  { file: '3-roadmap.jpg', earned: STORY_EARNED, tab: 'roadmap', spoiler: false, openGuide: null, scroll: 0 },
  { file: '4-spoiler.jpg', earned: ACTIVITY_EARNED, tab: null, spoiler: true, openGuide: null, scroll: 0 },
];

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const badRequests = [];
const errors = [];
page.on('request', (request) => {
  const url = request.url();
  if (!url.startsWith(BASE) && !url.startsWith('data:')) badRequests.push(url);
});
page.on('pageerror', (error) => errors.push(`PAGE ERROR: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`CONSOLE ERROR: ${message.text()}`);
});

for (const shot of SHOTS) {
  await page.addInitScript(
    ({ earned, spoiler }) => {
      localStorage.setItem('leonida-trophy-atlas-earned-v1', JSON.stringify(earned));
      localStorage.setItem('leonida-trophy-atlas-settings-v1', JSON.stringify({ spoiler }));
    },
    { earned: shot.earned, spoiler: shot.spoiler },
  );
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.trophy', { timeout: 10000 });
  if (shot.tab) await page.click(`button[data-tab="${shot.tab}"]`);
  if (shot.openGuide) {
    const card = page.locator('.trophy', { hasText: shot.openGuide }).first();
    await card.locator('.guide-toggle').click();
    await card.scrollIntoViewIfNeeded();
  }
  await page.waitForTimeout(400);
  if (shot.scroll) await page.evaluate((y) => window.scrollTo(0, y), shot.scroll);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${ENTRY}/screenshots/${shot.file}`, type: 'jpeg', quality: 82 });
  console.log('shot:', shot.file);
  await page.evaluate(() => localStorage.clear());
}

console.log('non-local requests:', badRequests.length ? badRequests : 'none');
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
