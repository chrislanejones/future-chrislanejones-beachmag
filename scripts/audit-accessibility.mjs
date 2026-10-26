import { chromium } from 'playwright';
import axe from 'axe-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const baseURL = process.env.A11Y_BASE_URL || 'http://localhost:3100';
const paths = process.env.A11Y_PATHS?.split(',') || [
  '/', '/about', '/career-and-resume', '/events',
  '/events/buildweek-jacksonville-kickoff-2026-10-19', '/contact',
  '/projects', '/blog', '/conferences', '/browser-tabs', '/link-page',
  '/logo-page', '/react-maintenance', '/wordpress-maintenance',
  '/site-history', '/site-map', '/admin-showcase', '/color-guide',
];
const modes = (process.env.A11Y_MODES || 'desktop-light,desktop-dark,mobile-light,mobile-dark').split(',');
const output = resolve(process.env.A11Y_OUTPUT || 'output/accessibility/report.json');
const browser = await chromium.launch({ headless: true });
const reports = [];
await mkdir(dirname(output), { recursive: true });
try {
  for (const mode of modes) {
    const mobile = mode.startsWith('mobile');
    const theme = mode.endsWith('dark') ? 'dark' : 'light';
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      colorScheme: theme, reducedMotion: 'reduce', hasTouch: mobile, isMobile: mobile,
      bypassCSP: true,
    });
    await context.addInitScript((value) => localStorage.setItem('theme', value), theme);
    const page = await context.newPage();
    for (const path of paths) {
      try {
        const response = await page.goto(new URL(path, baseURL).href, { waitUntil: 'networkidle', timeout: 45000 });
        if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
        await page.evaluate(() => document.fonts.ready);
        await page.addScriptTag({ content: axe.source });
        const result = await page.evaluate(async () => window.axe.run({ exclude: [['nextjs-portal']] }, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        }));
        const reflow = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
        reports.push({ path, mode, reflow, violations: result.violations, incomplete: result.incomplete, passes: result.passes.length });
        console.log(`${mode} ${path}: ${result.violations.length} violations; ${result.incomplete.length} manual checks${reflow.document > reflow.viewport ? '; horizontal overflow' : ''}`);
      } catch (error) {
        reports.push({ path, mode, error: String(error) });
        console.error(`${mode} ${path}: ${error}`);
      }
      await writeFile(output, JSON.stringify({ baseURL, axeVersion: axe.version, recordedAt: new Date().toISOString(), reports }, null, 2));
    }
    await context.close();
  }
} finally {
  await browser.close();
}
const failures = reports.filter((report) => report.error || report.violations?.length || report.reflow.document > report.reflow.viewport);
console.log(`\n${reports.length} page/theme checks; ${failures.length} failed. Report: ${output}`);
console.log('Automated checks do not establish WCAG conformance. Review incomplete findings and test keyboard, screen-reader and interactive states.');
process.exitCode = failures.length ? 1 : 0;
