// Records when each source last refreshed successfully, in data-fetched.json.
//
// build.js used to judge freshness by each jobs-<source>.json's file mtime,
// but every Vercel build starts from a fresh git clone, where every file's
// mtime is "just now" — so the STALE DATA WARNING could never fire in the
// one place it mattered, and AfterQuery sat on a 19-day-old snapshot
// unnoticed. This file is committed alongside the data, so a source that
// fails during a build keeps the timestamp of its last real refresh.

const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'data-fetched.json');

function readFetchLog() {
  try {
    return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

// Call only after the source's jobs file has been written successfully.
// `at` is when the data was actually pulled from the source, for data that
// was saved earlier and only transformed now (AfterQuery's bookmark uploads).
function markFetched(source, at = new Date()) {
  const log = readFetchLog();
  log[source] = new Date(at).toISOString();
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + '\n');
}

module.exports = { readFetchLog, markFetched };
