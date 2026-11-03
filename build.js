// Stitches index.template.html + jobs-mercor.json + jobs-dataannotation.json
// + jobs-turing.json + jobs-meridial.json + jobs-micro1.json
// + jobs-afterquery.json into index.html. Also server-renders every job
// card (see CARD RENDERING below), writes one static landing page per job
// field and per platform (see LANDING PAGES), and regenerates robots.txt /
// sitemap.xml.
// Run the six generate-*.js scripts first to refresh the data, then: node build.js

const fs = require('fs');
const path = require('path');
const { relativeAge, byRecency } = require('./posted-date');
const { readFetchLog } = require('./fetch-log');

const dir = __dirname;
// The custom domain, not the *.vercel.app one: this feeds the canonical tag,
// og:url, robots.txt and sitemap.xml, and search engines index whichever host
// those name. vercel.json 308-redirects the vercel.app host here.
const SITE_URL = 'https://www.oneaitrainer.com';

const template = fs.readFileSync(path.join(dir, 'index.template.html'), 'utf8');
const mercorJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-mercor.json'), 'utf8'));
const dataannotationJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-dataannotation.json'), 'utf8'));
const turingJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-turing.json'), 'utf8'));
const meridialJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-meridial.json'), 'utf8'));
const micro1Jobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-micro1.json'), 'utf8'));
const afterqueryJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-afterquery.json'), 'utf8'));
const referralConfig = JSON.parse(fs.readFileSync(path.join(dir, 'referral-config.json'), 'utf8'));

const ALL_JOBS = [...mercorJobs, ...dataannotationJobs, ...turingJobs, ...meridialJobs, ...micro1Jobs, ...afterqueryJobs];

/* =========================================================================
   APPLY-LINK VALIDATION
   Every card on the site is a link to an external application page, so a job
   whose URL didn't come out as a real http(s) URL is worse than useless — it
   renders as a dead card and the referral never lands. AfterQuery shipped a
   listing with a null id that built "?job=null"; this is the single choke
   point that catches that class of bug from any of the six sources.
   ========================================================================= */
const JOBS = ALL_JOBS.filter(j => {
  try {
    const u = new URL(j.url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
});
const droppedCount = ALL_JOBS.length - JOBS.length;
if (droppedCount) {
  const dropped = ALL_JOBS.filter(j => !JOBS.includes(j));
  console.warn(
    `Dropped ${droppedCount} listing(s) with an unusable apply URL: ` +
      dropped.map(j => `${j.company} "${j.title}" -> ${j.url}`).join('; ')
  );
}

const now = new Date();

/* =========================================================================
   STALENESS CHECK
   Each generate-*.js exits cleanly when its source is unreachable, keeping
   the previous jobs-<source>.json rather than failing the whole build. That
   is the right call for uptime, but it means a source can quietly stop
   refreshing and nobody notices — AfterQuery did exactly that for 11 days.
   So: warn loudly in the build log for any source that hasn't refreshed
   recently. This does not fail the build, it just makes the silence visible.
   Freshness comes from data-fetched.json (see fetch-log.js), not file
   mtimes, which a fresh git clone resets on every Vercel build.
   ========================================================================= */
const STALE_AFTER_DAYS = 2;
const SOURCES = ['Mercor', 'DataAnnotation', 'Turing', 'Meridial', 'Micro1', 'AfterQuery'];
const fetchLog = readFetchLog();
const staleSources = [];
for (const source of SOURCES) {
  const fetchedAt = Date.parse(fetchLog[source]);
  if (!Number.isFinite(fetchedAt)) {
    staleSources.push(`${source} (no successful fetch on record)`);
    continue;
  }
  const ageDays = (now - fetchedAt) / 86400000;
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
function embed(json) {
  return json.replace(/<\//g, '<\\/');
}

/* =========================================================================
   CARD RENDERING
   Every card is rendered here, at build time, so the listings are readable
   by crawlers and AI answer-engine fetchers that don't execute JavaScript.
   The homepage script never re-renders a card: it only hides, shows and
   reorders these, using the per-sort positions stamped on each one
   (data-r / data-p / data-i, see SORT ORDERS below). So all card markup,
   pay parsing and date logic live here and in posted-date.js, nowhere else.
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
  return ACCENTS[company] || 'var(--muted)';
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

/**
 * Splits a pay string into what the card shows and how it sorts.
 * "$45–$70/hr" -> amount "$45–$70", unit "/hr". Only hourly pay feeds the
 * pay bar; "Highest pay" ranks hourly roles first by top rate, then other
 * listed pay by amount, then unlisted ("Not listed", "Up to" alone, ...).
 * DataAnnotation lists a ceiling ("Up to $150+/hr"), kept as a prefix.
 */
const PAY_RE = /^(Up to\s+)?(\$[\d,.]+k?(?:\s*[–-]\s*\$?[\d,.]+k?)?\+?)\s*(\/hr|\/hour|\/yr|\/mo|\/task|one-time)?$/i;
const BAR_FULL_HOURLY = 150;
function parsePay(raw) {
  const m = String(raw || '').trim().match(PAY_RE);
  if (!m) return { pre: '', amount: 'Pay on listing', unit: '', bar: 0, sortKey: -1 };
  let unit = (m[3] || '').toLowerCase();
  const nums = (m[2].match(/[\d,.]+k?/gi) || []).map(n => parseFloat(n.replace(/,/g, '')) * (/k$/i.test(n) ? 1000 : 1));
  const max = Math.max(...nums);
  // No real hourly rate tops $1,000; that is an annual salary mislabeled
  // upstream (generate-micro1-jobs.js fixes the known case at the source).
  if ((unit === '/hr' || unit === '/hour') && max > 1000) unit = '/yr';
  const hourly = unit === '/hr' || unit === '/hour';
  return {
    pre: m[1] ? 'Up to' : '',
    amount: m[2],
    unit: unit === 'one-time' ? ' one-time' : unit,
    bar: hourly ? Math.min(100, Math.round((max / BAR_FULL_HOURLY) * 100)) : 0,
    sortKey: hourly ? 1e6 + max : max,
  };
}

// Feeds come in mixed case ("senior software engineer"); cards capitalize the
// first letter of each all-lowercase word. Words already carrying a capital
// ("macOS", "iOS", "AI") are left exactly as the source wrote them, and a
// slash only starts a word after a letter, so "$150/hr" isn't made "/Hr".
function titleCase(s) {
  return String(s || '').replace(/(^|[\s\-—(]|(?<=[A-Za-z])\/)([a-z])(?=[a-z]*(?![A-Za-z]))/g, (m, pre, c) => pre + c.toUpperCase());
}

/* =========================================================================
   SORT ORDERS
   Each job's position under each of the homepage's three sorts, stamped on
   its card so the browser can reorder without knowing the rules:
     data-r  Most recent  posted-date.js byRecency (fresh first, then ongoing)
     data-p  Highest pay  parsePay().sortKey, ties in feed order
     data-i  By platform  feed order (the order JOBS concatenates sources in)
   ========================================================================= */
const compareRecency = byRecency(now);
const RECENT = [...JOBS].sort(compareRecency);
const BY_PAY = [...JOBS].sort((a, b) => parsePay(b.pay).sortKey - parsePay(a.pay).sortKey);
const RANK = new Map(JOBS.map((j, i) => [j, { i }]));
RECENT.forEach((j, r) => { RANK.get(j).r = r; });
BY_PAY.forEach((j, p) => { RANK.get(j).p = p; });

/**
 * @param {object} job
 * @param {number} n  the card's position on its page; the first 12 get a
 *                    staggered entrance, and the first `visible` are shown.
 * @param {number} visible  how many cards start visible (homepage pages 24
 *                    at a time; landing pages show all).
 */
function cardHTML(job, n, visible = Infinity) {
  // buildApplyUrl falls back to the raw job.url when the URL won't parse,
  // so escape it here rather than trusting it in the href attribute.
  const applyUrl = escapeHtml(buildApplyUrl(job));
  const rank = RANK.get(job);
  const company = escapeHtml(job.company);
  const title = escapeHtml(titleCase(job.title));
  const pay = parsePay(job.pay);
  const hasReferral = !!(referralConfig[job.company] && referralConfig[job.company].code);
  // null for the sources that expose no posting date (DataAnnotation), in
  // which case the stripe shows only the company.
  const age = relativeAge(job.posted, now);
  const style = `--c:${accentVar(job.company)}` + (n < 12 ? `;--i:${n}` : '');
  const blurbId = `b${rank.i}`;
  return `
<article class="card" style="${style}" data-i="${rank.i}" data-r="${rank.r}" data-p="${rank.p}" data-co="${company}" data-dom="${escapeHtml(job.domain)}"${n >= visible ? ' hidden' : ''}>
  <div class="card-head"><span>${company}</span>${age ? ` <span class="age">${escapeHtml(age)}</span>` : ''}</div>
  <div class="card-body">
    ${job.domain ? `<div class="card-dom">${escapeHtml(job.domain)}</div>` : ''}
    <h3 class="card-title"><a href="${applyUrl}" target="_blank" rel="noopener noreferrer sponsored">${title}</a></h3>
    ${job.blurb ? `<div><p class="blurb" id="${blurbId}">${escapeHtml(job.blurb)}</p><button class="more" type="button" aria-expanded="false" aria-controls="${blurbId}">Read more</button></div>` : ''}
    <div class="card-pay">
      <div class="pay-row">${hasReferral ? '<span class="ref">Referral link</span> ' : ''}<span class="pay">${pay.pre ? `<small class="pre">${pay.pre}</small> ` : ''}${escapeHtml(pay.amount)}${pay.unit ? `<small>${escapeHtml(pay.unit)}</small>` : ''}</span></div>
      <div class="paybar"><i style="width:${pay.bar}%"></i></div>
    </div>
    <a class="apply" href="${applyUrl}" target="_blank" rel="noopener noreferrer sponsored" tabindex="-1" aria-hidden="true">Apply on ${company} ↗</a>
  </div>
</article>`;
}

// The homepage opens on "Most recent", 24 cards at a time; the rest are in
// the HTML (for crawlers) but hidden until "Show 24 more" or a filter.
const PAGE_SIZE = 24;
const jobCardsHTML = RECENT.map((j, n) => cardHTML(j, n, PAGE_SIZE)).join('');

/* =========================================================================
   FAQ + STRUCTURED DATA
   One source for both the visible FAQ section and its FAQPage JSON-LD, so
   the two can't drift apart (Google ignores FAQ markup that doesn't match
   what's on the page). Copy is from the Live Board design.
   hourlyPayRange() feeds the landing pages' pay figures.
   ========================================================================= */
// A field can have only a few dozen hourly roles in total, and a range from
// those is still informative, so the floor is low.
function hourlyPayRange(jobs, minRoles = 5) {
  // Ignore implausible values: a few sources occasionally put an annual
  // figure in an hourly field, which would wreck a max.
  const lows = [];
  const highs = [];
  for (const j of jobs) {
    if (!/\/hr/.test(j.pay || '')) continue;
    const nums = [...j.pay.matchAll(/\$([\d.]+)/g)].map(m => parseFloat(m[1])).filter(n => n > 0 && n < 1000);
    if (!nums.length) continue;
    // "Up to $150+/hr" is a ceiling, not a starting rate.
    if (!/^Up to/i.test(j.pay)) lows.push(nums[0]);
    highs.push(nums[nums.length - 1]);
  }
  if (!lows.length) return null;
  if (highs.length < minRoles) return null;
  const sortNum = a => a.sort((x, y) => x - y);
  const pct = (a, p) => a[Math.floor((a.length - 1) * p)];
  const round5 = n => Math.max(5, Math.round(n / 5) * 5);
  sortNum(lows);
  sortNum(highs);
  return { p10: round5(pct(lows, 0.1)), p90: round5(pct(highs, 0.9)), median: round5(pct(highs, 0.5)) };
}

const COMPANY_NAMES = [...new Set(JOBS.map(j => j.company))];
const companyList = COMPANY_NAMES.slice(0, -1).join(', ') + ' and ' + COMPANY_NAMES.at(-1);

const FAQ = [
  {
    q: 'What does an AI trainer do?',
    a: 'You grade or write material used to train and test AI models: rating answers, comparing two responses, writing expert questions, or reviewing code. The work is remote and paid hourly or per task.',
  },
  {
    q: 'Do I need a degree?',
    a: 'Depends on the role. Generalist rating jobs mostly ask for strong written English. Law, medicine and STEM roles ask for a degree or license, which the platform checks during sign-up.',
  },
  {
    q: 'Where does the pay figure come from?',
    a: 'From the company’s own listing. We show it unchanged. Rates can move after a listing is posted, so confirm on the application page.',
  },
  {
    q: 'Does One AI Trainer take a cut?',
    a: 'No. Some links carry a referral code, and the platform pays us a small bonus if you are hired. Your rate is the same either way.',
  },
  {
    q: 'How long does it take to hear back?',
    a: 'Usually one to three weeks. Most platforms start with an assessment, then a short wait for a project to open. Some never reply if there is no match, so it is reasonable to apply to a few.',
  },
  {
    q: 'Can I apply from outside the US?',
    a: 'Often, yes. Mercor, Turing, Micro1 and AfterQuery hire in many countries. DataAnnotation is mostly US, UK, Canada and Australia. Meridial lists US and Canada roles plus some worldwide English work.',
  },
  {
    q: 'How often is this list updated?',
    a: 'Once a day. Listings that close are removed, and new ones appear the next morning. The date at the top of the page shows the last refresh.',
  },
  {
    q: 'Can I hold roles on more than one platform?',
    a: 'Yes. Most are independent contracts with no exclusivity, and many trainers work on two or three at once. Check each platform’s terms to be sure.',
  },
];

const faqHTML = FAQ.map(
  ({ q, a }) => `
    <details>
      <summary><h3>${escapeHtml(q)}</h3></summary>
      <p>${escapeHtml(a)}</p>
    </details>`
).join('');

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'One AI Trainer',
      description: `${JOBS.length} remote AI training jobs from ${companyList}, with pay shown up front.`,
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'One AI Trainer',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/apple-touch-icon.png`,
      founder: { '@type': 'Person', name: 'Chaney Lovellette', url: 'https://www.linkedin.com/in/contractinnovator/' },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: FAQ.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

// "November 3, 2026", for the hero's "last updated" pill.
const generatedAtLabel = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(now);

/* =========================================================================
   LANDING PAGES
   One static page per job field (/jobs/<slug>/) and per source platform
   (/<slug>/), so long-tail searches like "legal ai training jobs" or
   "micro1 jobs" have a page of their own to land on rather than only the
   homepage. Each page server-renders its slice of the cards with the same
   cardHTML() as the homepage and copies the homepage template's <style>
   block verbatim, so there is no second stylesheet to drift.
   The intros are hand-written per page (search engines discount pages that
   differ only by a swapped keyword); the counts, pay range and company mix
   in them are computed from the live listings.
   ========================================================================= */
const FIELD_PAGES = [
  {
    domain: 'Legal',
    slug: 'legal',
    nav: 'Legal',
    h1: 'Legal',
    kw: 'legal',
    who: 'lawyers, paralegals and contract professionals',
    title: 'Legal AI Training Jobs for Lawyers',
    lead: 'Lawyers, paralegals and contract professionals help AI labs build models that can reason about the law: drafting legal research tasks, grading model answers on case law and contracts, and catching invented citations. Many roles ask for a JD or bar admission, and legal work is some of the best-paid AI training there is.',
  },
  {
    domain: 'Medical & Healthcare',
    slug: 'medical',
    nav: 'Medical',
    h1: 'Medical',
    kw: 'medical',
    who: 'doctors, nurses and clinicians',
    title: 'Medical AI Training Jobs for Doctors & Nurses',
    lead: 'Physicians, nurses, pharmacists, therapists and other clinicians review how AI models answer health questions, write realistic clinical cases, and flag advice that would be unsafe for a patient. Many roles ask for a medical degree, a license or hands-on clinical experience.',
  },
  {
    domain: 'Software & Data',
    slug: 'coding',
    nav: 'Coding & Data',
    h1: 'Coding & data',
    kw: 'coding and data',
    who: 'software engineers and data scientists',
    title: 'Coding AI Training Jobs for Software Engineers',
    lead: 'AI labs hire software engineers, data scientists and ML engineers to make their coding models better: writing and reviewing code, building evaluation tasks with real test cases, and grading model solutions for correctness and style.',
  },
  {
    domain: 'Science & STEM',
    slug: 'stem',
    nav: 'STEM',
    h1: 'STEM',
    kw: 'STEM',
    who: 'scientists, mathematicians and PhD researchers',
    title: 'STEM AI Training Jobs for Scientists',
    lead: "Frontier models are tested on graduate-level math and science, and the people who write those tests are subject experts: mathematicians, physicists, chemists, biologists and PhD researchers. The work is writing hard problems with verified answers and checking a model's step-by-step reasoning.",
  },
  {
    domain: 'Business & Finance',
    slug: 'finance',
    nav: 'Finance & Business',
    h1: 'Finance & business',
    kw: 'finance and business',
    who: 'accountants, analysts and business professionals',
    title: 'Finance & Accounting AI Training Jobs',
    lead: "Accountants, financial analysts, consultants and operators are paid to show AI models how real business work gets done: building financial models, answering tax and accounting questions, and judging whether a model's analysis would hold up in front of a professional.",
  },
  {
    domain: 'Language & Writing',
    slug: 'writing',
    nav: 'Writing & Languages',
    h1: 'Writing & language',
    kw: 'writing and language',
    who: 'writers, editors, translators and native speakers',
    title: 'Writing & Translation AI Training Jobs',
    lead: 'Writers, editors, translators and native speakers make AI models read and write well in English and dozens of other languages: rating responses for accuracy and tone, rewriting weak answers, recording audio, and checking translations.',
  },
  {
    domain: 'Design & Creative',
    slug: 'creative',
    nav: 'Design & Creative',
    h1: 'Design & creative',
    kw: 'design and creative',
    who: 'designers, artists and musicians',
    title: 'AI Training Jobs for Designers & Artists',
    lead: 'Designers, illustrators, 3D artists, musicians and video producers help train image, audio and video models by critiquing generated work, writing detailed creative briefs and producing original reference material.',
  },
  {
    domain: 'General & Other',
    slug: 'general',
    nav: 'Generalist',
    h1: 'Generalist',
    kw: 'generalist',
    who: 'anyone with good judgment and clear writing',
    title: 'Generalist AI Training & Data Annotation Jobs',
    lead: 'Not every AI training job needs a specialist degree. These generalist roles cover data annotation, transcription, audio recording, safety review and other work that mainly asks for good judgment, clear writing and attention to detail, along with a few niche specialties that fit none of the other fields.',
  },
];

// Keyed by the job's `company` value; the slug is the lowercased name.
const PLATFORM_LEADS = {
  Mercor: 'Mercor matches professionals with AI labs for hourly contract work, from generalist review tasks to roles for doctors, lawyers, bankers and engineers. Its listings show how many people were hired recently, a useful sign of which projects are actively staffing.',
  DataAnnotation: 'DataAnnotation pays remote workers to train AI chatbots by writing and rating responses, solving coding problems and checking facts, on a flexible schedule. Higher-paying tracks open up for coders and for specialists in law, medicine, finance and other fields.',
  Turing: 'Turing is best known for placing remote software engineers, and it also staffs AI training projects for frontier labs, hiring engineers, data specialists and subject-matter experts to write and evaluate model training data.',
  Meridial: "Meridial posts AI training and evaluation projects across an unusually wide spread of languages and specialist fields. The listings here are limited to roles open in the US and Canada plus English-language worldwide remote roles. Meridial doesn't publish pay on its listings, so check the rate on the application page.",
  Micro1: "Micro1 recruits contractors for AI labs' human-data projects, in fields that run from software and hardware engineering to law, science and language work.",
  AfterQuery: 'AfterQuery creates expert-written training and evaluation data for frontier AI labs, and hires working professionals by the hour to produce it: doctors, attorneys, engineers, finance experts, writers and bilingual audio contributors.',
};

function listPhrase(items) {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + ' and ' + items.at(-1);
}

// [value, count] pairs, most common first.
function countBy(jobs, key) {
  const counts = {};
  for (const j of jobs) if (j[key]) counts[j[key]] = (counts[j[key]] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function payText(range) {
  return range.p10 >= range.p90 ? `$${range.p10}` : `$${range.p10}–$${range.p90}`;
}

function rolesAre(n, kw) {
  return `${n} ${kw} role${n === 1 ? ' is' : 's are'}`;
}

// Google cuts meta descriptions off at roughly 155-160 characters. Candidates
// run longest first; take the first that fits, else the shortest.
const MAX_DESCRIPTION = 158;
function fitDescription(candidates) {
  return candidates.find(c => c.length <= MAX_DESCRIPTION) || candidates.at(-1);
}

function statHTML(value, label) {
  return `<div class="stat"><b>${escapeHtml(value)}</b> <span>${escapeHtml(label)}</span></div>`;
}

const fieldPages = FIELD_PAGES.map(f => {
  const jobs = JOBS.filter(j => j.domain === f.domain);
  const companies = countBy(jobs, 'company').map(([c]) => c);
  const pay = hourlyPayRange(jobs);
  const from = companies.length > 3 ? `${companies.slice(0, 3).join(', ')} and more` : listPhrase(companies);
  return {
    path: `/jobs/${f.slug}/`,
    nav: f.nav,
    domain: f.domain,
    jobs,
    title: f.title,
    h1HTML: `<span class="shimmer">${escapeHtml(f.h1)}</span> AI training jobs`,
    h1Text: `${f.h1} AI training jobs`,
    description: fitDescription([
      `${jobs.length} remote ${f.kw} AI training jobs for ${f.who}, from ${from}. Pay shown up front, updated daily.`,
      `${jobs.length} remote ${f.kw} AI training jobs for ${f.who}. Pay shown up front, updated daily.`,
      `${jobs.length} remote ${f.kw} AI training jobs for ${f.who}.`,
    ]),
    intro:
      `${f.lead} Right now ${rolesAre(jobs.length, f.kw)} open across ${listPhrase(companies)}` +
      (pay ? `, and most of the hourly ones pay about ${payText(pay)} an hour` : '') +
      ". Every listing links straight to the company's own application page.",
    stats: [
      [String(jobs.length), 'open roles'],
      [String(companies.length), companies.length === 1 ? 'company' : 'companies'],
      ...(pay ? [[`${payText(pay)}/hr`, 'typical hourly pay']] : []),
    ],
    sectionNoun: `${f.kw} AI training jobs`,
  };
});

const platformPages = COMPANY_NAMES.map(company => {
  const jobs = JOBS.filter(j => j.company === company);
  const fields = countBy(jobs, 'domain').map(([d]) => d);
  const pay = hourlyPayRange(jobs);
  const lead = PLATFORM_LEADS[company] || '';
  if (!lead) console.warn(`No landing-page intro for "${company}" — add one to PLATFORM_LEADS in build.js.`);
  return {
    path: `/${company.toLowerCase()}/`,
    nav: company,
    jobs,
    title: `${company} Jobs: Remote AI Training Roles`,
    h1HTML: `<span class="shimmer">${escapeHtml(company)}</span> AI training jobs`,
    h1Text: `${company} AI training jobs`,
    description: fitDescription([
      `${jobs.length} open ${company} jobs: remote AI training roles in ${listPhrase(fields.slice(0, 3))}` +
        (pay ? `, most paying ${payText(pay)}/hr` : '') + '. Updated daily.',
      `${jobs.length} open ${company} jobs: remote AI training roles in ${listPhrase(fields.slice(0, 2))}` +
        (pay ? `, most paying ${payText(pay)}/hr` : '') + '. Updated daily.',
      `${jobs.length} open ${company} jobs: remote AI training roles` +
        (pay ? `, most paying ${payText(pay)}/hr` : '') + '. Updated daily.',
    ]),
    intro:
      `${lead} ${rolesAre(jobs.length, company)} open right now, with the most openings in ${listPhrase(fields.slice(0, 3))}` +
      (pay ? `, and most of the hourly ones pay about ${payText(pay)} an hour` : '') +
      `. One AI Trainer is independent and not affiliated with ${company}; every Apply link goes to ${company}'s own application page.`,
    stats: [
      [String(jobs.length), 'open roles'],
      [String(fields.length), fields.length === 1 ? 'field' : 'fields'],
      ...(pay ? [[`${payText(pay)}/hr`, 'typical hourly pay']] : []),
    ],
    sectionNoun: `${company} jobs`,
  };
});

// A field or platform with no listings today gets no page, no nav link and
// no sitemap entry; its old page is deleted further down rather than left
// serving yesterday's cards.
const landingPages = [...fieldPages, ...platformPages].filter(p => p.jobs.length);
const emptyLandingPages = [...fieldPages, ...platformPages].filter(p => !p.jobs.length);

/* =========================================================================
   FIELD TABS + PLATFORM CHIPS
   Every chip is a link to its landing page, so the homepage links to all of
   them and nothing is orphaned. On the homepage the script turns a plain
   click into an in-page filter; on landing pages they are ordinary links.
   ========================================================================= */
const PLATFORM_PAGE = Object.fromEntries(platformPages.map(p => [p.nav, p]));

/**
 * One chip: a link when there is a page to go to, else a plain button.
 * `current` is the aria-current value for the lit chip ('true' for the
 * homepage's active filter, 'page' on landing pages), or '' when unlit.
 * `data` is extra attributes for the homepage filter script.
 */
function chipHTML({ kind, label, n, color, href, current, data = '' }) {
  const cls = `chip ${kind}${current ? ' on' : ''}`;
  const attrs = `class="${cls}"${color ? ` style="--c:${color}"` : ''}${data}${current ? ` aria-current="${current}"` : ''}`;
  const inner = kind === 'pchip'
    ? `<span class="dot"></span>${escapeHtml(label)}`
    : `${escapeHtml(label)} <span class="n">${n}</span>`;
  return href ? `<a href="${href}" ${attrs}>${inner}</a>` : `<button type="button" ${attrs}>${inner}</button>`;
}

// Homepage: "All" first, then all eight fields in a fixed order with counts.
// A field with no listings today has no page, so its tab is a plain button.
function fieldTabsHTML() {
  const data = (dom, label) => ` data-dom="${escapeHtml(dom)}" data-label="${escapeHtml(label)}"`;
  return [
    chipHTML({ kind: 'tab', label: 'All', n: JOBS.length, href: '/', current: 'true', data: data('All', 'All') }),
    ...fieldPages.map(p => chipHTML({
      kind: 'tab', label: p.nav, n: p.jobs.length, href: p.jobs.length ? p.path : '', current: '', data: data(p.domain, p.nav),
    })),
  ].join('');
}

function platformChipsHTML() {
  return [
    chipHTML({ kind: 'pchip', label: 'All', color: 'var(--accent)', href: '/', current: 'true', data: ' data-plat="All"' }),
    ...SOURCES.map(c => {
      const page = PLATFORM_PAGE[c];
      return chipHTML({
        kind: 'pchip', label: c, color: accentVar(c), href: page && page.jobs.length ? page.path : '', current: '', data: ` data-plat="${escapeHtml(c)}"`,
      });
    }),
  ].join('');
}

// Landing pages: the same chips as two rows of plain links, current page lit.
function browseNavHTML(currentPath) {
  const current = p => (p.path === currentPath ? 'page' : '');
  const fields = fieldPages.filter(p => p.jobs.length)
    .map(p => chipHTML({ kind: 'tab', label: p.nav, n: p.jobs.length, href: p.path, current: current(p) }));
  const platforms = platformPages.filter(p => p.jobs.length)
    .map(p => chipHTML({ kind: 'pchip', label: p.nav, color: accentVar(p.nav), href: p.path, current: current(p) }));
  return `<nav class="browse" aria-label="Browse AI training jobs">
      <div class="chip-row"><span class="row-label">Field</span>${fields.join('')}</div>
      <div class="chip-row"><span class="row-label">Platform</span>${platforms.join('')}</div>
    </nav>`;
}

// Single pass, so a {{...}} inside a job's text is never itself expanded,
// and a placeholder the template uses but this doesn't fill fails the build.
// The function replacer also means a "$&" or "$1" in job text is inserted
// literally instead of being read as a String.replace pattern.
function fillTemplate(tpl, vars, name) {
  return tpl.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, key) => {
    if (!(key in vars)) throw new Error(`${name} uses {{${key}}}, which build.js does not fill`);
    return vars[key];
  });
}

const homeShown = Math.min(PAGE_SIZE, JOBS.length);
const out = fillTemplate(template, {
  SITE_URL,
  JOBS_TOTAL: String(JOBS.length),
  JOBS_TOTAL_LABEL: JOBS.length.toLocaleString('en-US'),
  GENERATED_AT_LABEL: generatedAtLabel,
  JSON_LD: embed(JSON.stringify(jsonLd)),
  FIELD_TABS_HTML: fieldTabsHTML(),
  PLATFORM_CHIPS_HTML: platformChipsHTML(),
  JOB_CARDS_HTML: jobCardsHTML,
  SHOWN_INITIAL: String(homeShown),
  MORE_HIDDEN: JOBS.length > PAGE_SIZE ? '' : ' hidden',
  MORE_LABEL: `Show ${Math.min(PAGE_SIZE, JOBS.length - PAGE_SIZE)} more`,
  FAQ_HTML: faqHTML,
}, 'index.template.html');

fs.writeFileSync(path.join(dir, 'index.html'), out);

const landingTemplate = fs.readFileSync(path.join(dir, 'landing.template.html'), 'utf8');
const styleBlock = template.match(/<style>[\s\S]*?<\/style>/);
if (!styleBlock) throw new Error('index.template.html has no <style> block for the landing pages to reuse');

function landingFile(urlPath) {
  return path.join(dir, ...urlPath.split('/').filter(Boolean), 'index.html');
}

for (const p of landingPages) {
  const url = SITE_URL + p.path;
  const pageLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        url,
        name: p.h1Text,
        description: p.description,
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'AI training jobs', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: p.h1Text, item: url },
        ],
      },
    ],
  };
  // Most recent first, since a landing page has no sort control of its own. The
  // sort is stable, so a page of only ongoing roles (DataAnnotation's are all
  // undated) keeps its feed order — and then the heading doesn't claim an
  // order it can't show.
  const sorted = [...p.jobs].sort(compareRecency);
  const dated = p.jobs.some(j => j.posted && relativeAge(j.posted, now) !== 'Ongoing');
  const vars = {
    TITLE: escapeHtml(`${p.title} | One AI Trainer`),
    OG_TITLE: escapeHtml(p.title),
    DESCRIPTION: escapeHtml(p.description),
    CANONICAL: escapeHtml(url),
    SITE_URL,
    JSON_LD: embed(JSON.stringify(pageLd)),
    STYLES: styleBlock[0],
    GENERATED_AT_LABEL: generatedAtLabel,
    CRUMB_LABEL: escapeHtml(p.h1Text),
    H1_HTML: p.h1HTML,
    INTRO: escapeHtml(p.intro),
    STATS_HTML: p.stats.map(([v, l]) => statHTML(v, l)).join(''),
    BROWSE_NAV_HTML: browseNavHTML(p.path),
    SECTION_TITLE: escapeHtml(`${p.jobs.length} open ${p.sectionNoun}${dated ? ', newest first' : ''}`),
    JOB_CARDS_HTML: sorted.map((j, n) => cardHTML(j, n)).join(''),
    JOBS_TOTAL: String(JOBS.length),
    PAGE_TOTAL_LABEL: p.jobs.length.toLocaleString('en-US'),
  };
  const html = fillTemplate(landingTemplate, vars, 'landing.template.html');
  const file = landingFile(p.path);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

for (const p of emptyLandingPages) {
  const file = landingFile(p.path);
  if (fs.existsSync(file)) {
    fs.rmSync(file);
    console.warn(`No listings for ${p.path} today — removed its landing page.`);
  }
}

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

const sitemapUrl = (loc, priority) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${now.toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>
`;
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrl(`${SITE_URL}/`, '1.0')}${landingPages.map(p => sitemapUrl(SITE_URL + p.path, '0.8')).join('')}</urlset>
`;
fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemapXml);

console.log(
  `Built index.html — ${mercorJobs.length} Mercor + ${dataannotationJobs.length} DataAnnotation + ${turingJobs.length} Turing + ${meridialJobs.length} Meridial + ${micro1Jobs.length} Micro1 + ${afterqueryJobs.length} AfterQuery listings (${JOBS.length} total), generated ${now.toISOString()}`
);
console.log(`Wrote ${landingPages.length} landing pages: ` + landingPages.map(p => `${p.path} (${p.jobs.length})`).join(', '));
console.log('Wrote robots.txt and sitemap.xml');

// Date coverage drives the default "Most recent" sort — undated listings sort
// last, so a source silently losing its date field would quietly sink all of
// its listings. Make that visible in the build log.
const datedBySource = {};
for (const j of JOBS) {
  const s = (datedBySource[j.company] ||= { dated: 0, total: 0 });
  s.total++;
  if (j.posted) s.dated++;
}
const totalDated = JOBS.filter(j => j.posted).length;
console.log(
  `Posting dates: ${totalDated}/${JOBS.length} listings — ` +
    Object.entries(datedBySource).map(([c, s]) => `${c} ${s.dated}/${s.total}`).join(', ')
);
