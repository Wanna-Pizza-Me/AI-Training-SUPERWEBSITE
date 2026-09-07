// Pulls AfterQuery's public jobs API and curates it into the JOBS shape
// used by index.html: { company, title, pay, tag, blurb, url, domain }.
// The apply URL just needs ?job=<id> — REFERRAL_CONFIG in index.template.html
// adds the ?ref=<code> param client-side, same mechanism as Mercor/DataAnnotation.
// Run with: node generate-afterquery-jobs.js
// Writes jobs-afterquery.json to this directory.

const fs = require('fs');
const path = require('path');
const { mapDomain } = require('./domain-categories');

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

async function main() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`AfterQuery API returned ${res.status}`);
  const data = await res.json();

  const active = data.jobs.filter(j => !j.archived);

  const jobs = active.map(j => ({
    company: 'AfterQuery',
    title: j.title,
    pay: formatPay(j.salary),
    tag: j.featured ? 'Featured' : (j.detailPage && j.detailPage.location) || 'Remote',
    blurb: truncate(j.description),
    url: `https://experts.afterquery.com/apply?job=${j.id}`,
    domain: mapDomain(j.department, 'AfterQuery'),
  }));

  const outPath = path.join(__dirname, 'jobs-afterquery.json');
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
