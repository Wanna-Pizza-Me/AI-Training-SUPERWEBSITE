// Stitches index.template.html + jobs-mercor.json + jobs-dataannotation.json
// + jobs-turing.json + jobs-meridial.json into index.html.
// Run the four generate-*.js scripts first to refresh the data, then: node build.js

const fs = require('fs');
const path = require('path');

const dir = __dirname;
const template = fs.readFileSync(path.join(dir, 'index.template.html'), 'utf8');
const mercorJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-mercor.json'), 'utf8'));
const dataannotationJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-dataannotation.json'), 'utf8'));
const turingJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-turing.json'), 'utf8'));
const meridialJobs = JSON.parse(fs.readFileSync(path.join(dir, 'jobs-meridial.json'), 'utf8'));

const now = new Date();

// Escape "</" so a job title/blurb containing e.g. "</script>" can't
// prematurely close the inline <script> tag when the browser parses this
// file (job descriptions are free text scraped from other sites, so this
// WILL happen eventually — CUDA/coding roles routinely mention HTML tags).
// Using a function replacer (not a plain string) also sidesteps the
// special $-pattern handling String.replace applies to string replacements.
function embed(json) {
  return json.replace(/<\//g, '<\\/');
}

const out = template
  .replace('{{MERCOR_JOBS_JSON}}', () => embed(JSON.stringify(mercorJobs)))
  .replace('{{DATAANNOTATION_JOBS_JSON}}', () => embed(JSON.stringify(dataannotationJobs)))
  .replace('{{TURING_JOBS_JSON}}', () => embed(JSON.stringify(turingJobs)))
  .replace('{{MERIDIAL_JOBS_JSON}}', () => embed(JSON.stringify(meridialJobs)))
  .replace('{{GENERATED_AT_ISO}}', () => now.toISOString());

fs.writeFileSync(path.join(dir, 'index.html'), out);
console.log(`Built index.html — ${mercorJobs.length} Mercor + ${dataannotationJobs.length} DataAnnotation + ${turingJobs.length} Turing + ${meridialJobs.length} Meridial listings, generated ${now.toISOString()}`);
