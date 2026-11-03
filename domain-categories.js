// Maps every raw domain/category string each company's API can return into
// one of a small set of shared broad categories, so the site's domain
// filter reads the same way regardless of which company a listing is from.
//
// Used by every generate-*.js script — when an API refresh brings in a
// domain value not listed here (a company adding a new category, a typo
// fix on their end, etc.), mapDomain() falls back to "General & Other" and
// prints a warning so it's visible in the refresh output. Add the new raw
// value to CATEGORY_MAP below when that happens; nothing else needs to
// change — every generator picks up the fix automatically on its next run.

const CATEGORY_MAP = {
  // Software & Data
  'Software Engineering': 'Software & Data',
  'Software development': 'Software & Data',
  Coding: 'Software & Data',
  Cybersecurity: 'Software & Data',
  'Data Analysis': 'Software & Data',
  'Data & ML': 'Software & Data',
  'Data Scientist/Analyst': 'Software & Data',
  'ML/Data Engineering': 'Software & Data',
  'Cloud & Infrastructure': 'Software & Data',
  'Other Engineering': 'Software & Data',
  'Engineering & Technology': 'Software & Data',
  Engineering: 'Software & Data',
  'software-engineering': 'Software & Data',
  'ai-machine-learning': 'Software & Data',
  'data-analysis': 'Software & Data',
  robotics: 'Software & Data',
  'applied-engineering': 'Software & Data',
  cybersecurity: 'Software & Data',
  'Information Technology and Computer Science': 'Software & Data',

  // Science & STEM
  'Life, Physical, and Social Science': 'Science & STEM',
  Sciences: 'Science & STEM',
  Science: 'Science & STEM',
  STEM: 'Science & STEM',
  'sciences-research': 'Science & STEM',
  'Science and Research': 'Science & STEM',
  'Social Analysis and Planning': 'Science & STEM',

  // Business & Finance
  'Business Operations': 'Business & Finance',
  Business: 'Business & Finance',
  'Business & Professions': 'Business & Finance',
  Finance: 'Business & Finance',
  'Finance & Mathematics': 'Business & Finance',
  Accounting: 'Business & Finance',
  Analyst: 'Business & Finance',
  'business-operations': 'Business & Finance',
  finance: 'Business & Finance',
  'sales-marketing': 'Business & Finance',
  'Business Management and Operations': 'Business & Finance',
  'Marketing and Public Relations': 'Business & Finance',
  Sales: 'Business & Finance',
  'Human Resources': 'Business & Finance',

  // Legal
  Law: 'Legal',
  'Legal & Law Services': 'Legal',
  Legal: 'Legal',
  law: 'Legal',
  'Law, Compliance, and Public Safety': 'Legal',

  // Medical & Healthcare
  Medicine: 'Medical & Healthcare',
  'Healthcare & Medical': 'Medical & Healthcare',
  Medical: 'Medical & Healthcare',
  'Healthcare Ops': 'Medical & Healthcare',
  'Medical/Healthcare': 'Medical & Healthcare',
  medicine: 'Medical & Healthcare',
  Healthcare: 'Medical & Healthcare',

  // Language & Writing
  'Language and Audio': 'Language & Writing',
  Linguistics: 'Language & Writing',
  'Language & Linguistics': 'Language & Writing',
  Languages: 'Language & Writing',
  'Media & Communication': 'Language & Writing',
  Humanities: 'Language & Writing',
  'Humanities & Interdisciplinary Studies': 'Language & Writing',
  'language-audio': 'Language & Writing',
  humanities: 'Language & Writing',
  'Language Audio & Video': 'Language & Writing',
  'Design, Media, and Writing': 'Language & Writing',

  // Design & Creative
  'Arts & Design': 'Design & Creative',
  'Creative & Multi-Media': 'Design & Creative',
  Design: 'Design & Creative',
  'arts-design': 'Design & Creative',

  // General & Other
  Miscellaneous: 'General & Other',
  Other: 'General & Other',
  General: 'General & Other',
  'Early Career': 'General & Other',
  History: 'General & Other',
  'Customer Service': 'General & Other',
  'Delivery Advisor': 'General & Other',
  'The Agency: Worldwide Sharing': 'General & Other',
  other: 'General & Other',
  generalist: 'General & Other',
  'skilled-trades-construction': 'General & Other',
  'Project Fenrir': 'General & Other',
  'Project Silver': 'General & Other',
  'Education & Training': 'General & Other',
  Education: 'General & Other',
  'Education and Training': 'General & Other',
  'Customer and Client Support': 'General & Other',
  'Clerical and Administrative': 'General & Other',
  'Construction, Extraction, and Architecture': 'General & Other',
  'Community and Social Services': 'General & Other',
  'Maintenance, Repair, and Installation': 'General & Other',
  'Manufacturing and Production': 'General & Other',
  'retail-hospitality': 'General & Other',
};

function mapDomain(raw, source) {
  const key = raw && raw.trim();
  if (!key) return 'General & Other';
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  console.warn(
    `[domain-categories] Unmapped domain "${key}"${source ? ` from ${source}` : ''} — ` +
      `falling back to "General & Other". Add it to CATEGORY_MAP in domain-categories.js.`
  );
  return 'General & Other';
}

module.exports = { mapDomain, CATEGORY_MAP };
