// Shared by the generate-*.js scripts and build.js.
//
// The six sources report posting times in four different shapes, and two of
// them report a wall-clock time that is ahead of UTC (Turing and Micro1 both
// hand back timestamps several hours in the future with no zone attached), so
// normalise once here rather than getting it subtly wrong in six places.
//
// relativeAge() and byRecency() are mirrored in index.template.html's inline
// client script (build.js fills in ONGOING_AFTER_DAYS there from this file) —
// same intentional duplication as cardHTML()/escapeHtml()/accentVar(), since
// the browser copy runs as an inline <script> string and can't require this.
// Change one, change the other.

// Anything outside this window is a parsing accident, not a real posting date.
const EARLIEST = Date.UTC(2015, 0, 1);
const FUTURE_SLACK_MS = 3 * 24 * 60 * 60 * 1000;

// A posting still live this long after it was first published is a standing,
// always-hiring role (Meridial keeps hundreds open for a year or more), not a
// new opening. Its card says "Ongoing" rather than "1y ago" — the site is
// re-pulled daily, so "1y ago" read as the site being stale when it was the
// role that was old — and the newest-first sort files it after the fresh
// postings instead of ranking it by an age that no longer means anything.
const ONGOING_AFTER_DAYS = 180;

/**
 * @param {string|number|null|undefined} raw
 *   Mercor  postedAt        "2026-09-04T23:19:18"       (no zone)
 *   Turing  createdDate     "2026-09-07 17:06:35"       (no zone, runs ahead)
 *   Micro1  date_posted     "2026-09-07 18:45:06"       (no zone, runs ahead)
 *   Meridial first_published "2026-05-04T18:44:58-04:00" (zoned)
 *   AfterQuery              1744594327685                (epoch ms, see below)
 * @returns {string|null} ISO 8601 string, or null when there is no usable date.
 */
function normalizePosted(raw) {
  if (raw == null || raw === '') return null;

  let date;
  if (typeof raw === 'number') {
    date = new Date(raw);
  } else {
    const s = String(raw).trim();
    // "YYYY-MM-DD HH:MM:SS" and bare "YYYY-MM-DDTHH:MM:SS" carry no zone.
    // Read them as UTC so the result doesn't depend on where the build runs —
    // a build machine in a different zone would otherwise shift every date.
    const zoneless = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(s);
    date = new Date(zoneless ? s.replace(' ', 'T') + 'Z' : s);
  }

  const ms = date.getTime();
  if (!Number.isFinite(ms)) return null;
  if (ms < EARLIEST || ms > Date.now() + FUTURE_SLACK_MS) return null;
  return date.toISOString();
}

/**
 * Short relative age for a card, e.g. "3d ago". Returns null for undated
 * listings so callers can omit the element entirely.
 *
 * `now` is passed in rather than read from the clock so the server-rendered
 * markup and the client's re-render agree exactly — the client passes the
 * build's GENERATED_AT, so sorting the grid never makes a card's age flicker
 * to a different value.
 */
function relativeAge(iso, now) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  const ref = new Date(now).getTime();
  if (!Number.isFinite(then) || !Number.isFinite(ref)) return null;

  // Sources that report ahead of UTC can land slightly in the future. Reading
  // that as a negative age would render nonsense, so treat it as brand new.
  const days = Math.max(0, Math.floor((ref - then) / 86400000));
  if (days >= ONGOING_AFTER_DAYS) return 'Ongoing';
  if (days < 1) return 'today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/**
 * Comparator for the "Newest first" sort, which is the default order on
 * every page. Postings under ONGOING_AFTER_DAYS old come first, newest first;
 * then every ongoing role (long-running ones, plus undated evergreen sources
 * like DataAnnotation) in feed order. Array.prototype.sort is stable, so
 * returning 0 for two ongoing roles keeps them in the order build.js
 * concatenates the sources in.
 */
function byRecency(now) {
  const ref = new Date(now).getTime();
  const freshTime = job => {
    const t = job.posted ? new Date(job.posted).getTime() : NaN;
    return Number.isFinite(t) && (ref - t) / 86400000 < ONGOING_AFTER_DAYS ? t : null;
  };
  return (a, b) => {
    const ta = freshTime(a);
    const tb = freshTime(b);
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    return tb - ta;
  };
}

module.exports = { normalizePosted, relativeAge, byRecency, ONGOING_AFTER_DAYS };
