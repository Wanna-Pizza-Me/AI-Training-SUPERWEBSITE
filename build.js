// Stitches index.template.html + jobs-mercor.json + jobs-dataannotation.json
// + jobs-turing.json + jobs-meridial.json + jobs-micro1.json
// + jobs-afterquery.json into index.html. Also server-renders the initial
// job grid (see SSR RENDERING below) and regenerates robots.txt / sitemap.xml.
// Run the six generate-*.js scripts first to refresh the data, then: node build.js

const fs = require('fs');
const path = require('path');

const dir = __dirname;
const SITE_URL = 'https://ai-training-superwebsite.vercel.app';

const template = fs.readFileSync(path.join(dir, 'index.template.html'), 'utf8');
const mercorJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-mercor.json'), 'utf8'));
const dataannotationJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-dataannotation.json'), 'utf8'));
const turingJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-turing.json'), 'utf8'));
const meridialJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-meridial.json'), 'utf8'));
const micro1Jobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-micro1.json'), 'utf8'));
const afterqueryJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-afterquery.json'), 'utf8'));
const referralConfig = JSON.parse(fs.readFileSync(path.join(dir, 'referral-config.json'), 'utf8'));

const JOBS = [...mercorJobs, ...dataannotationJobs, ...turingJobs, ...meridialJobs, ...micro1Jobs, ...afterqueryJobs];

const now = new Date();

/* =========================================================================
   STALENESS CHECK
   Each generate-*.js exits cleanly when its source is unreachable, keeping
   the previous jobs-<source>.json rather than failing the whole build. That
   is the right call for uptime, but it means a source can quietly stop
   refreshing and nobody notices — AfterQuery did exactly that for 11 days.
   So: warn loudly in the build log for any source whose data file hasn't
   been rewritten recently. This does not fail the build, it just makes the
   silence visible.
   ========================================================================= */
const STALE_AFTER_DAYS = 2;
const SOURCE_FILES = {
  Mercor: 'jobs-mercor.json',
  DataAnnotation: 'jobs-dataannotation.json',
  Turing: 'jobs-turing.json',
  Meridial: 'jobs-meridial.json',
  Micro1: 'jobs-micro1.json',
  AfterQuery: 'jobs-afterquery.json',
};
const staleSources = [];
for (const [source, file] of Object.entries(SOURCE_FILES)) {
  const ageDays = (now - fs.statSync(path.join(dir, file)).mtime) / 86400000;
  if (ageDays > STALE_AFTER_DAYS) {
    staleSources.push(`${source} (${ageDays.toFixed(1)}d)`);
  }
}
if (staleSources.length) {
  console.warn(`STALE DATA WARNING — these sources have not refreshed in over ${STALE_AFTER_DAYS} days: ${staleSources.join(', ')}. Their listings are still being served from the last successful fetch and may be out of date.`);
}

// Escape "</" so a job title/blurb containing e.g. "</script>" can't
// prematurely close the inline <script> tag when the browser parses this
// file (job descriptions are free text scraped from other sites, so this
// WILL happen eventually — CUDA/coding roles routinely mention HTML tags).
// Using a function replacer (not a plain string) also sidesteps the
// special $-pattern handling String.replace applies to string replacements.
function embed(json) {
  return json.replace(/<\//g, '<\\/');
}

/* =========================================================================
   SSR RENDERING
   Mirrors buildApplyUrl()/accentVar()/escapeHtml()/cardHTML() in
   index.template.html's client-side script exactly. This renders the full,
   unfiltered job grid directly into the HTML at build time so the listings
   are readable by crawlers and AI answer-engine fetchers that don't execute
   JavaScript — previously #jobGrid shipped empty and only filled in client-
   side, meaning non-JS-executing bots saw zero listings. The client script
   still re-renders on load (for interactivity), producing identical output
   in the default (unfiltered) state.
   If you change cardHTML()/escapeHtml()/accentVar() in the template, update
   the matching logic here too — this is intentionally duplicated rather
   than shared, since the browser copy runs as an inline <script> string.
   ========================================================================= */
const ACCENTS = {
  Mercor: 'var(--mercor)',
  DataAnnotation: 'var(--dataannotation)',
  Turing: 'var(--turing)',
  Meridial: 'var(--meridial)',
  Micro1: 'var(--micro1)',
  AfterQuery: 'var(--afterquery)',
};
function accentVar(company) {
  return ACCENTS[company] || 'var(--mercor)';
}

function buildApplyUrl(job) {
  try {
    const url = new URL(job.url);
    const cfg = referralConfig[job.company];
    if (cfg && cfg.code) {
      url.searchParams.set(cfg.param, cfg.code);
    }
    return url.toString();
  } catch (e) {
    return job.url;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function cardHTML(job) {
  // buildApplyUrl falls back to the raw job.url when the URL won't parse,
  // so escape it here rather than trusting it in the href attribute.
  const applyUrl = escapeHtml(buildApplyUrl(job));
  const accent = accentVar(job.company);
  const company = escapeHtml(job.company);
  const domain = escapeHtml(job.domain);
  const title = escapeHtml(job.title);
  const blurb = escapeHtml(job.blurb);
  const pay = escapeHtml(job.pay);
  const tag = escapeHtml(job.tag);
  return `
    <a class="card" style="--accent:${accent}" href="${applyUrl}" target="_blank" rel="noopener noreferrer sponsored">
      <div class="card-label">
        <span>${company}</span>
        ${domain ? `<span class="sep">·</span><span class="dom">${domain}</span>` : ''}
      </div>
      <h3>${title}</h3>
      <p class="card-desc">${blurb}</p>
      <div class="card-foot">
        <div>
          <div class="pay">${pay}</div>
          <div class="tag">${tag}</div>
        </div>
        <div class="apply-row">Apply
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M7 17 17 7M8 7h9v9"/></svg>
        </div>
      </div>
    </a>`;
}

const jobCardsHTML = JOBS.map(cardHTML).join('');

// Matches the client script's own toLocaleDateString('en-US', {...}) format
// exactly, so the server-rendered label and the JS-recomputed one never
// visibly disagree.
const generatedAtLabel = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(now);

const out = template
  .replace('{{MERCOR_JOBS_JSON}}', () => embed(JSON.stringify(mercorJobs)))
  .replace('{{DATAANNOTATION_JOBS_JSON}}', () => embed(JSON.stringify(dataannotationJobs)))
  .replace('{{TURING_JOBS_JSON}}', () => embed(JSON.stringify(turingJobs)))
  .replace('{{MERIDIAL_JOBS_JSON}}', () => embed(JSON.stringify(meridialJobs)))
  .replace('{{MICRO1_JOBS_JSON}}', () => embed(JSON.stringify(micro1Jobs)))
  .replace('{{AFTERQUERY_JOBS_JSON}}', () => embed(JSON.stringify(afterqueryJobs)))
  .replace('{{REFERRAL_CONFIG_JSON}}', () => JSON.stringify(referralConfig))
  .replace('{{GENERATED_AT_ISO}}', () => now.toISOString())
  .replace('{{GENERATED_AT_LABEL}}', () => generatedAtLabel)
  .replace(/\{\{SITE_URL\}\}/g, () => SITE_URL)
  .replace(/\{\{JOBS_TOTAL\}\}/g, () => String(JOBS.length))
  .replace(/\{\{COMPANIES_TOTAL\}\}/g, () => String(new Set(JOBS.map(j => j.company)).size))
  .replace('{{JOB_CARDS_HTML}}', () => jobCardsHTML);

fs.writeFileSync(path.join(dir, 'index.html'), out);

/* =========================================================================
   robots.txt + sitemap.xml
   Explicitly allow the major AI-answer-engine crawlers (many respect
   robots.txt even though they ignore JS) alongside standard search bots.
   ========================================================================= */
const robotsTxt = `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(dir, 'robots.txt'), robotsTxt);

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now.toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemapXml);

console.log(
  `Built index.html — ${mercorJobs.length} Mercor + ${dataannotationJobs.length} DataAnnotation + ${turingJobs.length} Turing + ${meridialJobs.length} Meridial + ${micro1Jobs.length} Micro1 + ${afterqueryJobs.length} AfterQuery listings (${JOBS.length} total), generated ${now.toISOString()}`
);
console.log('Wrote robots.txt and sitemap.xml');
