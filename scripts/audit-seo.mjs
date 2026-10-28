// Reads the sitemap and checks every page has the basics search and social
// cards need. Blog posts, conferences and events also need their structured
// data. Run against a local server or production:
//   SEO_BASE_URL=https://www.chrislanejones.com pnpm run check:seo
const baseURL = (process.env.SEO_BASE_URL || 'http://localhost:3100').replace(/\/$/, '');
const SITE_URL = 'https://www.chrislanejones.com';
// Search engines get metadata in <head> without streaming; ask as one.
const headers = { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' };

const SCHEMA_FOR = [
  [/^\/blog\/[^/]+$/, 'BlogPosting'],
  [/^\/conferences\/\d{4}\/[^/]+$/, 'Event'],
  [/^\/events\/[^/]+$/, 'Event'],
];

const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const metaTags = (html) => [...html.matchAll(/<(?:meta|link)\b[^>]*>/g)].map(([tag]) => tag);
const decode = (text) => text.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function schemaTypes(html) {
  const types = new Set();
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== 'object') return;
    [node['@type']].flat().filter(Boolean).forEach((type) => types.add(type));
    if (node['@graph']) visit(node['@graph']);
  };
  for (const [, body] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { visit(JSON.parse(body)); } catch { types.add('INVALID_JSON'); }
  }
  return types;
}

async function audit(url) {
  const path = new URL(url).pathname.replace(/\/$/, '') || '/';
  const problems = [];
  const response = await fetch(`${baseURL}${path}`, { headers });
  if (!response.ok) return { path, problems: [`HTTP ${response.status}`] };
  const html = await response.text();
  const tags = metaTags(html);
  const find = (key, value) => tags.find((tag) => attr(tag, key) === value);

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title?.trim()) problems.push('no title');
  const description = decode(attr(find('name', 'description') ?? '', 'content') ?? '');
  if (!description) problems.push('no description');
  else if (description.length < 50 || description.length > 160) problems.push(`description is ${description.length} characters (50–160)`);
  const canonical = attr(find('rel', 'canonical') ?? '', 'href');
  const expected = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
  if (!canonical) problems.push('no canonical');
  else if (canonical.replace(/\/$/, '') !== expected) problems.push(`canonical is ${canonical}`);
  if (!attr(find('property', 'og:image') ?? '', 'content')) problems.push('no og:image');
  if (/noindex/.test(attr(find('name', 'robots') ?? '', 'content') ?? '')) problems.push('in the sitemap but noindex');
  const needs = SCHEMA_FOR.find(([pattern]) => pattern.test(path))?.[1];
  const types = schemaTypes(html);
  if (types.has('INVALID_JSON')) problems.push('JSON-LD does not parse');
  if (needs && !types.has(needs)) problems.push(`no ${needs} JSON-LD`);
  return { path, problems };
}

const sitemap = await (await fetch(`${baseURL}/sitemap.xml`, { headers })).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => decode(loc));
if (!urls.length) throw new Error(`No URLs in ${baseURL}/sitemap.xml`);

const results = [];
for (let i = 0; i < urls.length; i += 4) {
  results.push(...await Promise.all(urls.slice(i, i + 4).map(audit)));
}
const failed = results.filter(({ problems }) => problems.length);
for (const { path, problems } of failed) console.log(`✗ ${path}\n    ${problems.join('\n    ')}`);
console.log(`\n${results.length - failed.length}/${results.length} pages pass (${baseURL})`);
process.exit(failed.length ? 1 : 0);
