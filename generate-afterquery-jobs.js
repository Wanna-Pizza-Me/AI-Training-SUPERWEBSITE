// Pulls AfterQuery's public jobs API and curates it into the JOBS shape
// used by index.html: { company, title, pay, tag, blurb, url, domain }.
// The apply URL just needs ?job=<id> — REFERRAL_CONFIG in index.template.html
// adds the ?ref=<code> param client-side, same mechanism as Mercor/DataAnnotation.
// Writes jobs-afterquery.json to this directory.
//
//   node generate-afterquery-jobs.js                  # fetch live
//   node generate-afterquery-jobs.js --from raw.json  # transform a saved payload
//
// The --from mode exists because AfterQuery put Vercel's bot-protection
// challenge in front of this endpoint (a scripted fetch gets a 429 with
// X-Vercel-Mitigated: challenge, while a normal browser loads it fine). So
// the automated daily run can no longer reach it and this source goes stale
// until someone refreshes it by hand: open the API URL in a browser, save
// the JSON, and run --from against it. Same transform either way, so a
// manual refresh produces byte-identical output to a live fetch.
// See MANUAL-REFRESH.md.

const fs = require('fs');
const path = require('path');
const { mapDomain } = require('./domain-categories');
const { normalizePosted } = require('./posted-date');

const API_URL = 'https://experts.afterquery.com/api/jobs/listings';

function formatPay(raw) {
  if (!raw) return 'Not listed';
  const nums = [...raw.matchAll(/\$?([\d,]+(?:\.\d+)?)/g)].map(m => parseFloat(m[1].replace(/,/g, '')));
  if (nums.length === 0) return 'Not listed';
  const isYearly = /\/\s*yr|year/i.test(raw);
  if (isYearly) {
    const min = Math.round(nums[0] / 1000);
    const max = Math.round((nums[1] ?? nums[0]) / 1000);
    return min === max ? `$${min}k/yr` : `$${min}k–$${max}k/yr`;
  }
  const min = nums[0];
  const max = nums[1] ?? nums[0];
  return min === max ? `$${min}/hr` : `$${min}–$${max}/hr`;
}

function truncate(text) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= 190) return t;
  const cut = t.slice(0, 190);
  const lastPeriod = cut.lastIndexOf('. ');
  if (lastPeriod > 60) return cut.slice(0, lastPeriod + 1);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

async function loadPayload() {
  const fromIndex = process.argv.indexOf('--from');
  if (fromIndex !== -1) {
    const file = process.argv[fromIndex + 1];
    if (!file) throw new Error('--from needs a path to a saved JSON payload');
    const data = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
    if (!Array.isArray(data.jobs)) {
      throw new Error(`${file} has no "jobs" array — is it the raw API payload?`);
    }
    console.log(`Reading saved payload from ${file} (manual refresh)`);
    return data;
  }
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`AfterQuery API returned ${res.status}`);
  return res.json();
}

async function main() {
  const data = await loadPayload();

  // A job with no id would build an apply link of ?job=null, which is a dead
  // link on the site — the referral never lands and the visitor bounces.
  // AfterQuery has shipped at least one of these ("Fenrir Security Researcher").
  const active = data.jobs.filter(j => !j.archived && j.id != null);

  const jobs = active.map(j => ({
    company: 'AfterQuery',
    title: j.title,
    pay: formatPay(j.salary),
    tag: j.featured ? 'Featured' : (j.detailPage && j.detailPage.location) || 'Remote',
    blurb: truncate(j.description),
    url: `https://experts.afterquery.com/apply?job=${j.id}`,
    domain: mapDomain(j.department, 'AfterQuery'),
    // AfterQuery exposes no date field, but every id is an epoch-ms value
    // in a plausible range (all 205 live listings span Apr 2025 - Sep 2026),
    // which is the signature of Date.now() used as an id. Inferred, not
    // documented: if it's wrong these sort oddly under "Most recent" and
    // nothing else breaks. normalizePosted range-checks it either way.
    posted: normalizePosted(Number(j.id)),
  }));

  const outPath = path.join(__dirname, 'jobs-afterquery.json');
  // A 200 response that yields nothing almost always means the source
  // changed its API/markup, not that AfterQuery has zero openings. Bail out
  // rather than overwriting good data with an empty file — the catch below
  // then keeps the previous snapshot and logs it.
  if (jobs.length === 0) {
    throw new Error('parsed 0 listings — refusing to overwrite existing data (source API or markup likely changed)');
  }

  fs.writeFileSync(outPath, JSON.stringify(jobs, null, 2));
  console.log(`Wrote ${jobs.length} AfterQuery listings (of ${data.jobs.length} total) to ${outPath}`);
}

main().catch(err => {
  // Exit 0 (not 1) so npm run generate's && chain keeps going even if this
  // one source is having a bad day (rate limit, timeout, brief outage) —
  // jobs-*.json for this source is only overwritten on success above, so
  // build.js falls back to this source's last-known-good snapshot instead
  // of taking the whole site down. Logged loudly so it is still visible in
  // Vercel build logs.
  console.error(`[generate-afterquery-jobs.js] FAILED, keeping previous jobs data for this source:`, err);
});
