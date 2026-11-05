# Illinois Procurement Wargame

A facilitated tabletop exercise for State of Illinois procurement staff. Teams work a procurement from the first phone call to the audit, one decision at a time. Each turn brings a new inject (an email, a phone slip, a protest letter, a news story). Teams commit to one of four options, and the reveal shows the outcome, the rule behind it, and what good looks like. Shortcuts taken early come back as consequences in later turns.

It runs entirely in the browser: no accounts, no server, no data leaves the room. Progress is saved in the browser so a refresh doesn't lose the game.

- `index.html`: the game engine and interface
- `scenarios.js`: every scenario, turn, option and rule summary (edit this to change content)
- Served at `/procurement-wargame/` once deployed

## Scenarios

| File | Scenario | Turns | Time | Covers |
|---|---|---|---|---|
| FY27-WG-001 | **Kitchen Down** | 7 | ~75 min | Emergency purchases, splitting, signature authority, specifications, BEP, protests, audit |
| FY27-WG-002 | **The Helpful Vendor** | 6 | ~60 min | Gift ban, procurement communications reporting, free pilots, evaluator conflicts, bid-rigging, revolving door |
| FY27-WG-003 | **Smart Buy** | 6 | ~60 min | Buying AI: click-through terms, P-card splitting, RFP vs. IFB, scored demos, data and contract terms, change orders, FOIA |

All agencies, facilities, people and vendors are fictional.

## Running a session

**Room setup.** One laptop drives a projector. Split the room into 2–6 teams of 3–5 people, mixing experience levels. Give each team a pad of paper. One facilitator runs the screen; a second person can play the *red cell* (the vendor, director or official in the inject) using the facilitator notes.

**Before you start.** On the start screen pick a case file, choose *Facilitated teams*, set the number of teams and their names, and set the discussion timer (5 minutes is a good default). Turn on **Room view** for larger type on a projector.

**Each turn (8–12 minutes):**

1. Read the situation and the inject aloud.
2. Start the timer (`T`). Teams discuss. If a team asks the vendor or official a question, the red cell answers in character from the notes (`F` shows facilitator notes; keep them off the projector while teams deliberate, or use a second screen).
3. When time is up, collect each team's letter (A–D) and enter it in the ledger on the right.
4. **Reveal outcomes.** Walk through every option, not just the ones chosen: why the best practice works, why the tempting options don't, and the rule behind each. "Earlier decisions come due" shows delayed consequences for specific teams.
5. Press `N` for the next turn. *Change picks* undoes a reveal if you entered a pick wrong.

**Close.** The after-action report shows final standings, each team's open issues and strengths, a decision log, the rules in play, and hotwash questions. Spend 15 minutes on the hotwash. **Copy report as text** gives you a plain-text summary for a training record.

**Solo mode** is for self-paced practice: choose an option (or press `A`–`D`), lock it in, and read the outcome.

### Scoring

Every team starts at 60 on four meters:

- **Compliance**: would the file hold up to an audit or a protest?
- **Mission**: does the agency get what it needs, when it needs it?
- **Value**: competition and price
- **Trust**: ethics, transparency and fairness to every vendor

Some options also cost schedule days. Running past the scenario's slack costs Mission points at the end. Options are graded *Best practice*, *Defensible*, *Risky* or *Likely violation*. The overall score is the average of the four meters, rated Audit-ready (85+), Minor findings (70+), Material findings (55+) or Referral risk.

The scores are a discussion device, not an assessment of anyone's job performance. Say so at the start.

## Editing scenarios

Everything is in `scenarios.js`. The comment at the top explains the format. In brief:

```js
{
  key: 'B', grade: 'violation',          // best | sound | risky | violation
  text: 'What the team would do',
  fx: { c: -12, m: 3, v: -10, t: -12 },  // meter changes
  days: -7,                              // schedule cost (negative saves time)
  set: ['vendor_specs'],                 // flags carried forward
  rules: ['vendor-specs'],               // rulebook keys shown on reveal
  outcome: 'What happened, and why'
}
```

Delayed consequences go on a later turn's `carry` list:

```js
carry: [
  { if: 'vendor_specs', fx: { c: -10, t: -6 }, text: 'The protester found the bidder\'s contract number in your scope of work.' }
]
```

`if` can be one flag or a list (any of them triggers it). Add each new flag to the scenario's `flags` table with a `tone` of `good` or `bad` so it appears in the after-action report.

To keep the story consistent when teams choose differently, write each option's outcome so the story converges before the next turn ("Your SPO stops the deal, and you make the calls Saturday night after all"). The flags, not the plot, carry the difference forward.

## Keeping it accurate

Rule summaries are simplified for discussion and were checked against the Illinois Compiled Statutes and the Illinois Administrative Code in November 2026. Dollar thresholds (small purchases, the gift-ban exceptions, the revolving-door trigger) change. Before each training cycle, check the rulebook against the current figures from the Chief Procurement Officer for General Services, and have your agency's procurement counsel or ethics officer review any scenario you adapt. The game says on every screen that it is a training exercise and not legal advice. Keep that text if you modify it.
