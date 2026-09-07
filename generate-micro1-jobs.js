// Pulls micro1's referral-scoped jobs API — the same endpoint their own
// referral dashboard (refer.micro1.ai) uses — and curates it into the JOBS
// shape used by index.html: { company, title, pay, tag, blurb, url, domain }.
// This endpoint returns apply_url values with the referral code already
// baked in (?referralCode=...&utm_source=referral&...), so unlike the other
// four sources, micro1 needs no REFERRAL_CONFIG entry in index.template.html
// — every listing is already correctly attributed.
// Run with: node generate-micro1-jobs.js
// Writes jobs-micro1.json to this directory.

const fs = require('fs');
const path = require('path');
const { mapDomain } = require('./domain-categories');
const { normalizePosted } = require('./posted-date');

const REFERRAL_CODE = '02b9d485-f559-40d2-981d-caca8ba2a435';
const API_URL = `https://prod-api.micro1.ai/api/v1/job/portal/referral/${REFERRAL_CODE}/jobs`;
const PAGE_SIZE = 100;

function formatPay(j) {
  const hr = j.ideal_hourly_rate;
  if (hr && (hr.min != null || hr.max != null)) {
    return hr.min === hr.max ? `$${hr.min}/hr` : `$${hr.min}–$${hr.max}/hr`;
  }
  if (j.ideal_monthly_salary_min != null || j.ideal_monthly_salary_max != null) {
    const min = Math.round(parseFloat(j.ideal_monthly_salary_min) / 1000);
    const max = Math.round(parseFloat(j.ideal_monthly_salary_max) / 1000);
    return min === max ? `$${min}k/mo` : `$${min}k–$${max}k/mo`;
  }
  if (j.ideal_yearly_compensation && (j.ideal_yearly_compensation.min != null || j.ideal_yearly_compensation.max != null)) {
    const { min, max } = j.ideal_yearly_compensation;
    const minK = Math.round(min / 1000);
    const maxK = Math.round(max / 1000);
    return minK === maxK ? `$${minK}k/yr` : `$${minK}k–$${maxK}k/yr`;
  }
  return 'Not listed';
}

function formatTag(j) {
  if (j.is_high_demand_job) return 'High demand';
  if (j.no_of_openings) return `${j.no_of_openings} opening${j.no_of_openings === 1 ? '' : 's'}`;
  return 'New opportunity';
}

function blurbFromSkills(skills) {
  if (!skills || skills.length === 0) return '';
  const list = skills.slice(0, 4);
  return `Looking for expertise in ${list.join(', ')}.`;
}

async function fetchPage(page) {
  const res = await fetch(`${API_URL}?page=${page}&limit=${PAGE_SIZE}&keyword=`);
  if (!res.ok) throw new Error(`micro1 API returned ${res.status} on page ${page}`);
  return res.json();
}

async function main() {
  const first = await fetchPage(1);
  const totalPages = Math.ceil(first.total / PAGE_SIZE);
  let all = first.data;
  for (let page = 2; page <= totalPages; page++) {
    const next = await fetchPage(page);
    all = all.concat(next.data);
  }

  const jobs = all.map(j => ({
    company: 'Micro1',
    title: j.job_name,
    pay: formatPay(j),
    tag: formatTag(j),
    blurb: blurbFromSkills(j.skills),
    url: j.apply_url,
    domain: mapDomain(j.domain_slug, 'Micro1'),
    posted: normalizePosted(j.date_posted),
  }));

  const outPath = path.join(__dirname, 'jobs-micro1.json');
  // A 200 response that yields nothing almost always means the source
  // changed its API/markup, not that Micro1 has zero openings. Bail out
  // rather than overwriting good data with an empty file — the catch below
  // then keeps the previous snapshot and logs it.
  if (jobs.length === 0) {
    throw new Error('parsed 0 listings — refusing to overwrite existing data (source API or markup likely changed)');
  }

  fs.writeFileSync(outPath, JSON.stringify(jobs, null, 2));
  console.log(`Wrote ${jobs.length} Micro1 listings (of ${first.total} total) to ${outPath}`);
}

main().catch(err => {
  // Exit 0 (not 1) so npm run generate's && chain keeps going even if this
  // one source is having a bad day (rate limit, timeout, brief outage) —
  // jobs-*.json for this source is only overwritten on success above, so
  // build.js falls back to this source's last-known-good snapshot instead
  // of taking the whole site down. Logged loudly so it is still visible in
  // Vercel build logs.
  console.error(`[generate-micro1-jobs.js] FAILED, keeping previous jobs data for this source:`, err);
});
