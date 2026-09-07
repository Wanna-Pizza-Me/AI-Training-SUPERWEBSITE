// Pulls Mercor's public listings API and curates it into the JOBS shape
// used by index.html: { company, title, pay, tag, blurb, url, domain }.
// Run with: node generate-jobs.js
// Writes jobs-mercor.json (curated Mercor listings) to this directory.

const fs = require('fs');
const path = require('path');
const { mapDomain } = require('./domain-categories');

const API_URL = 'https://aws.api.mercor.com/work/listings-explore-page';
const PER_DOMAIN_CAP = 8;

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function cleanBlurb(desc) {
  let t = desc
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.replace(/^#+\s*/, '').replace(/^[-*]\s*/, '').trim())
    .filter(l => l.length > 0)
    .join(' ');
  t = t.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[`*_]/g, '');
  t = t.replace(/\s+/g, ' ').trim();
  t = t.replace(/\\/g, '');
  // strip boilerplate lead-ins (numbered list markers, generic section labels),
  // repeatedly since removing one can expose another underneath
  const leadIn = /^(\d+\.\s*|[-–—]\s*|(role overview|about (the (work|role)|this (study|role))|what you'?ll do|overview|summary)\s*[:\-–—]?\s*)/i;
  let prev;
  do { prev = t; t = t.replace(leadIn, ''); } while (t !== prev);
  if (t.length <= 190) return t;
  const cut = t.slice(0, 190);
  const lastPeriod = cut.lastIndexOf('. ');
  if (lastPeriod > 60) return cut.slice(0, lastPeriod + 1);
  const lastSpace = cut.lastIndexOf(' ');
  return cut.slice(0, lastSpace) + '…';
}

function formatPay(l) {
  if (l.payRateFrequency === 'hourly') {
    return l.rateMin === l.rateMax ? `$${l.rateMin}/hr` : `$${l.rateMin}–$${l.rateMax}/hr`;
  }
  if (l.payRateFrequency === 'per-task') {
    return l.rateMin === l.rateMax ? `$${l.rateMin}/task` : `$${l.rateMin}–$${l.rateMax}/task`;
  }
  if (l.payRateFrequency === 'one-time') {
    return `$${l.rateMax} one-time`;
  }
  if (l.payRateFrequency === 'yearly') {
    return `$${Math.round(l.rateMin / 1000)}k–$${Math.round(l.rateMax / 1000)}k/yr`;
  }
  return 'Not listed';
}

function formatTag(l) {
  if (l.recentCandidatesCount > 0) return `${l.recentCandidatesCount} hired this month`;
  if (l.remainingSlots != null) return `${l.remainingSlots} slots open`;
  return 'New opportunity';
}

async function main() {
  const res = await fetch(API_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Mercor API returned ${res.status}`);
  const data = await res.json();

  const active = data.listings.filter(l => l.status === 'active' && !l.disableApplications);
  const byDomain = {};
  for (const l of active) (byDomain[l.listingDomain] ||= []).push(l);

  let curated = [];
  for (const domain of Object.keys(byDomain)) {
    const sorted = byDomain[domain].sort(
      (a, b) => (b.recentCandidatesCount || 0) - (a.recentCandidatesCount || 0) || (b.rateMax || 0) - (a.rateMax || 0)
    );
    curated.push(...sorted.slice(0, PER_DOMAIN_CAP));
  }

  const jobs = curated.map(l => ({
    company: 'Mercor',
    title: l.title,
    pay: formatPay(l),
    tag: formatTag(l),
    blurb: cleanBlurb(l.description || ''),
    url: `https://work.mercor.com/jobs/${l.listingId}/${slugify(l.title)}`,
    domain: mapDomain(l.listingDomain, 'Mercor'),
  }));

  const outPath = path.join(__dirname, 'jobs-mercor.json');
  fs.writeFileSync(outPath, JSON.stringify(jobs, null, 2));
  console.log(`Wrote ${jobs.length} curated Mercor listings to ${outPath}`);
}

main().catch(err => {
  // Exit 0 (not 1) so npm run generate's && chain keeps going even if this
  // one source is having a bad day (rate limit, timeout, brief outage) —
  // jobs-*.json for this source is only overwritten on success above, so
  // build.js falls back to this source's last-known-good snapshot instead
  // of taking the whole site down. Logged loudly so it is still visible in
  // Vercel build logs.
  console.error(`[generate-jobs.js] FAILED, keeping previous jobs data for this source:`, err);
});
