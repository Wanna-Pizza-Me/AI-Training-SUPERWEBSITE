/*
  Illinois Procurement Wargame: scenario and rule data.

  Everything the game shows lives in this file, so facilitators can edit
  scenarios without touching the engine in index.html. See README.md for the
  format. Short version:

  - meters:   the four scores every team carries (0-100).
  - rules:    the rulebook. Options cite rules by key.
  - scenarios[].turns[].options[]:
      fx      meter changes when a team picks this option ({c, m, v, t})
      days    schedule cost in days (negative = time saved)
      set     flags the team carries forward
      grade   best | sound | risky | violation
  - turns[].carry: delayed consequences. If a team carries flag `if`
      (a string, or an array meaning "any of"), apply `fx` (and optional
      `days`) when this turn is revealed and show `text`.
  - scenarios[].flags: how each flag reads in the after-action report.
      tone "good" lists it under "What will hold up", "bad" under
      "Open issues". Flags without an entry are not listed.

  Text fields accept **bold** and *italic*.
*/
window.WARGAME = {
  checked: 'November 2026',
  disclaimer: '**Training exercise.** All agencies, facilities, people and vendors in these scenarios are fictional, and this is not an official State of Illinois publication. Rule summaries are simplified for discussion and are not legal advice. Requirements and dollar thresholds change, so confirm current rules with your Chief Procurement Officer, State Purchasing Officer, ethics officer or agency counsel.',

  meters: [
    { key: 'c', label: 'Compliance', short: 'Compliance', hint: 'Would the file hold up to an audit or a protest?' },
    { key: 'm', label: 'Mission', short: 'Mission', hint: 'Does the agency get what it needs, when it needs it?' },
    { key: 'v', label: 'Value', short: 'Value', hint: 'Competition and price: did taxpayers get a fair deal?' },
    { key: 't', label: 'Trust', short: 'Trust', hint: 'Ethics, transparency and fairness to every vendor.' }
  ],

  grades: {
    best: { label: 'Best practice' },
    sound: { label: 'Defensible' },
    risky: { label: 'Risky' },
    violation: { label: 'Likely violation' }
  },

  ratings: [
    { min: 85, cls: 'a', label: 'Audit-ready', text: 'This file would hold up to an audit and a protest. The decisions are defensible and the record shows why they were made.' },
    { min: 70, cls: 'b', label: 'Minor findings', text: 'Mostly sound. Expect a few findings or protest arguments, but nothing that unravels the contract.' },
    { min: 55, cls: 'c', label: 'Material findings', text: 'Expect audit findings and at least one credible protest. Several decisions would need a corrective action plan.' },
    { min: 0, cls: 'd', label: 'Referral risk', text: 'Decisions in this file could lead to an inspector general referral, a voided contract or discipline for the people involved.' }
  ],

  /* ====================================================================
     RULEBOOK
     ==================================================================== */
  rules: {
    'emergency': {
      cite: '30 ILCS 500/20-30',
      title: 'Emergency purchases',
      text: 'An emergency purchase is allowed when there is a threat to public health or safety, when it is needed to prevent or minimize serious disruption of critical State services, or in similar listed circumstances. It is made with as much competition as is practicable, and it is limited to what the emergency requires.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-30'
    },
    'emergency-competition': {
      cite: '30 ILCS 500/20-30',
      title: 'Competition in an emergency',
      text: 'An emergency removes the formal bidding process, not the duty to compete. Get as many quotes as the time allows, write down every call, and record why you chose the vendor you chose.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-30'
    },
    'emergency-term': {
      cite: '30 ILCS 500/20-30',
      title: 'Emergency contract term',
      text: 'Emergency contracts are limited in length. Use the emergency contract to cover the gap while you run a competitive procurement, not to replace that procurement. Extensions beyond the initial term require additional steps.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-30'
    },
    'emergency-notice': {
      cite: '30 ILCS 500/20-30',
      title: 'Emergency notice and filing',
      text: 'After an emergency purchase, notice must be published and a statement or affidavit filed with the designated oversight offices within the deadlines in the Code. The contract file must describe the basis for the emergency and why that vendor was chosen.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-30'
    },
    'existing-contracts': {
      cite: 'Good practice',
      title: 'Check existing contracts first',
      text: 'Before you start a new procurement, check whether an existing agency contract or statewide master contract already covers the need. Buying off a contract that was already competed is often the fastest compliant route.',
      url: ''
    },
    'small-purchase': {
      cite: '30 ILCS 500/20-20',
      title: 'Small purchases',
      text: 'Purchases below the small-purchase threshold can use simpler methods. The thresholds are adjusted every year, so check the current figures from the Chief Procurement Officer. The test is the value of the whole requirement, not the size of one invoice.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-20'
    },
    'stringing': {
      cite: '30 ILCS 500/20-20; 44 Ill. Adm. Code 1',
      title: 'No splitting purchases',
      text: 'Dividing one requirement into smaller purchases so each one stays under the small-purchase threshold is prohibited. Recurring monthly charges for the same service count together.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-20'
    },
    'sole-source': {
      cite: '30 ILCS 500/20-25',
      title: 'Sole-source procurement',
      text: 'A sole-source contract is allowed only when there is truly one economically feasible source. It requires public notice before award and a chance for others to object at a public hearing. Being the incumbent, or being well liked, is not a justification.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-25'
    },
    'ifb': {
      cite: '30 ILCS 500/20-10',
      title: 'Invitation for bids',
      text: 'Competitive sealed bidding is built for requirements you can fully specify. Award goes to the lowest responsive and responsible bidder, and quality factors you can\'t express in the specification can\'t be scored.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-10'
    },
    'rfp': {
      cite: '30 ILCS 500/20-15',
      title: 'Request for proposals',
      text: 'Competitive sealed proposals are used when price alone won\'t identify the best value. The RFP states the evaluation factors and their relative importance, and proposals are evaluated only on those factors.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-15'
    },
    'evaluation': {
      cite: '30 ILCS 500/20-15',
      title: 'Evaluate on the published criteria',
      text: 'Evaluators score only what the solicitation said would be scored, based only on what offerors submitted or demonstrated. No new criteria, no second chances for one offeror, and no unverified outside information.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-15'
    },
    'rfi': {
      cite: 'Good practice',
      title: 'Open market research',
      text: 'Use a Request for Information, a public notice or an industry day to learn what the market offers. Every vendor can see it and respond, so no one vendor gets an inside track.',
      url: ''
    },
    'vendor-specs': {
      cite: '30 ILCS 500/50-10.5 (and related)',
      title: 'Vendor-drafted specifications',
      text: 'A vendor that helps write the specifications for a contract can be barred from bidding on it. Write requirements yourself, based on the agency\'s needs.',
      url: 'https://www.ilga.gov/legislation/ilcs/ilcs4.asp?ActID=532&ChapterID=7&SeqStart=8000000&SeqEnd=11000000'
    },
    'restrictive-specs': {
      cite: 'Good practice; 44 Ill. Adm. Code 1',
      title: 'Requirements that limit competition',
      text: 'Specifications and qualifications should describe what the agency needs in a way more than one vendor can meet. Any requirement that narrows the field needs a documented reason tied to the mission.',
      url: ''
    },
    'authority': {
      cite: '30 ILCS 500/10-15, 10-20',
      title: 'Who can bind the State',
      text: 'Only a Chief Procurement Officer, a State Purchasing Officer or someone with properly delegated procurement authority can sign a contract for the State. Program staff, facility directors and P-card holders who click "I agree" do not have that authority.',
      url: 'https://www.ilga.gov/legislation/ilcs/ilcs5.asp?ActID=532&ChapterID=7'
    },
    'contract-file': {
      cite: '30 ILCS 500/20-80',
      title: 'Contract files',
      text: 'Every procurement needs a complete file that shows what was bought, how, from whom, and why. The file has to reflect what actually happened, when it happened.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-80'
    },
    'comptroller-filing': {
      cite: '30 ILCS 500/20-80',
      title: 'Filing contracts with the Comptroller',
      text: 'Contracts must be filed with the Comptroller within the deadline set in the Code. Late filing requires extra paperwork and can hold up payment.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-80'
    },
    'records': {
      cite: '5 ILCS 160 (State Records Act)',
      title: 'Public records',
      text: 'Agency records can be destroyed only under an approved retention schedule, and never once a request or investigation is pending. Creating or altering a record so it looks like it existed earlier is falsification.',
      url: 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=96&ChapterID=2'
    },
    'bep': {
      cite: '30 ILCS 575',
      title: 'Business Enterprise Program goals',
      text: 'Contracts can carry goals for participation by certified minority-, women- and disability-owned businesses. Offerors submit a utilization plan. One that falls short can ask for a waiver backed by documented good-faith efforts, and that request goes through the review process the solicitation describes.',
      url: 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=559&ChapterID=7'
    },
    'protest': {
      cite: '44 Ill. Adm. Code 1.5550',
      title: 'Protests',
      text: 'Protests go to the official designated in the rules and must be filed within a set number of days after the protester knew or should have known the facts. While a protest is pending, award and performance generally wait unless there is a written determination that proceeding is necessary to protect the State\'s interests.',
      url: 'https://www.ilga.gov/commission/jcar/admincode/044/044000010E55500R.html'
    },
    'inducement': {
      cite: '30 ILCS 500/50-25; 720 ILCS 5/33E',
      title: 'Inducements',
      text: 'Offering or paying anything of value to get someone to bid, not bid, or withdraw a bid or protest is a crime under Illinois law.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K50-25'
    },
    'conflict-interest': {
      cite: '30 ILCS 500/50-13, 50-35',
      title: 'Conflicts of interest',
      text: 'State employees involved in a procurement must disclose financial and family ties to offerors and step out before they participate. Disclosure is the first step. Recusal is what removes the conflict.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K50-13'
    },
    'gift-ban': {
      cite: '5 ILCS 430/10-10, 10-15',
      title: 'Gift ban',
      text: 'State employees may not accept gifts from a prohibited source, which includes anyone doing or seeking to do business with their agency. There are narrow exceptions, such as paying market value or food and refreshments under a small daily limit, so check with your ethics officer before saying yes.',
      url: 'https://www.ilga.gov/legislation/ilcs/ilcs4.asp?ActID=2529&ChapterID=2&SeqStart=1400000&SeqEnd=2100000'
    },
    'ethics-officer': {
      cite: '5 ILCS 430/20-23',
      title: 'Your ethics officer',
      text: 'Every agency has an ethics officer who reviews disclosures and advises employees on the gift ban and other ethics rules. Asking before you act is always the right move.',
      url: 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2529&ChapterID=2'
    },
    'comms-reporting': {
      cite: '30 ILCS 500/50-39',
      title: 'Reporting procurement communications',
      text: 'When a State employee receives a communication that tries to give or get material information about a pending procurement, outside the normal process, the employee must report it promptly. The reports are made public.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K50-39'
    },
    'single-contact': {
      cite: 'Solicitation terms',
      title: 'One point of contact',
      text: 'Solicitations name a single procurement contact. Questions go to that person in writing, and answers that matter go to every vendor in an addendum.',
      url: ''
    },
    'confidentiality': {
      cite: '720 ILCS 5/33E-5',
      title: 'Disclosing bid information',
      text: 'A public employee who discloses confidential bid or evaluation information to give someone an advantage commits a crime. Keep evaluation discussions inside the committee.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=072000050K33E-5'
    },
    'bid-rigging': {
      cite: '720 ILCS 5/33E-3, 33E-4',
      title: 'Bid-rigging and bid rotation',
      text: 'Agreements among bidders to fix prices, rotate winners or submit cover bids are felonies. Red flags include identical errors, fixed price gaps between bidders and the same people behind "competing" bids.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=072000050K33E-3'
    },
    'oeig': {
      cite: '5 ILCS 430/20',
      title: 'Office of Executive Inspector General',
      text: 'The OEIG investigates fraud, waste, abuse and misconduct in executive-branch agencies and makes revolving-door determinations. Report suspected wrongdoing to it, and don\'t investigate on your own first.',
      url: 'https://oeig.illinois.gov/'
    },
    'revolving-door': {
      cite: '5 ILCS 430/5-45',
      title: 'Revolving door',
      text: 'Employees who took part personally and substantially in awarding a contract above the statutory threshold can\'t accept employment from that contractor (or its parent or subsidiary) for a year after leaving State employment. Covered employees must notify the OEIG and get a determination before accepting an offer.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=000504300K5-45'
    },
    'iitaa': {
      cite: '30 ILCS 587',
      title: 'IT accessibility (IITAA)',
      text: 'Information technology the State buys must be accessible to people with disabilities under the Illinois Information Technology Accessibility Act standards. Write conformance into the requirements and the contract.',
      url: 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2984&ChapterID=7'
    },
    'data-privacy': {
      cite: '815 ILCS 530; agency policy',
      title: 'Personal data',
      text: 'Personal information the agency holds can go only where a contract and security review allow it. A free trial account is not a data agreement. If data went somewhere it shouldn\'t, involve your security and privacy officers right away, because breach-notice duties may apply.',
      url: 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2702&ChapterID=67'
    },
    'cooperative': {
      cite: '30 ILCS 525',
      title: 'Cooperative purchasing',
      text: 'With the Chief Procurement Officer\'s approval, the State can use contracts competed by other governments or purchasing cooperatives. The contract\'s scope has to fit the need, and you inherit its terms.',
      url: 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=561&ChapterID=7'
    },
    'contract-terms': {
      cite: '745 ILCS 5; State standard terms',
      title: 'Terms the State can\'t accept',
      text: 'State agencies generally can\'t agree to indemnify vendors, accept another state\'s law, waive sovereign immunity or accept automatic renewals that commit future appropriations. The State\'s standard terms and the solicitation\'s order of precedence govern.',
      url: 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2083&ChapterID=60'
    },
    'contract-change': {
      cite: '30 ILCS 500/20-60; 44 Ill. Adm. Code 1',
      title: 'Changes and scope',
      text: 'Changes have to stay within the scope that was competed. A significant addition of work, value or users that wasn\'t contemplated in the solicitation generally needs a new procurement, and approved changes need proper authority and documentation.',
      url: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003005000K20-60'
    },
    'foia': {
      cite: '5 ILCS 140',
      title: 'Freedom of Information Act',
      text: 'Agencies must respond within a short statutory deadline. Executed contracts are generally public. Trade secrets and personal information can be redacted under specific exemptions, but the agency, not the vendor, decides what is exempt.',
      url: 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=85&ChapterID=2'
    }
  },

  /* ====================================================================
     SCENARIOS
     ==================================================================== */
  scenarios: [

    /* ------------------------------------------------------------------
       1. KITCHEN DOWN
       ------------------------------------------------------------------ */
    {
      id: 'kitchen-down',
      file: 'FY27-WG-001',
      title: 'Kitchen Down',
      focus: 'An emergency purchase and everything that follows it',
      blurb: 'A food-service contractor walks out on a 24-hour care facility with 56 hours\' notice. Feed 160 residents, then compete the long-term contract and survive the protest and the audit.',
      topics: ['Emergency purchases', 'Splitting', 'Signature authority', 'Specifications', 'BEP', 'Protests', 'Audit'],
      minutes: 75,
      start: { c: 60, m: 60, v: 60, t: 60 },
      slackDays: 30,
      setting: {
        agency: 'Illinois Department of Residential Services (fictional)',
        where: 'Sangamon Valley Care Center: 160 residents, open 24 hours a day, 7 days a week',
        role: 'The agency procurement team, working with the State Purchasing Officer (SPO) assigned to your agency',
        stakes: 'About 480 meals a day, a third of them on physician-ordered diets, and a five-year, $9 million follow-on contract'
      },
      briefing: [
        'Sangamon Valley serves three meals and two snacks a day. About a third of the residents are on prescribed diets: pureed, mechanical-soft, renal, diabetic. A wrong tray is a medical event, not a complaint.',
        'Food service has been contracted to Heartland Table Services for four years, and seven months remain on the contract. Nothing in the file suggests trouble. It is a quiet Friday afternoon.'
      ],
      objectives: [
        'Keep residents fed safely, without interruption',
        'Use the emergency authority correctly, and only as far as the emergency goes',
        'Replace the emergency arrangement with a properly competed contract',
        'Leave a file that holds up to a protest and an audit'
      ],
      flags: {
        competed_emergency: { tone: 'good', label: 'Emergency purchase competed, with a call log in the file' },
        state_staff_bridge: { tone: 'good', label: 'Used an existing contract to cover the first days' },
        no_competition: { tone: 'bad', label: 'Emergency vendor chosen by the facility director without competition' },
        director_conflict: { tone: 'bad', label: 'Facility director\'s ties to a bidder never disclosed or managed' },
        slow_path: { tone: 'bad', label: 'Treated a real emergency as routine; residents went days without proper diets' },
        scoped_emergency: { tone: 'good', label: 'Emergency award limited in scope and term' },
        overlong_emergency: { tone: 'bad', label: 'Twelve-month term on an emergency contract' },
        open_ended: { tone: 'bad', label: 'Emergency contract with no end date' },
        stringing: { tone: 'bad', label: 'One requirement split across vendors to stay under the small-purchase threshold' },
        emergency_filed: { tone: 'good', label: 'Emergency notices filed on time; basis and vendor choice documented' },
        backdated: { tone: 'bad', label: 'Back-dated quote in the file' },
        late_filing: { tone: 'bad', label: 'Emergency notices and contract filing late' },
        bad_signature: { tone: 'bad', label: 'Contract signed by someone without procurement authority' },
        clean_specs: { tone: 'good', label: 'Requirements written in-house, with open market research' },
        vendor_specs: { tone: 'bad', label: 'Specifications copied from a bidder\'s draft' },
        restrictive_specs: { tone: 'bad', label: 'Experience requirement that shut out most of the market' },
        sole_source_attempt: { tone: 'bad', label: 'Sole-source request based on incumbency' },
        bep_followed: { tone: 'good', label: 'BEP waiver request handled through the published process' },
        bep_shortcut: { tone: 'bad', label: 'Offeror rejected without the required waiver review' },
        bep_ignored: { tone: 'bad', label: 'Published BEP requirement dropped during evaluation' },
        bep_coached: { tone: 'bad', label: 'One offeror allowed to fix its proposal after the deadline' },
        protest_routed: { tone: 'good', label: 'Protest routed to the right official; award held' },
        protest_ignored: { tone: 'bad', label: 'Contract signed while a protest was pending' },
        protest_deal: { tone: 'bad', label: 'Offered a protester work to withdraw' },
        protest_self: { tone: 'bad', label: 'Protest decided by someone without authority' },
        candid_audit: { tone: 'good', label: 'Candid audit response with a corrective action plan' },
        recreated_docs: { tone: 'bad', label: 'Records recreated after the fact' },
        slow_walked: { tone: 'bad', label: 'Slow-walked the audit' }
      },
      turns: [
        {
          id: 'kd1', phase: 'Emergency', clock: 'Friday 4:10 p.m. · Day 0',
          title: 'The contractor walks',
          situation: [
            'At 4:07 p.m. this email lands. Within minutes the facility director is in your doorway.',
            'He says Heartland\'s cooks would keep working if someone paid them. He also says his former employer, Riverbend Catering, "could have a crew here Monday. I can call Jim over there right now."'
          ],
          inject: {
            kind: 'email', stamp: 'Inject',
            from: 'Dana Whitcomb, CEO, Heartland Table Services LLC',
            to: 'DRS Contract Administration; Sangamon Valley Care Center',
            when: 'Friday 4:07 p.m.',
            subject: 'Notice of cessation of operations',
            body: [
              'Heartland Table Services will cease all operations at 11:59 p.m. this Sunday. Our lender has frozen our accounts, and we are filing for bankruptcy protection Monday morning.',
              'Our employees have been told not to report after Sunday dinner service. We regret the short notice. Please direct further correspondence to our counsel.'
            ]
          },
          question: 'What is your first move?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Call your SPO tonight and make the case for an emergency purchase. While you wait, check whether an existing contract can cover meals, and line up quotes from several qualified food-service vendors for a short bridge contract. Log every call.',
              fx: { c: 10, m: 8, v: 6, t: 8 }, set: ['competed_emergency'],
              rules: ['emergency', 'emergency-competition', 'existing-contracts'],
              outcome: 'Your SPO agrees by 7 p.m. that this meets the emergency standard: a threat to residents\' health and a serious disruption of a critical service. No existing contract covers prepared meals, so you call five vendors and have three written quotes by Saturday noon. The call log, with names, times and prices, goes in the file.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Let the director call Riverbend tonight. They can start Monday, which is what matters. You\'ll do the paperwork next week.',
              fx: { c: -14, m: 6, v: -8, t: -14 }, set: ['no_competition', 'director_conflict'],
              rules: ['emergency-competition', 'conflict-interest'],
              outcome: 'Riverbend quotes 24% above Heartland\'s rates after the director tells them "whatever it takes." Your SPO stops the deal Saturday afternoon. There was no competition at all, and nobody has disclosed the director\'s ties to Riverbend. You make the calls Saturday night after all, a day late, with a phone call on the record you\'d rather not explain.'
            },
            {
              key: 'C', grade: 'risky',
              text: 'No shortcuts. Post a competitive solicitation on BidBuy Monday and buy boxed meals from a grocery store until a contract is awarded.',
              fx: { c: 2, m: -14, v: -6, t: -6 }, days: 5, set: ['slow_path'],
              rules: ['emergency', 'small-purchase'],
              outcome: 'Boxed meals can\'t meet pureed or renal diets, and by Tuesday the dietitian has reported two choking-risk incidents. A full solicitation would take months, and the Code\'s emergency authority exists for exactly this situation. Treating "no emergency" as the safe choice put residents at risk. On Tuesday your SPO tells you to run the emergency process, and you start the calls five days late.'
            },
            {
              key: 'D', grade: 'sound',
              text: 'Have State dietary staff run the kitchen through the weekend, ordering food from the agency\'s existing food-supply contract, and decide on a vendor next week.',
              fx: { c: 6, m: -3, v: 3, t: 3 }, days: 2, set: ['state_staff_bridge'],
              rules: ['existing-contracts', 'emergency'],
              outcome: 'This is legal and it works for a few days. The groceries come through a contract you already have, so nothing new is procured. But four dietary staff can\'t cover 480 meals a day for long. Overtime piles up, and by Tuesday you still need a bridge vendor, so you start the emergency process two days late.'
            }
          ],
          notes: {
            red: 'As the facility director: "These are frail people. Do you want to explain to a reporter that residents went hungry while you filled out forms? Jim at Riverbend is a good guy. Let me call him."',
            ask: [
              'What makes this an emergency under the Code, and who decides?',
              'How much competition is "practicable" with 56 hours on the clock?',
              'What should be in the file by Saturday morning?'
            ],
            good: 'Treat it as an emergency, but run it through the people who hold procurement authority. Check existing contracts first, get as much competition as the time allows, keep the director out of choosing the vendor, and write everything down as you go.'
          }
        },
        {
          id: 'kd2', phase: 'Emergency award', clock: 'Sunday 9:30 a.m. · Day 2',
          title: 'Three quotes and a sweetener',
          situation: [
            'You have three written quotes for meal service. **Lakeview Institutional Foods** is lowest and can start Monday breakfast. **Prairie Plate Co.** is 4% higher and can start Wednesday. **Riverbend Catering** is 11% higher and can start Monday.',
            'Then Lakeview\'s sales lead calls your cell.'
          ],
          inject: {
            kind: 'phone', stamp: 'Inject',
            to: 'Procurement lead', from: 'Marcus Lee', org: 'Lakeview Institutional Foods', when: 'Sunday 9:12 a.m.',
            checks: ['Telephoned', 'Please call', 'Urgent'],
            body: [
              'Can start Monday breakfast with full therapeutic menus. Will take 6% off if you sign a 12-month deal now instead of a short one.',
              'Says "our lawyer told us emergency contracts can run as long as the agency needs."'
            ]
          },
          question: 'How do you structure the emergency award?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Award to Lakeview, with scope limited to meal service at Sangamon Valley and a fixed term only as long as it takes to compete the long-term contract, within the Code\'s limit for emergency contracts.',
              fx: { c: 10, m: 6, v: 4, t: 5 }, set: ['scoped_emergency'],
              rules: ['emergency-term', 'emergency'],
              outcome: 'Lakeview starts Monday breakfast. The award is tied to the emergency: one facility, one service, a fixed end date. The 6% discount disappears, but this contract will hold up when someone reviews it, and the end date forces the re-procurement to get moving.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Take the 12-month deal. A 6% discount saves real money, and you only have to do this once.',
              fx: { c: -15, m: 4, v: 2, t: -8 }, set: ['overlong_emergency'],
              rules: ['emergency-term'],
              outcome: 'The discount is real, but an emergency doesn\'t stretch to a year. It covers the time needed to fix the problem and run a competition. A 12-month emergency award reads as a way around competitive procurement, and the "savings" come at the expense of every vendor who never got to compete.'
            },
            {
              key: 'C', grade: 'violation',
              text: 'Give each vendor a piece: breakfast to one, lunch to another, dinner to the third. Each award stays under the small-purchase threshold, so there\'s no emergency paperwork.',
              fx: { c: -18, m: -6, v: -6, t: -10 }, set: ['stringing'],
              rules: ['stringing', 'small-purchase'],
              outcome: 'Three vendors in one kitchen is chaos. Deliveries collide, diet orders don\'t match, and nobody owns food safety. Dividing one requirement into pieces to stay under a threshold is exactly what the anti-splitting rule prohibits. You still need the emergency process, and now you have three contracts to unwind.'
            },
            {
              key: 'D', grade: 'risky',
              text: 'Award to Lakeview but leave the end date open: "until a new contract is in place."',
              fx: { c: -6, m: 6, v: -2, t: -2 }, days: 1, set: ['open_ended'],
              rules: ['emergency-term'],
              outcome: 'It feels flexible, but an open-ended emergency contract has no natural end, and the re-procurement keeps slipping because nothing forces it. Your SPO sends it back for a fixed term. You lose a day, and the contract is now flagged for review.'
            }
          ],
          notes: {
            red: 'As Marcus Lee: "Look, I\'m trying to save the State money. Six percent on a year of meals is real dollars. Other states let you do this."',
            ask: [
              'Why does the Code limit how long an emergency contract can run?',
              'Is a discount ever a good reason to skip competition?',
              'Who has to sign this award, and who must not?'
            ],
            good: 'Award to the vendor that can meet the need, but scope the award to the emergency: this facility, this service, and a fixed term no longer than it takes to compete the long-term contract. Put the reason you chose Lakeview in writing.'
          }
        },
        {
          id: 'kd3', phase: 'Documentation', clock: 'Thursday · Day 6',
          title: 'The paper trail',
          situation: [
            'Lakeview has served five days of meals without a complaint, and its first invoice is in. The agency\'s general counsel sends you a memo before anyone pays it.'
          ],
          inject: {
            kind: 'memo', stamp: 'Inject',
            to: 'Procurement lead', from: 'Office of General Counsel', when: 'Day 6',
            subject: 'Emergency file: what\'s missing',
            body: [
              'Before we pay Lakeview, the file has to be complete. I see two problems.',
              'First, Riverbend never sent a written quote, only a number by phone. Second, the facility director signed Lakeview\'s start-up agreement on Sunday night because "the SPO was busy."',
              'Please tell me how you intend to close these gaps.'
            ]
          },
          question: 'What goes in the file, and what gets filed?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Write up the basis for the emergency and why you chose Lakeview. Record Riverbend\'s phone quote with the name, time and amount. Have the SPO execute the contract properly. File the emergency notices with the required offices before the deadline.',
              fx: { c: 12, m: 2, v: 2, t: 8 }, set: ['emergency_filed'],
              rules: ['emergency-notice', 'contract-file', 'authority', 'comptroller-filing'],
              outcome: 'The file now tells the whole story: why it was an emergency, who you called, what they quoted, why Lakeview won, and who had authority to sign. A documented phone quote is legitimate evidence of competition. The notices go out on time, and the invoice is paid once the contract is properly executed and filed.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Ask Riverbend to email a written quote dated last Saturday so the file looks complete.',
              fx: { c: -16, t: -16 }, set: ['backdated'],
              rules: ['contract-file', 'records'],
              outcome: 'Riverbend\'s rep sends it without asking questions, and now the file contains a document that misstates when it was created. A fixable documentation gap has become a falsified record, and email metadata will show it. The phone quote you actually had was fine. You only needed to write it down.'
            },
            {
              key: 'C', grade: 'risky',
              text: 'Pay the invoice now and finish the paperwork when things calm down. The emergency is over.',
              fx: { c: -10, m: 2, t: -4 }, set: ['late_filing', 'bad_signature'],
              rules: ['emergency-notice', 'comptroller-filing', 'authority'],
              outcome: 'Lakeview is happy, but the filing deadlines don\'t move because you were busy, and some of them run from the date of the purchase. And the only signature on the agreement is still the director\'s.'
            },
            {
              key: 'D', grade: 'risky',
              text: 'Let the director\'s signature stand. They were on site and the SPO approved it verbally. File the notices and pay.',
              fx: { c: -6, m: 2, t: -2 }, set: ['bad_signature'],
              rules: ['authority', 'emergency-notice'],
              outcome: 'The notices go out on time, which helps. But a verbal OK doesn\'t delegate signature authority. Only someone with delegated procurement authority can bind the State, and the director doesn\'t have it. The contract now has a defect a reviewer will find.'
            }
          ],
          notes: {
            red: 'As the facility director: "I signed it to keep residents fed. Are you seriously going to make an issue of that?"',
            ask: [
              'What has to be filed after an emergency purchase, with whom, and by when?',
              'Is a phone quote good enough evidence of competition?',
              'Who in your agency can actually sign a contract?'
            ],
            good: 'Close the gaps honestly. Document what really happened, including the phone quote, and have someone with delegated authority execute the contract. File the emergency notices on time. A documentation gap can usually be fixed. A falsified document can\'t.'
          }
        },
        {
          id: 'kd4', phase: 'Planning', clock: 'Week 4 · Day 24',
          title: 'The helpful draft',
          situation: [
            'Time to plan the long-term contract: five years, about $9 million. Lakeview\'s vice president of sales emails you an offer.',
            'Meanwhile the facility director wants the solicitation to require "5+ years serving a 150-bed Illinois facility." Only two vendors in the state can meet that, and Lakeview is one of them.'
          ],
          inject: {
            kind: 'email', stamp: 'Inject',
            from: 'Renee Ostrowski, VP Sales, Lakeview Institutional Foods',
            to: 'Procurement lead', when: 'Monday 8:02 a.m.',
            subject: 'Scope of work: happy to help!',
            body: [
              'We\'ve learned your residents\' needs better than anyone. I\'ve attached a draft scope of work and evaluation criteria from a similar contract we won in Indiana. Feel free to copy and paste. It\'ll save you weeks!',
              'Attachment: SVCC_Scope_DRAFT_v3.docx'
            ]
          },
          question: 'How do you build the solicitation?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Decline the draft. Write the requirements with your dietitian and program staff, based on what residents need. Issue a Request for Information open to every vendor if you want market input. Set experience requirements more than two firms can meet.',
              fx: { c: 8, m: 1, v: 8, t: 6 }, days: 7, set: ['clean_specs'],
              rules: ['vendor-specs', 'rfi', 'restrictive-specs'],
              outcome: 'It takes an extra week. The RFI draws six responses, and one shows you a better way to price therapeutic diets. The experience requirement now asks for comparable institutional work rather than 150 beds in Illinois, and five vendors can qualify.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Use Lakeview\'s draft. It\'s thorough and saves weeks.',
              fx: { c: -12, m: 3, v: -10, t: -12 }, days: -7, set: ['vendor_specs'],
              rules: ['vendor-specs', 'restrictive-specs'],
              outcome: 'The draft reads well because it describes Lakeview: its menu software, its staffing model, even a reference to its Indiana contract that nobody deleted. A vendor that writes the specifications gets an advantage others can\'t overcome, and can end up barred from bidding. Competitors will notice.'
            },
            {
              key: 'C', grade: 'risky',
              text: 'Keep the director\'s requirement: 5+ years at a 150-bed Illinois facility. You need an experienced vendor.',
              fx: { c: -5, m: 2, v: -8, t: -5 }, set: ['restrictive_specs'],
              rules: ['restrictive-specs'],
              outcome: 'Experience matters, but this requirement isn\'t tied to anything the residents actually need, and it eliminates most of the market before anyone bids. Qualifications that narrow competition without a documented reason are a common protest ground and a common audit finding.'
            },
            {
              key: 'D', grade: 'risky',
              text: 'Skip the competition. Request a sole-source procurement for Lakeview, since they\'re already doing the job well.',
              fx: { c: -6, m: -4, v: -6, t: -6 }, days: 21, set: ['sole_source_attempt'],
              rules: ['sole-source'],
              outcome: 'A sole source requires public notice and gives others a chance to object, and two competitors do. Being the incumbent, or doing good work, doesn\'t make Lakeview the only feasible source. The request is denied, and the RFP starts three weeks late.'
            }
          ],
          notes: {
            red: 'As Renee Ostrowski: "Honestly, everyone does this. Agencies are understaffed. I\'m just trying to be a good partner. Use whatever you want. I won\'t be offended."',
            ask: [
              'What can happen to a vendor that helps write the specifications?',
              'Where\'s the line between market research and letting a vendor steer?',
              'How would you defend each qualification if a vendor protested it?'
            ],
            good: 'Write the requirements yourself, based on what residents need, and get market input in a way every vendor can see and join, such as an RFI. Any requirement that narrows the field needs a documented reason tied to the mission.'
          }
        },
        {
          id: 'kd5', phase: 'Evaluation', clock: 'Week 12 · Day 80',
          title: 'Short of the goal',
          situation: [
            'The RFP set a Business Enterprise Program (BEP) goal of 20% for this contract. Proposals are in.',
            'Lakeview is the lowest-priced offeror. Its utilization plan shows 9% BEP participation, with a waiver request and documentation of its good-faith efforts. Prairie Plate meets the full 20% goal but costs 6% more.'
          ],
          inject: {
            kind: 'text',
            from: 'Evaluation committee chair', when: 'Tuesday 3:41 p.m.',
            body: [
              'Lakeview\'s BEP is way short. Can we just toss them?',
              'Or honestly, price is what matters for residents. Can we skip the BEP part and score on price and quality?',
              'Need an answer before we meet tomorrow.'
            ]
          },
          question: 'How do you handle the shortfall?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Follow the process in the solicitation. Send Lakeview\'s waiver request and good-faith documentation for BEP review, and keep scoring everyone on the published criteria. Lakeview\'s offer stands or falls on that determination.',
              fx: { c: 10, m: 2, v: 4, t: 8 }, days: 5, set: ['bep_followed'],
              rules: ['bep', 'evaluation'],
              outcome: 'The review finds Lakeview\'s outreach was real but thin: it contacted three certified firms, all the day before proposals were due. The waiver is denied and Lakeview\'s proposal is found not responsive on the BEP requirement. The decision is documented and follows the rules everyone bid under.'
            },
            {
              key: 'B', grade: 'risky',
              text: 'Throw Lakeview out now. They missed the goal.',
              fx: { c: -5, v: -3, t: 2 }, set: ['bep_shortcut'],
              rules: ['bep'],
              outcome: 'You may end up in the same place, but you skipped a step. Falling short and asking for a waiver is allowed, and the request has to be reviewed. Rejecting Lakeview without that review hands it a strong protest argument.'
            },
            {
              key: 'C', grade: 'violation',
              text: 'Ignore the BEP plans. Price and quality are what serve the residents.',
              fx: { c: -14, v: 4, t: -12 }, set: ['bep_ignored'],
              rules: ['bep', 'evaluation'],
              outcome: 'The BEP requirement was part of the solicitation, and every offeror built its proposal around it. Prairie Plate spent real effort assembling a compliant team. Dropping a published requirement after proposals are opened changes the rules mid-game. That\'s a protest you will lose.'
            },
            {
              key: 'D', grade: 'violation',
              text: 'Call Lakeview and suggest they find more certified subcontractors and send a revised plan.',
              fx: { c: -12, v: -2, t: -12 }, set: ['bep_coached'],
              rules: ['evaluation', 'bep'],
              outcome: 'Letting one offeror fix its proposal after the deadline, when nobody else gets the chance, is unequal treatment. Prairie Plate met the goal on time, and it will protest with good reason.'
            }
          ],
          carry: [
            { if: 'restrictive_specs', fx: { v: -6 }, text: 'Your experience requirement left only two qualified offerors, so there was little price competition.' },
            { if: 'clean_specs', fx: { v: 4 }, text: 'Open requirements drew five proposals, and the price competition shows.' }
          ],
          notes: {
            red: 'As the committee chair: "I\'ve done this for 20 years. The BEP stuff is a formality. Let\'s not overthink it."',
            ask: [
              'Who decides a waiver or good-faith-efforts request? Is it the evaluation committee?',
              'Why can\'t one offeror fix its proposal after the deadline?',
              'What does the evaluation file need to show about how BEP was handled?'
            ],
            good: 'Evaluate on the criteria and requirements you published, and nothing else. Send waiver and good-faith requests through the BEP review process the solicitation describes, and treat every offeror the same way.'
          }
        },
        {
          id: 'kd6', phase: 'Award', clock: 'Week 16 · Day 108',
          title: 'Protest',
          situation: [
            'The notice of award is posted. Eight days later a protest arrives from Riverbend\'s lawyers.',
            'The emergency contract ends in 12 days, and the new vendor needs about three weeks to start.'
          ],
          inject: {
            kind: 'letter', stamp: 'Received',
            from: 'Halsted & Monroe LLP',
            to: 'Chief Procurement Officer; DRS Procurement',
            when: 'Day 108',
            subject: 'Protest of award, RFP DRS-27-0412, on behalf of Riverbend Catering, Inc.',
            body: [
              'Riverbend protests the proposed award. It asserts that (1) the evaluation committee credited the apparent awardee with experience not described in its proposal, and (2) the incumbent\'s emergency contract gave it facility information other offerors did not have.',
              'Riverbend asks that the award be suspended until this protest is resolved.'
            ]
          },
          question: 'The protest is on your desk. What do you do?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Send it to the designated protest official right away and pull together the evaluation file. Keep the award on hold unless there\'s a written determination to proceed. If meals are at risk, extend the bridge through the proper process.',
              fx: { c: 10, m: 2, t: 8 }, days: 10, set: ['protest_routed'],
              rules: ['protest', 'emergency-term'],
              outcome: 'The protest is reviewed against a complete file: score sheets, consensus notes and the solicitation. The "unfair access" claim fails because the facility data went to every offeror in an addendum. You extend the bridge for a short, documented period. The protest is denied and the award stands.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Sign the contract with the winner now so service isn\'t disrupted. The protest can play out afterward.',
              fx: { c: -14, m: 4, t: -10 }, set: ['protest_ignored'],
              rules: ['protest'],
              outcome: 'You have a signed contract and a protest that may require undoing it. Signing around a pending protest is what the protest rules are designed to prevent. If the protest succeeds, the State pays to unwind the contract and do it again.'
            },
            {
              key: 'C', grade: 'violation',
              text: 'Call Riverbend\'s owner and offer them the catering-and-events work if they drop the protest.',
              fx: { c: -18, v: -6, t: -18 }, set: ['protest_deal'],
              rules: ['inducement', 'protest'],
              outcome: 'Offering a bidder part of a contract to make a protest go away is a serious integrity problem, and the inducement rules have no exception for good intentions. Riverbend\'s lawyers add your call to the record.'
            },
            {
              key: 'D', grade: 'risky',
              text: 'Answer it yourself: the protest is late and the claims are wrong. Send a denial letter today.',
              fx: { c: -7, t: -4 }, set: ['protest_self'],
              rules: ['protest'],
              outcome: 'You may be right on the merits, but protests go to a designated official, and timeliness depends on when Riverbend knew or should have known the facts. A denial from the wrong person, on the wrong analysis, gives Riverbend a second complaint.'
            }
          ],
          carry: [
            { if: 'vendor_specs', fx: { c: -10, t: -6 }, text: 'Riverbend\'s lawyers found Lakeview\'s Indiana contract number in your scope of work. They add a third ground: a bidder wrote the specifications.' },
            { if: ['overlong_emergency', 'open_ended'], fx: { c: -6 }, text: 'The protest also attacks the emergency contract\'s term as a no-bid head start for the incumbent.' },
            { if: 'bep_coached', fx: { c: -8, t: -6 }, text: 'Prairie Plate joins the protest: the committee let one offeror fix its BEP plan after the deadline.' },
            { if: 'bep_ignored', fx: { c: -6 }, text: 'Prairie Plate files its own protest: the State dropped a published BEP requirement.' },
            { if: 'sole_source_attempt', fx: { t: -3 }, text: 'Riverbend cites your failed sole-source request as evidence the agency favored the incumbent.' }
          ],
          notes: {
            red: 'As Riverbend\'s counsel: "We\'re prepared to go to court if the State signs before this is resolved."',
            ask: [
              'Who decides a protest in this procurement, and how quickly?',
              'What happens to the award while a protest is pending?',
              'If meals are at risk, what are your lawful options to cover the gap?'
            ],
            good: 'Send the protest to the designated official immediately, preserve and assemble the evaluation record, and don\'t sign around it. If service is at risk, use a documented, lawful bridge instead of a rushed award.'
          }
        },
        {
          id: 'kd7', phase: 'Audit', clock: 'Next spring · Day 240',
          title: 'The auditors arrive',
          situation: [
            'The agency\'s compliance examination has selected the Sangamon Valley food-service file, from the emergency through the award. The examiners want the complete file within a week.'
          ],
          inject: {
            kind: 'letter', stamp: 'Inject',
            from: 'Compliance examination team (exercise inject)',
            to: 'DRS Chief Procurement Liaison',
            when: 'Day 240',
            subject: 'Request for procurement file: Sangamon Valley food service',
            body: [
              'Please provide the complete procurement file for the Sangamon Valley emergency purchase and the follow-on contract award, including all notices, filings, quotes, determinations and evaluation records.',
              'Please also identify any known deficiencies and the corrective action taken.'
            ]
          },
          question: 'How do you respond?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Hand over the complete file as it is. Where there are gaps, say so, explain them, and describe the corrective action: training, checklists, and a change in who signs.',
              fx: { c: 8, t: 10 }, set: ['candid_audit'],
              rules: ['records', 'contract-file'],
              outcome: 'Examiners see gaps all the time. What they report on is whether the agency knew about them and fixed them. A candid response with a corrective action plan often turns a potential finding into a managed one.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Before sending the file, recreate any missing documents so the file is complete.',
              fx: { c: -18, t: -18 }, set: ['recreated_docs'],
              rules: ['records'],
              outcome: 'Documents created now and placed in the file as if they existed then are false records, whatever the intent. Examiners check creation dates, and this turns a documentation finding into a referral.'
            },
            {
              key: 'C', grade: 'risky',
              text: 'Send only what was specifically asked for, as late as possible, and let them find the problems themselves.',
              fx: { c: -8, t: -10 }, set: ['slow_walked'],
              rules: ['records'],
              outcome: 'Slow-walking an examination doesn\'t hide anything. It adds a finding about cooperation and makes every gap look worse than it is.'
            },
            {
              key: 'D', grade: 'risky',
              text: 'Ask program staff to handle the response. They ran the facility side.',
              fx: { c: -4, t: -2 },
              rules: ['contract-file'],
              outcome: 'Program staff can help, but the procurement file belongs to procurement. Handing off the response means the people who know the file best aren\'t the ones explaining it.'
            }
          ],
          carry: [
            { if: 'emergency_filed', fx: { c: 6 }, text: 'The emergency notices were filed on time, and the file explains the emergency and the vendor choice. No finding.' },
            { if: 'competed_emergency', fx: { c: 4, t: 2 }, text: 'The call log shows you got as much competition as the time allowed.' },
            { if: 'no_competition', fx: { c: -8, t: -4 }, text: 'The file shows the facility director called his former employer before anyone else. Finding: emergency purchase started without competition, and an undisclosed potential conflict.' },
            { if: 'stringing', fx: { c: -12 }, text: 'Finding: one requirement split across three vendors to stay under the small-purchase threshold.' },
            { if: 'backdated', fx: { c: -14, t: -10 }, text: 'The examiners compare email metadata and find Riverbend\'s "Saturday" quote was created on Day 6. The matter is referred to the inspector general.' },
            { if: 'late_filing', fx: { c: -8 }, text: 'Finding: emergency notices and contract filing missed their deadlines.' },
            { if: 'bad_signature', fx: { c: -6 }, text: 'Finding: the emergency contract was signed by someone without procurement authority.' },
            { if: ['overlong_emergency', 'open_ended'], fx: { c: -6 }, text: 'Finding: the emergency contract\'s term was not limited to the emergency.' },
            { if: 'vendor_specs', fx: { c: -8, t: -6 }, text: 'Finding: specifications copied from a bidder\'s draft.' },
            { if: 'protest_deal', fx: { c: -10, t: -10 }, text: 'Your offer of work to Riverbend in exchange for dropping its protest is in the record. Referred to the inspector general.' },
            { if: 'protest_ignored', fx: { c: -6 }, text: 'Finding: contract executed while a protest was pending, with no written determination.' }
          ],
          notes: {
            red: 'As the lead examiner: "We\'re not here to catch you. We\'re here to find out whether your controls work. Tell us where they didn\'t."',
            ask: [
              'Which of your decisions in turns 1 to 6 show up in this file, and how?',
              'What\'s the difference between fixing a gap and creating a record after the fact?',
              'What would your corrective action plan say?'
            ],
            good: 'Give them the real file, explain the gaps, and show what you\'ve changed. Never create or alter records after the fact.'
          }
        }
      ],
      hotwash: [
        'Where did time pressure push your team toward a shortcut? What would have bought you time instead?',
        'Which early decision cost you the most later on, and when did you realize it?',
        'Who in your real agency holds emergency procurement authority, and how fast can you reach them at 4 p.m. on a Friday?',
        'What would your emergency-purchase checklist include, and who keeps it?',
        'How do you keep someone with vendor ties, like the facility director, out of vendor selection without slowing things down?',
        'What is one thing you will do differently in your own work this month?'
      ]
    },

    /* ------------------------------------------------------------------
       2. THE HELPFUL VENDOR
       ------------------------------------------------------------------ */
    {
      id: 'helpful-vendor',
      file: 'FY27-WG-002',
      title: 'The Helpful Vendor',
      focus: 'Ethics and integrity, from the first invitation to the revolving door',
      blurb: 'A friendly incumbent, a nine-year relationship, and an $18 million re-bid. Nothing dramatic happens. It\'s small favors, offhand questions and helpful offers, one after another.',
      topics: ['Gift ban', 'Communications reporting', 'Free pilots', 'Evaluator conflicts', 'Bid-rigging', 'Revolving door'],
      minutes: 60,
      start: { c: 60, m: 60, v: 60, t: 60 },
      slackDays: 30,
      setting: {
        agency: 'Illinois Department of Central Facilities (fictional)',
        where: 'Twelve State office buildings in Springfield and Chicago',
        role: 'The procurement team running the re-bid of the agency\'s janitorial and building-services contract',
        stakes: 'A five-year contract worth about $18 million, and whether every bidder can trust the result'
      },
      briefing: [
        'Summit Facility Partners has held this contract for nine years. Its account executive, Rick Calloway, is friendly, generous and everywhere: holiday cookies, conference sponsorships, first names with half the agency.',
        'Nothing in this scenario is dramatic on its own. The pressure comes from small favors, offhand questions and helpful offers, each of which feels like ordinary business when it happens.'
      ],
      objectives: [
        'Run a competition every bidder can trust',
        'Recognize gifts, contacts, conflicts and collusion, and handle each one correctly',
        'Protect colleagues from mistakes they don\'t realize they\'re making',
        'Keep the re-bid on schedule'
      ],
      flags: {
        gift_declined: { tone: 'good', label: 'Declined vendor hospitality and told the ethics officer' },
        took_gift: { tone: 'bad', label: 'Accepted a prohibited gift from a bidder' },
        open_rfi: { tone: 'good', label: 'Used an open RFI instead of one vendor\'s pilot' },
        pilot_accepted: { tone: 'bad', label: 'Accepted a bidder\'s free pilot during the re-bid' },
        vendor_specs: { tone: 'bad', label: 'Let a bidder\'s pilot set the specifications' },
        comm_reported: { tone: 'good', label: 'Reported the vendor\'s contact under the Code' },
        unreported_contact: { tone: 'bad', label: 'Vendor contact during the solicitation never reported' },
        info_shared: { tone: 'bad', label: 'Shared information with one bidder off-channel' },
        rumor_scored: { tone: 'bad', label: 'Unverified claim about a bidder entered the evaluation' },
        conflict_managed: { tone: 'good', label: 'Evaluator conflict disclosed, documented and recused before scoring' },
        conflicted_evaluator: { tone: 'bad', label: 'Evaluator with a conflict of interest stayed on the committee' },
        collusion_referred: { tone: 'good', label: 'Suspected bid-rigging preserved and referred' },
        collusion_buried: { tone: 'bad', label: 'Suspected bid-rigging handled quietly and never referred' },
        collusion_tipped: { tone: 'bad', label: 'Suspected colluders tipped off before referral' },
        collusion_ignored: { tone: 'bad', label: 'Clear signs of cover bidding ignored' },
        revolving_door_ok: { tone: 'good', label: 'Revolving-door determination sought before accepting the job' },
        revolving_door_violation: { tone: 'bad', label: 'Revolving-door restriction ignored' },
        looked_away: { tone: 'bad', label: 'Stayed silent about a revolving-door problem' }
      },
      turns: [
        {
          id: 'hv1', phase: 'Pre-solicitation', clock: 'October · Day 0',
          title: 'Box seats',
          situation: [
            'The current contract ends in nine months and you\'ve started the re-bid. Rick sends an invitation to you and two program managers who will likely sit on the evaluation committee.'
          ],
          inject: {
            kind: 'email', stamp: 'Inject',
            from: 'Rick Calloway, Summit Facility Partners',
            to: 'Procurement lead; two program managers',
            when: 'Thursday 2:15 p.m.',
            subject: 'Customer appreciation night: suite seats',
            body: [
              'We\'ve got a suite for Sunday\'s game in Chicago: food, drinks, parking, the works (about $350 a head). No business talk, I promise! Just a thank-you for nine great years.',
              'If football isn\'t your thing, how about dinner at Ottavio\'s next week instead?'
            ]
          },
          question: 'How do you respond?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Decline for all three of you, citing the State\'s gift rules. Tell your ethics officer about the invitation and remind the likely evaluators of the rules.',
              fx: { c: 6, t: 10 }, set: ['gift_declined'],
              rules: ['gift-ban', 'ethics-officer'],
              outcome: 'Rick says, "No worries, rules are rules." Your ethics officer thanks you and sends the committee a one-page reminder. Summit does business with the agency and wants more, which makes it a prohibited source. The gift ban applies whatever anyone intends.'
            },
            {
              key: 'B', grade: 'sound',
              text: 'Go to the game, but pay Summit the full market value of your ticket, food and parking.',
              fx: { c: 1, t: -5 },
              rules: ['gift-ban', 'ethics-officer'],
              outcome: 'Paying market value can take something outside the gift ban, so this may be technically defensible. But you\'ll spend four hours in a vendor\'s suite in the middle of a re-bid, and competitors who hear about it won\'t care that you paid. Defensible isn\'t the same as wise.'
            },
            {
              key: 'C', grade: 'violation',
              text: 'Go. It\'s relationship-building, and you won\'t talk business.',
              fx: { c: -10, t: -14 }, set: ['took_gift'],
              rules: ['gift-ban'],
              outcome: 'A $350 suite seat from a vendor seeking a State contract is a prohibited gift, whether or not anyone talks business. Two of the three of you will probably evaluate the proposals, and you\'ve just handed every competitor a protest argument.'
            },
            {
              key: 'D', grade: 'violation',
              text: 'Skip the game, but accept the dinner. It\'s smaller, and it\'s just a meal.',
              fx: { c: -6, t: -8 }, set: ['took_gift'],
              rules: ['gift-ban'],
              outcome: 'Smaller isn\'t the test. The food-and-refreshment exception has a low daily dollar limit, and a nice dinner from a bidder in the middle of a re-bid is the kind of thing that ends up in an inspector general\'s report.'
            }
          ],
          notes: {
            red: 'As Rick: "Come on, it\'s a thank-you, not a bribe. Your predecessor came every year."',
            ask: [
              'Is Summit a "prohibited source"? Why?',
              'Which gift-ban exceptions exist, and do any of them fit here?',
              'What do you do if a colleague has already said yes?'
            ],
            good: 'Decline, cite the rule, and loop in your ethics officer. Then make sure the people who will evaluate proposals know the rules before the next invitation arrives.'
          }
        },
        {
          id: 'hv2', phase: 'Market research', clock: 'November · Day 30',
          title: 'The free pilot',
          situation: [
            'You\'re drafting the scope of work. Rick calls the building manager at your largest site with an offer, and the manager forwards it to you, clearly excited.'
          ],
          inject: {
            kind: 'phone', stamp: 'Inject',
            to: 'Procurement lead (forwarded by the Lincoln Plaza building manager)',
            from: 'Rick Calloway', org: 'Summit Facility Partners', when: 'Monday 10:40 a.m.',
            checks: ['Telephoned', 'Please call'],
            body: [
              'Offers a free 90-day pilot of Summit\'s new "GreenShield" disinfection program at Lincoln Plaza: equipment, chemicals and staff at no charge.',
              'Says the results would "make a great baseline for the new specs." Can start next week.'
            ]
          },
          question: 'What do you do with the offer?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Decline the pilot. If green cleaning matters, find out what the market offers with a Request for Information open to every vendor, and write any requirement so several products can meet it.',
              fx: { c: 6, v: 6, t: 8 }, days: 10, set: ['open_rfi'],
              rules: ['rfi', 'vendor-specs', 'restrictive-specs'],
              outcome: 'The RFI draws seven responses, including two certified small businesses with comparable programs at lower cost. Your sustainability requirement now describes results, not GreenShield\'s chemistry.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Accept. It\'s free, and the State gets cleaner buildings.',
              fx: { c: -8, v: -6, t: -10 }, set: ['pilot_accepted'],
              rules: ['vendor-specs', 'gift-ban'],
              outcome: 'Nothing is free in the middle of a re-bid. Summit now has a 90-day demonstration in your building, data only it controls, and an inside track on your specifications. A no-cost service from a bidder can also raise gift and donation questions. Every competitor can see the GreenShield vans in the lot.'
            },
            {
              key: 'C', grade: 'sound',
              text: 'Accept the pilot, but offer the same chance to every interested vendor at other buildings.',
              fx: { c: -1, v: 2, t: 2 }, days: 20,
              rules: ['rfi'],
              outcome: 'This is fairer, and some agencies run structured demonstrations this way. But now you have three pilots to manage, no evaluation plan, and donated services to account for. It costs you three weeks, and the results are hard to compare.'
            },
            {
              key: 'D', grade: 'violation',
              text: 'Accept, and use Summit\'s pilot results to set the performance standards in the new contract.',
              fx: { c: -12, v: -8, t: -12 }, set: ['pilot_accepted', 'vendor_specs'],
              rules: ['vendor-specs', 'restrictive-specs'],
              outcome: 'Now the incumbent\'s own test sets the bar its competitors have to clear. That\'s steering the specifications, and a vendor that helps shape them can be barred from bidding on the work.'
            }
          ],
          notes: {
            red: 'As the building manager: "Tenants have complained for years. This is the first time anyone has offered to fix it for free."',
            ask: [
              'What does Summit get out of a free pilot?',
              'How do you learn what the market offers without giving one vendor an edge?',
              'Who in your agency can accept donated services, and how?'
            ],
            good: 'Learn from the whole market at once (an RFI, an industry day or a public notice) and write performance-based requirements that more than one vendor can meet.'
          }
        },
        {
          id: 'hv3', phase: 'Solicitation', clock: 'February · Day 110',
          title: 'Just a quick question',
          situation: [
            'The RFP is posted on BidBuy with you named as the only point of contact, and proposals are due in two weeks. Rick doesn\'t call you. He calls the program manager who will chair the evaluation.'
          ],
          inject: {
            kind: 'text',
            from: 'Program manager (evaluation chair)', when: 'Wednesday 6:52 p.m.',
            body: [
              'Rick from Summit called my cell. He asked whether the committee "cares more about price or the sustainability section."',
              'He also said one of the other bidders, BrightWay, had an OSHA citation last year and we should "look into it."',
              'I didn\'t really answer. Do I need to do anything?'
            ]
          },
          question: 'What do you tell the chair?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Write down what was said, when and by whom, and report it as a procurement communication under the Code. Don\'t respond to Rick except to point him to the official contact. Send the OSHA claim to procurement so it can be checked properly.',
              fx: { c: 10, t: 10 }, set: ['comm_reported'],
              rules: ['comms-reporting', 'single-contact'],
              outcome: 'The report goes in on time. Rick gets a short note pointing him to the contact named in the RFP. The OSHA citation turns out to be minor and resolved, and it\'s handled in the responsibility review like everything else, not as a rumor in the evaluation room.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'You didn\'t really answer, so there\'s nothing to report. Ignore it.',
              fx: { c: -10, t: -8 }, set: ['unreported_contact'],
              rules: ['comms-reporting'],
              outcome: 'Whether you answered doesn\'t matter. The reporting duty is triggered by a communication that tries to give or get material information about a pending procurement, and the clock started when the call ended.'
            },
            {
              key: 'C', grade: 'violation',
              text: 'Tell Rick briefly that price and sustainability both matter. That\'s in the RFP anyway. Then drop it.',
              fx: { c: -12, t: -12 }, set: ['unreported_contact', 'info_shared'],
              rules: ['comms-reporting', 'single-contact', 'confidentiality'],
              outcome: 'Even "public" information shared off-channel with one bidder creates unequal access, and now there\'s a conversation that should have been reported and wasn\'t. Bidders ask questions in writing so that every answer reaches everyone.'
            },
            {
              key: 'D', grade: 'violation',
              text: 'Have the chair raise the OSHA issue with the committee so it can be considered in scoring.',
              fx: { c: -10, v: -4, t: -10 }, set: ['unreported_contact', 'rumor_scored'],
              rules: ['evaluation', 'comms-reporting'],
              outcome: 'An unverified claim from a competitor, delivered by phone, has now entered the evaluation. BrightWay never got to respond. Evaluators score only what\'s in the proposals, against the published criteria.'
            }
          ],
          carry: [
            { if: 'took_gift', fx: { t: -6 }, text: 'Rick\'s call opened with "Great seeing you Sunday!" The chair noticed, and so will anyone who reads about it later.' }
          ],
          notes: {
            red: 'As the chair: "It was a two-minute call. I\'ve known Rick for years. Reporting it feels like I\'m accusing him of something."',
            ask: [
              'What makes a communication reportable? Who reports it, to whom, and how fast?',
              'Why do RFPs name a single point of contact?',
              'How should information about a bidder\'s safety record actually be evaluated?'
            ],
            good: 'Report it promptly through the procurement communications process, point the vendor back to the official contact, and send the substance of the OSHA claim through the responsibility review instead of the rumor mill.'
          }
        },
        {
          id: 'hv4', phase: 'Evaluation', clock: 'March · Day 135',
          title: 'Family business',
          situation: [
            'Five proposals came in. Before scoring, each evaluator signs a conflict-of-interest disclosure. One of them, a facilities supervisor, hesitates and then sends you a note.'
          ],
          inject: {
            kind: 'memo',
            to: 'Procurement lead', from: 'Evaluator 3 (facilities supervisor)', when: 'Day 135',
            subject: 'Something I should mention',
            body: [
              'My husband started working for BrightWay Services six weeks ago in their Chicago office. He\'s not in sales and has nothing to do with this bid.',
              'I\'ve been on three of these committees and I know how to be objective. I\'d hate to leave you short-handed. We only have four evaluators as it is.'
            ]
          },
          question: 'What do you do?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Thank her for disclosing. Remove her from the committee before she scores anything, document the disclosure and the decision, and bring in a qualified replacement.',
              fx: { c: 10, m: -2, t: 10 }, days: 5, set: ['conflict_managed'],
              rules: ['conflict-interest', 'evaluation'],
              outcome: 'It takes a few days to find a replacement from another division. The file shows the conflict was disclosed, assessed and handled before any scoring happened. That\'s the record you want whether BrightWay wins or loses.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Keep her. She disclosed it, and her husband isn\'t involved in the bid.',
              fx: { c: -12, t: -12 }, set: ['conflicted_evaluator'],
              rules: ['conflict-interest'],
              outcome: 'Disclosure is the first step, not the fix. A spouse employed by an offeror is exactly the kind of relationship conflict rules are written for, whatever his role. If BrightWay scores well, every other bidder has a protest. If it scores badly, BrightWay might.'
            },
            {
              key: 'C', grade: 'risky',
              text: 'Keep her, but don\'t let her score BrightWay\'s proposal.',
              fx: { c: -6, t: -6 }, set: ['conflicted_evaluator'],
              rules: ['conflict-interest', 'evaluation'],
              outcome: 'It sounds like a compromise, but scoring is comparative. Every point she gives a competitor changes BrightWay\'s ranking. Partial recusal on a comparative evaluation doesn\'t remove the conflict.'
            },
            {
              key: 'D', grade: 'sound',
              text: 'Disband the committee and start over with all new evaluators, to be safe.',
              fx: { c: 4, m: -6, t: 2 }, days: 20,
              rules: ['evaluation'],
              outcome: 'Clean, but more than you needed. Nobody had scored anything, so replacing one evaluator was enough. You lose three weeks and two experienced evaluators.'
            }
          ],
          notes: {
            red: 'As Evaluator 3: "If you pull me, people will think I did something wrong. I\'m the one who spoke up!"',
            ask: [
              'Is a spouse\'s employment a conflict even if he has nothing to do with the bid?',
              'Why doesn\'t sitting out one proposal fix it?',
              'How do you thank people for disclosing so that others keep doing it?'
            ],
            good: 'Recuse before scoring starts, document it, and replace the evaluator. Make clear that disclosing was the right call, because you want people to keep coming forward.'
          }
        },
        {
          id: 'hv5', phase: 'Evaluation', clock: 'March · Day 142',
          title: 'Same typo, twice',
          situation: [
            'Your price analyst flags something in the price sheets. Two offerors, BrightWay Services and Keystone Building Care, look almost the same. Summit\'s prices fall between them.'
          ],
          inject: {
            kind: 'memo', stamp: 'Inject',
            to: 'Procurement lead', from: 'Price analyst', when: 'Day 142',
            subject: 'Price sheet comparison: please look',
            body: [
              'BrightWay and Keystone: 41 of 44 line items differ by exactly 3.0%. Both misspell "custodial" in row 17. Both PDFs list the same document author, "KBC-Admin."',
              'Summit sits between them on 38 lines. Could be coincidence. Could be something else.'
            ]
          },
          question: 'What do you do?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Don\'t contact the bidders. Preserve everything as submitted, document what you found, and refer it to your Chief Procurement Officer and the appropriate investigators before any award decision.',
              fx: { c: 10, t: 10 }, days: 10, set: ['collusion_referred'],
              rules: ['bid-rigging', 'oeig'],
              outcome: 'The referral goes out quietly. Investigators later find that Keystone prepared both price sheets, a cover bid in exchange for subcontract work. Because nobody tipped off the bidders, the evidence was intact. The procurement continues with those two offers set aside on investigators\' guidance.'
            },
            {
              key: 'B', grade: 'risky',
              text: 'Disqualify BrightWay and Keystone yourself and say nothing about why.',
              fx: { c: -6, t: -4 }, set: ['collusion_buried'],
              rules: ['bid-rigging'],
              outcome: 'You protected this procurement, but you may have buried a pattern that\'s hitting other agencies too. And a disqualification with no documented basis invites protests you can\'t answer without revealing what you suspect.'
            },
            {
              key: 'C', grade: 'violation',
              text: 'Call both companies and ask them to explain the similarities.',
              fx: { c: -10, t: -6 }, set: ['collusion_tipped'],
              rules: ['bid-rigging', 'confidentiality'],
              outcome: 'Both give the same smooth answer: a shared estimating consultant. Within a week, files are cleaned up and emails deleted. Contacting suspected colluders before investigators do is the surest way to destroy a case.'
            },
            {
              key: 'D', grade: 'violation',
              text: 'It\'s probably a coincidence, and bid-rigging isn\'t procurement\'s job. Evaluate everyone normally.',
              fx: { c: -10, v: -8, t: -10 }, set: ['collusion_ignored'],
              rules: ['bid-rigging', 'oeig'],
              outcome: 'Procurement staff are often the only people who can see these patterns. Identical errors and fixed price gaps are classic signs of cover bidding. Ignoring them means the State may pay rigged prices on this contract and others.'
            }
          ],
          carry: [
            { if: 'conflicted_evaluator', fx: { c: -4 }, text: 'Investigators ask why an evaluator whose husband works at BrightWay was still on the committee.' }
          ],
          notes: {
            red: 'As the price analyst: "I could just call Keystone. I know their estimator. Five minutes and we\'d know."',
            ask: [
              'What are the classic red flags of bid-rigging?',
              'Why shouldn\'t you contact the bidders first?',
              'In Illinois, who do you report suspected collusion to?'
            ],
            good: 'Preserve, document and refer, quietly and quickly. Let investigators investigate. Your job is to notice and to protect the evidence.'
          }
        },
        {
          id: 'hv6', phase: 'Post-award', clock: 'Six months after award · Day 330',
          title: 'The job offer',
          situation: [
            'Summit won the re-bid on points. A losing bidder has since filed a complaint about the award, and investigators are reviewing the file.',
            'Then your deputy director, who chaired the selection and signed the award recommendation, comes to your office and closes the door.'
          ],
          inject: {
            kind: 'text',
            from: 'Deputy director', when: 'Friday 4:30 p.m.',
            body: [
              'Summit offered me a regional director job. Double my salary, starting in 60 days.',
              'It\'s been six months since the award and I don\'t manage their contract anymore. That\'s fine, right?',
              'I haven\'t told anyone yet. What would you do?'
            ]
          },
          question: 'What do you advise?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Tell her she has to notify the inspector general and get a revolving-door determination before accepting, because her role in the award likely triggers the one-year restriction. She should also step away from anything involving Summit right now.',
              fx: { c: 10, t: 10 }, set: ['revolving_door_ok'],
              rules: ['revolving-door', 'oeig', 'ethics-officer'],
              outcome: 'She files the notification. The determination finds she took part personally and substantially in an award to Summit well above the statutory threshold, so she can\'t accept the job until a year after she leaves State employment. She\'s disappointed, but she\'s protected, and so is the award.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Six months have passed and she\'s off the contract, so she\'s clear to accept.',
              fx: { c: -12, t: -14 }, set: ['revolving_door_violation'],
              rules: ['revolving-door'],
              outcome: 'The clock doesn\'t start at the award. The restriction runs for a year after she leaves State employment, based on her role in the award. Taking the job without a determination exposes her to penalties and casts doubt on the award she signed.'
            },
            {
              key: 'C', grade: 'violation',
              text: 'Suggest she take a job with Summit\'s parent company instead. That\'s a different employer.',
              fx: { c: -12, t: -12 }, set: ['revolving_door_violation'],
              rules: ['revolving-door'],
              outcome: 'The revolving-door restriction reaches the contractor\'s parent and subsidiaries. A different letterhead doesn\'t change the analysis.'
            },
            {
              key: 'D', grade: 'risky',
              text: 'It\'s her business, not yours. Stay out of it.',
              fx: { c: -4, t: -6 }, set: ['looked_away'],
              rules: ['revolving-door', 'ethics-officer'],
              outcome: 'Her career is her business, but the integrity of an award your team ran is yours. Pointing her to the ethics officer takes thirty seconds and could save her career and your contract.'
            }
          ],
          carry: [
            { if: 'took_gift', fx: { c: -8, t: -8 }, text: 'The complaint cites the vendor hospitality your team accepted during the re-bid. Investigators agree it was a prohibited gift.' },
            { if: 'pilot_accepted', fx: { c: -6, t: -6 }, text: 'The complaint argues Summit\'s free pilot shaped the specifications. Investigators agree it gave the incumbent an edge.' },
            { if: 'unreported_contact', fx: { c: -8, t: -6 }, text: 'Phone records show Rick\'s call to the evaluation chair. It was never reported.' },
            { if: 'conflicted_evaluator', fx: { c: -6 }, text: 'The review notes that an evaluator with a known conflict scored the proposals.' },
            { if: 'collusion_tipped', fx: { c: -6, t: -4 }, text: 'Investigators note the suspected colluders were contacted before the referral, and evidence was lost.' },
            { if: 'collusion_ignored', fx: { c: -8, v: -6 }, text: 'Investigators find the cover-bidding pattern your team missed.' },
            { if: ['comm_reported', 'conflict_managed', 'collusion_referred'], fx: { c: 4, t: 6 }, text: 'Every contact, disclosure and referral is documented. The complaint goes nowhere.' }
          ],
          notes: {
            red: 'As the deputy director: "I\'ve given this State 22 years. I won\'t do anything for Summit I wasn\'t already doing. Why is this anyone\'s business?"',
            ask: [
              'Who in your agency is covered by the revolving-door notification requirement?',
              'What is the contract-value trigger, and what does "personally and substantially" mean?',
              'What should you do when a colleague tells you something like this in confidence?'
            ],
            good: 'Point her to the inspector general\'s revolving-door determination before she accepts anything, and have her step away from Summit matters immediately. The rule protects her as much as the State.'
          }
        }
      ],
      hotwash: [
        'Which situation felt most like ordinary business while you were in it? Why?',
        'Which of these rules protect *you* as much as the State?',
        'Who is your agency\'s ethics officer, and when did you last talk to them?',
        'How would your team spot cover bidding in a real set of price sheets? What tools or data would help?',
        'What would you say to a colleague who has already accepted a gift or taken a call?',
        'What is one habit you will change after today?'
      ]
    },

    /* ------------------------------------------------------------------
       3. SMART BUY
       ------------------------------------------------------------------ */
    {
      id: 'smart-buy',
      file: 'FY27-WG-003',
      title: 'Smart Buy',
      focus: 'Buying an AI tool without losing control of the data or the contract',
      blurb: 'Leadership wants an AI phone agent for a benefits call center, and someone has already started a free trial with real case files. Get from click-through terms to a contract that protects the public.',
      topics: ['Click-through terms', 'Splitting', 'RFP vs. IFB', 'Scored demos', 'Data and AI terms', 'Change orders', 'FOIA'],
      minutes: 60,
      start: { c: 60, m: 60, v: 60, t: 60 },
      slackDays: 30,
      setting: {
        agency: 'Illinois Department of Benefit Services (fictional)',
        where: 'A statewide call center handling 40,000 calls a month about benefit applications',
        role: 'The procurement team supporting the program office, working with the agency\'s IT, security, privacy and legal staff',
        stakes: 'Applicants\' personal data, the public\'s trust in an AI system that answers their questions, and a three-year contract worth about $2.4 million'
      },
      briefing: [
        'Callers wait an average of 38 minutes. Leadership wants an AI virtual agent that can answer common questions in English, Spanish and Polish, plus a tool that drafts case-note summaries for caseworkers.',
        'The market is crowded and moving fast. One vendor, ClearPath AI, has a polished demo and plenty of fans inside the agency. This scenario runs from a free trial someone has already started through the first months after go-live.'
      ],
      objectives: [
        'Protect applicants\' personal data at every step',
        'Buy a tool that actually works, and be able to prove it',
        'Keep contract terms that protect the State: data use, liability, accessibility, exit',
        'Get it live without split purchases or click-through agreements'
      ],
      flags: {
        data_contained: { tone: 'good', label: 'Contained the trial-data exposure early' },
        pcard_split: { tone: 'bad', label: 'Recurring service split into P-card charges under the threshold' },
        click_through: { tone: 'bad', label: 'Click-through terms accepted without authority' },
        data_exposed: { tone: 'bad', label: 'Real case data kept flowing into an uncontracted trial' },
        sole_source_attempt: { tone: 'bad', label: 'Sole-source request with no real justification' },
        rfp_chosen: { tone: 'good', label: 'Competitive RFP with a scored demo and mandatory data terms' },
        ifb_used: { tone: 'bad', label: 'Started with an IFB that couldn\'t evaluate quality' },
        scored_by_criteria: { tone: 'good', label: 'Scored strictly on the published criteria' },
        off_criteria: { tone: 'bad', label: 'Scored on factors that weren\'t in the RFP' },
        dq_no_basis: { tone: 'bad', label: 'Disqualified an offeror without a basis in the RFP' },
        strong_terms: { tone: 'good', label: 'Kept the State\'s data, liability and accessibility terms' },
        weak_terms: { tone: 'bad', label: 'Accepted vendor terms that put the State\'s data and money at risk' },
        side_letter: { tone: 'bad', label: 'Conflicting terms through a side letter' },
        contract_enforced: { tone: 'good', label: 'Enforced accuracy obligations before paying for changes' },
        paid_for_fix: { tone: 'bad', label: 'Paid a change order for performance already required' },
        scope_creep: { tone: 'bad', label: 'Expanded the contract beyond the competed scope' },
        hasty_termination: { tone: 'bad', label: 'Terminated without following the contract\'s process' },
        foia_handled: { tone: 'good', label: 'FOIA response on time, with appropriate redactions' },
        foia_denied: { tone: 'bad', label: 'Blanket FOIA denial' },
        vendor_redacts: { tone: 'bad', label: 'Let the vendor decide FOIA redactions' },
        records_destroyed: { tone: 'bad', label: 'Records destroyed after a FOIA request' }
      },
      turns: [
        {
          id: 'sb1', phase: 'Requirement', clock: 'September · Day 0',
          title: 'Someone already clicked "I agree"',
          situation: [
            'The program office\'s deputy director has been testing ClearPath\'s free trial for three weeks. She signed up with her State email, clicked through the terms of service, and uploaded 200 real case notes "to see how it handles them." She loves it.'
          ],
          inject: {
            kind: 'email', stamp: 'Inject',
            from: 'Deputy Director, Program Operations',
            to: 'Procurement lead', when: 'Tuesday 9:05 a.m.',
            subject: 'Let\'s just buy this',
            body: [
              'ClearPath is amazing. It summarized 200 real case notes in about a minute. The paid plan is $14,500 a month, so each charge is well under the small-purchase limit. Can I put it on my P-card starting next month?',
              'Their sales rep says we can accept their standard online agreement and be live in a day.'
            ]
          },
          question: 'What do you do first?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Stop the uploads now and bring in the agency\'s security and privacy officers and IT to figure out what data went where and whether notice is required. Explain that click-through terms can\'t bind the State and that this needs a real procurement.',
              fx: { c: 10, m: -2, t: 10 }, days: 5, set: ['data_contained'],
              rules: ['data-privacy', 'authority', 'small-purchase', 'stringing'],
              outcome: 'Security finds the case notes included names, case numbers and some medical details, and the trial terms let ClearPath keep uploaded data "to improve services." Legal sends a deletion demand and documents the response. The deputy director is embarrassed but cooperative, and now she understands why the process exists.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Approve the P-card purchase. Each monthly charge is under the small-purchase threshold.',
              fx: { c: -14, v: -6, t: -10 }, set: ['pcard_split', 'click_through', 'data_exposed'],
              rules: ['stringing', 'small-purchase', 'authority', 'contract-terms'],
              outcome: 'The threshold applies to the whole requirement, not the monthly bill. This is a $174,000-a-year service, more than $500,000 over three years, paid in monthly pieces. And the click-through agreement includes customer indemnification, Delaware law and automatic renewal, none of which the State can accept.'
            },
            {
              key: 'C', grade: 'risky',
              text: 'Let the trial continue while you plan a proper procurement. No sense losing momentum.',
              fx: { c: -6, m: 2, t: -8 }, set: ['data_exposed'],
              rules: ['data-privacy', 'authority'],
              outcome: 'The procurement plan is fine. The trial isn\'t. Every day it continues, more real case data goes to a vendor with no contract, no data protections and no obligation to delete anything.'
            },
            {
              key: 'D', grade: 'risky',
              text: 'Ask ClearPath for a sole-source justification letter so you can buy it directly.',
              fx: { c: -6, v: -6, t: -4 }, set: ['sole_source_attempt', 'data_exposed'],
              rules: ['sole-source', 'data-privacy'],
              outcome: 'A vendor\'s letter saying it\'s unique isn\'t a justification, and dozens of vendors sell virtual agents. Meanwhile the trial keeps running with real data in it.'
            }
          ],
          notes: {
            red: 'As the deputy director: "Our callers wait 38 minutes. You\'re telling me a form matters more than that?"',
            ask: [
              'Who can bind the State to a contract? What makes click-through terms a problem?',
              'How do you measure a requirement against the small-purchase threshold: monthly, annually, or over the full term?',
              'What is your agency\'s process when personal data goes somewhere it shouldn\'t?'
            ],
            good: 'Contain the data first. Then explain why this has to go through procurement: the real total value, who can sign, and the terms the State can\'t accept. Turn the deputy director\'s enthusiasm into requirements.'
          }
        },
        {
          id: 'sb2', phase: 'Planning', clock: 'October · Day 30',
          title: 'How to buy it',
          situation: [
            'The program office wants a three-year contract for a virtual agent and a case-note summarizer. Before you choose a method, the agency\'s IT, security and privacy leads send their requirements.'
          ],
          inject: {
            kind: 'memo',
            to: 'Procurement lead', from: 'Agency IT, security and privacy leads', when: 'Day 30',
            subject: 'Non-negotiables for any AI tool',
            body: [
              'No use of State data to train vendor models. Data stored in the U.S. and deleted at contract end. A security review before go-live. Logs the agency owns and can audit. Accessibility conformance for every public-facing screen. A human review path for anything about eligibility.',
              'If those aren\'t in the contract, we can\'t support it.'
            ]
          },
          question: 'Which approach do you take?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'A competitive RFP with performance requirements and published evaluation criteria, including a scripted, scored demonstration on test data, with IT\'s non-negotiables written in as mandatory terms.',
              fx: { c: 8, m: 4, v: 8, t: 6 }, days: 10, set: ['rfp_chosen'],
              rules: ['rfp', 'iitaa', 'data-privacy'],
              outcome: 'It takes longer to write, but you\'ll be able to compare vendors on accuracy, accessibility and security, not just price or polish. Nine vendors download the RFP and six submit proposals.'
            },
            {
              key: 'B', grade: 'risky',
              text: 'An invitation for bids, lowest price wins. It\'s the fastest way to compete it.',
              fx: { c: 2, m: -6, v: -6 }, days: 14, set: ['ifb_used'],
              rules: ['ifb', 'rfp'],
              outcome: 'An IFB fits requirements you can fully specify, where the lowest responsive and responsible bid wins. You can\'t score accuracy or a demonstration in an IFB. Your SPO points this out two weeks in, and you switch to an RFP.'
            },
            {
              key: 'C', grade: 'sound',
              text: 'Find a cooperative contract another government already competed for AI services, and ask the Chief Procurement Officer about using it.',
              fx: { c: 4, m: 6, v: 2, t: 2 }, days: 7,
              rules: ['cooperative', 'data-privacy'],
              outcome: 'This can be a legitimate shortcut if the CPO approves it and the contract\'s scope covers your need. But its terms were negotiated for someone else. Two of IT\'s non-negotiables, no training on State data and deletion at contract end, aren\'t in it, so you\'ll have to negotiate them in or accept the gap.'
            },
            {
              key: 'D', grade: 'violation',
              text: 'Sole source to ClearPath. It\'s the one the program office has already tested.',
              fx: { c: -10, v: -8, t: -6 }, days: 21, set: ['sole_source_attempt'],
              rules: ['sole-source'],
              outcome: 'Liking a product isn\'t a sole-source justification, and neither is having tried it, especially when the trial wasn\'t authorized. The public notice draws objections from four vendors, and the request is withdrawn.'
            }
          ],
          carry: [
            { if: 'data_exposed', fx: { c: -6, t: -6 }, text: 'The trial was still running when planning started. Security finds another 400 case notes were uploaded in the meantime.' },
            { if: 'pcard_split', fx: { c: -4 }, text: 'Two monthly P-card charges to ClearPath have already posted. Finance flags them.' }
          ],
          notes: {
            red: 'As the program director: "Can\'t we just pick the best one? We\'ve all seen the demos."',
            ask: [
              'When is an IFB the right tool, and when is an RFP?',
              'What would a fair, scored demonstration of an AI tool look like?',
              'What do you give up when you use someone else\'s contract?'
            ],
            good: 'Use competitive sealed proposals with measurable requirements: a scripted demo on test data, accuracy thresholds, and accessibility and security terms written in as mandatory requirements.'
          }
        },
        {
          id: 'sb3', phase: 'Evaluation', clock: 'January · Day 120',
          title: 'Demo day',
          situation: [
            'Three finalists run the same scripted demonstration on test data: 25 common caller questions, including five tricky eligibility questions whose answers your policy staff wrote in advance.'
          ],
          inject: {
            kind: 'text',
            from: 'Evaluator (program office)', when: 'Thursday 4:48 p.m.',
            body: [
              'ClearPath got 3 of the 5 eligibility questions wrong. It told a "caller" the wrong deadline. But it was so smooth! They said it\'s fixed in the next release.',
              'Tallgrass Digital (small, BEP-certified) got 24 of 25 right, but the interface looks dated.',
              'Can we give ClearPath extra points for being the market leader? Or let them rerun the demo next week on the new version?'
            ]
          },
          question: 'How do you handle the scoring?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Score every finalist strictly on the published criteria and the documented demo results. Accuracy counts as written. No points for reputation, and no reruns for one vendor.',
              fx: { c: 10, v: 8, t: 8 }, set: ['scored_by_criteria'],
              rules: ['evaluation'],
              outcome: 'Tallgrass Digital comes out ahead on accuracy and accessibility and is close enough on price. ClearPath\'s score reflects what it actually did in the demo. The consensus notes tie every score to a criterion.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Add points for market leadership. It lowers the risk.',
              fx: { c: -12, v: -6, t: -8 }, set: ['off_criteria'],
              rules: ['evaluation'],
              outcome: 'Market leadership wasn\'t a criterion, so scoring it changes the rules after proposals are in. If vendor size or stability was supposed to matter, it needed to be in the RFP for everyone to respond to.'
            },
            {
              key: 'C', grade: 'violation',
              text: 'Let ClearPath rerun the demo next week on its new release.',
              fx: { c: -12, v: -4, t: -10 }, set: ['off_criteria'],
              rules: ['evaluation'],
              outcome: 'A second chance for one finalist is unequal treatment, and the "next release" isn\'t what ClearPath proposed. The other finalists would have liked a do-over too.'
            },
            {
              key: 'D', grade: 'risky',
              text: 'Disqualify ClearPath outright for the wrong answers.',
              fx: { c: -4, v: -2, t: 2 }, set: ['dq_no_basis'],
              rules: ['evaluation'],
              outcome: 'If the RFP made accuracy pass/fail, disqualification might be right. Your RFP scored it, so wrong answers should cost points, not end the evaluation. ClearPath has a real protest argument.'
            }
          ],
          carry: [
            { if: 'ifb_used', fx: { m: -4 }, text: 'Switching from an IFB cost you two weeks, and the demo script was written in a hurry.' }
          ],
          notes: {
            red: 'As the evaluator: "Everyone knows ClearPath is the future. Picking a small firm is how we end up on the front page when they go under."',
            ask: [
              'What can evaluators consider, and what can\'t they?',
              'If vendor stability matters, where should it have been addressed?',
              'How do your consensus notes show that each score is tied to the criteria?'
            ],
            good: 'Score what the RFP said you would score, based on what the demo actually showed. Concerns about a vendor\'s stability belong in the responsibility determination and the RFP criteria, not in points invented afterward.'
          }
        },
        {
          id: 'sb4', phase: 'Negotiation', clock: 'February · Day 150',
          title: 'Their paper',
          situation: [
            'The apparent winner sends back its proposed contract terms. Legal flags four problems, and the program office is anxious to sign. The vendor calls them "industry standard" and says it won\'t move without a price increase.'
          ],
          inject: {
            kind: 'email', stamp: 'Inject',
            from: 'Contracts desk, apparent awardee',
            to: 'Procurement lead', when: 'Monday 11:20 a.m.',
            subject: 'Our standard terms (non-negotiable)',
            body: [
              '1. Vendor may use customer data to train and improve its models. 2. Liability is capped at one month of fees. 3. The agreement renews automatically each year and is governed by Delaware law. 4. Customer indemnifies vendor for any claims arising from use of outputs.',
              'If the State needs changes, we\'ll need to revisit pricing (+18%).'
            ]
          },
          question: 'How do you respond?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Hold the line. The State\'s terms govern: no training on State data, State ownership and deletion of data, Illinois law, no indemnification by the State, security and breach-notice duties, accessibility, and meaningful liability. Negotiate price within the RFP\'s limits if you must.',
              fx: { c: 10, v: 2, t: 10 }, days: 10, set: ['strong_terms'],
              rules: ['contract-terms', 'data-privacy', 'iitaa'],
              outcome: 'After two calls and some pushback, the vendor accepts the State\'s terms with a 4% price increase for the higher liability cap, which the RFP allowed you to negotiate. Ten days later you have a contract that protects the State.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Accept the vendor\'s terms. Going live matters more, and every vendor uses this kind of paper.',
              fx: { c: -14, v: -4, t: -12 }, set: ['weak_terms'],
              rules: ['contract-terms', 'data-privacy'],
              outcome: 'You\'ve agreed that applicants\' data can train a commercial model, that the State will indemnify a vendor, and that Delaware law applies. The State can\'t legally accept some of these terms. Legal won\'t approve it, and if it were signed anyway, the risk would sit with the State for years.'
            },
            {
              key: 'C', grade: 'risky',
              text: 'Sign their paper, but add a side letter saying the State\'s standard terms "also apply."',
              fx: { c: -6, t: -4 }, set: ['side_letter'],
              rules: ['contract-terms'],
              outcome: 'Two conflicting sets of terms with no order of precedence is an argument waiting to happen. When something goes wrong, the vendor\'s lawyers will say their paper controls.'
            },
            {
              key: 'D', grade: 'violation',
              text: 'Drop the restriction on training with State data in exchange for an 18% discount.',
              fx: { c: -10, v: 6, t: -14 }, set: ['weak_terms'],
              rules: ['data-privacy', 'contract-terms'],
              outcome: 'You\'ve traded applicants\' personal information for a discount. At any price, this isn\'t a trade the State should make, and IT already said it couldn\'t support it.'
            }
          ],
          carry: [
            { if: 'off_criteria', fx: { c: -8 }, days: 21, text: 'Before you can sign, a losing finalist protests the evaluation. The off-criteria scoring is in the record, and resolving the protest takes three weeks.' },
            { if: 'dq_no_basis', fx: { c: -6, m: -4 }, days: 21, text: 'ClearPath\'s protest of its disqualification is upheld. You re-score, which takes three weeks.' }
          ],
          notes: {
            red: 'As the vendor\'s contracts manager: "We have 400 customers on these terms. If you want custom paper, you pay custom prices."',
            ask: [
              'Which of these four terms can the State not legally accept, and which are just bad business?',
              'What does your solicitation say about vendor terms and order of precedence?',
              'What is your walk-away point, and who decides it?'
            ],
            good: 'Use the State\'s terms and the solicitation\'s order of precedence. Data use, indemnification, governing law and accessibility are not up for trade. Negotiate price within the RFP\'s limits, and be ready to move to the next-ranked offeror.'
          }
        },
        {
          id: 'sb5', phase: 'Contract management', clock: 'Three weeks after go-live · Day 240',
          title: 'Front page',
          situation: [
            'The virtual agent has been live for three weeks. This story runs Thursday morning. That afternoon the vendor offers a $400,000 "accuracy add-on" by change order, and two other agencies ask to add their call centers to your contract.'
          ],
          inject: {
            kind: 'news',
            from: 'The Capitol Courier (fictional)', when: 'Thursday',
            subject: 'State\'s new AI phone agent gave callers the wrong deadline, advocates say',
            body: [
              'Advocates say the State\'s new automated phone agent told at least a dozen applicants they had 30 days to submit documents, when the actual deadline is 10. "People are going to lose benefits over this," said one legal aid attorney.',
              'The agency said it was "reviewing the reports." The vendor said an "accuracy upgrade" was available.'
            ]
          },
          question: 'What do you do?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Use the contract. Require the vendor to fix the defect under its accuracy and cure obligations, route deadline questions to people until it\'s fixed, and contact affected callers. Judge any change against the original scope, and send the other agencies through a proper process.',
              fx: { c: 8, m: 6, v: 8, t: 10 }, set: ['contract_enforced'],
              rules: ['contract-change', 'contract-terms'],
              outcome: 'The contract\'s accuracy standard and cure provisions do their job. The vendor fixes the deadline logic at no cost within a week, and the agency reaches every affected caller. The "add-on" turns out to be what the State already paid for.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Approve the $400,000 change order. Fixing it fast is what matters.',
              fx: { c: -10, v: -12, t: -6 }, set: ['paid_for_fix'],
              rules: ['contract-change'],
              outcome: 'You\'ve paid extra for performance the contract already required, and added a large sum to a competed contract without asking whether it fits the original scope. The front-page story now has a second act.'
            },
            {
              key: 'C', grade: 'risky',
              text: 'Let the other two agencies add their call centers right away. More users means better pricing.',
              fx: { c: -8, v: -2, t: -4 }, set: ['scope_creep'],
              rules: ['contract-change'],
              outcome: 'Adding agencies that weren\'t part of the solicitation can push the contract beyond the scope and value that were competed. Even where it\'s possible, it needs the right authority and documentation, and doing it during a performance problem just spreads the problem.'
            },
            {
              key: 'D', grade: 'risky',
              text: 'Terminate the contract tomorrow and go back to the old phone tree.',
              fx: { c: -4, m: -10, v: -6, t: 2 }, days: 30, set: ['hasty_termination'],
              rules: ['contract-terms'],
              outcome: 'Termination may be warranted eventually, but skipping the contract\'s notice-and-cure process exposes the State to a claim, and callers go back to 38-minute waits while you start over.'
            }
          ],
          carry: [
            { if: 'weak_terms', fx: { c: -8, v: -8, t: -8 }, text: 'Your contract caps the vendor\'s liability at one month of fees and has no accuracy standard. You have very little leverage.' },
            { if: 'strong_terms', fx: { v: 4, t: 4 }, text: 'The accuracy standards and remedies you negotiated give you real leverage.' },
            { if: 'data_exposed', fx: { t: -6 }, text: 'The reporter has also heard about case notes uploaded during the free trial. That\'s the next story.' }
          ],
          notes: {
            red: 'As the vendor: "AI isn\'t perfect. Every customer sees this in the first month. The add-on is how you get to 99%."',
            ask: [
              'What does your contract say about accuracy, remedies and cure periods?',
              'How do you decide whether a change is within the original scope?',
              'What do you owe the callers who got the wrong answer?'
            ],
            good: 'Enforce the contract you negotiated: cure, remedies and a human fallback. Fix the harm to callers first. Then evaluate any change against the original scope, document it, and get the right authority to approve it.'
          }
        },
        {
          id: 'sb6', phase: 'Transparency', clock: 'Two months after go-live · Day 290',
          title: 'Records request',
          situation: [
            'A legal aid organization files a Freedom of Information Act request with the agency.'
          ],
          inject: {
            kind: 'letter', stamp: 'Received',
            from: 'Prairie Legal Aid Society (fictional)',
            to: 'Agency FOIA officer', when: 'Day 290',
            subject: 'FOIA request: AI phone agent records',
            body: [
              'We request (1) the executed contract and all amendments; (2) the evaluation committee\'s score sheets for the RFP; and (3) all virtual-agent conversation logs from go-live to date that mention document deadlines.',
              'Please redact applicants\' personal information as needed.'
            ]
          },
          question: 'How do you handle the request?',
          options: [
            {
              key: 'A', grade: 'best',
              text: 'Work with your FOIA officer to meet the deadline. Release the contract and post-award evaluation records, redact applicants\' personal information from the logs, and let the vendor make its case for any trade secrets, with the agency making the final call.',
              fx: { c: 10, t: 10 }, set: ['foia_handled'],
              rules: ['foia', 'records'],
              outcome: 'The release goes out on time with careful redactions. The legal aid group\'s report criticizes the launch but credits the agency\'s fix and its openness. A clean answer to a hard request builds trust.'
            },
            {
              key: 'B', grade: 'violation',
              text: 'Deny the whole request. The logs are vendor data and the scores are proprietary.',
              fx: { c: -10, t: -12 }, set: ['foia_denied'],
              rules: ['foia'],
              outcome: 'Public contracts and post-award evaluation records generally aren\'t secret, and logs of a public service are likely public records even when a vendor\'s system holds them. A blanket denial invites an appeal and a worse headline.'
            },
            {
              key: 'C', grade: 'risky',
              text: 'Let the vendor review everything and decide what\'s proprietary.',
              fx: { c: -6, t: -6 }, set: ['vendor_redacts'],
              rules: ['foia'],
              outcome: 'The vendor redacts the error rates. Vendors can explain why something is a trade secret, but the agency decides what the law exempts. Handing that decision to the vendor gives up the agency\'s responsibility.'
            },
            {
              key: 'D', grade: 'violation',
              text: 'Before responding, have the vendor purge logs older than 30 days, as its standard settings do.',
              fx: { c: -18, t: -18 }, set: ['records_destroyed'],
              rules: ['records', 'foia'],
              outcome: 'Destroying records after a request arrives can violate both FOIA and the State Records Act, whatever the vendor\'s default settings say. This is how a product problem becomes an investigation.'
            }
          ],
          carry: [
            { if: 'weak_terms', fx: { c: -6 }, text: 'Your contract doesn\'t give the State ownership of or access to the logs. The vendor makes you ask, and it takes weeks.' },
            { if: 'strong_terms', fx: { c: 4 }, text: 'Your contract makes the logs State records with defined retention, so pulling them takes a day.' }
          ],
          notes: {
            red: 'As the vendor\'s counsel: "Those conversation logs are our proprietary training asset. We object to any release."',
            ask: [
              'Who decides whether something is exempt under FOIA, the vendor or the agency?',
              'When does a record held by a vendor count as a public record?',
              'Why does it matter what your contract says about records and retention?'
            ],
            good: 'Meet the FOIA deadline with your FOIA officer, release what\'s public, redact personal information, and let the vendor argue for trade-secret treatment while the agency keeps the decision. Never destroy records once a request is pending.'
          }
        }
      ],
      hotwash: [
        'At what point did your team first ask, "What data is going where?"',
        'Which AI-specific requirements would you write into your next solicitation: accuracy testing, human review, data use, logs?',
        'How did the terms you chose in turn 4 change your options in turns 5 and 6?',
        'Who in your agency should be at the table before anyone opens a trial account for an AI tool?',
        'What would you tell a program leader who wants to "just try" a tool with real data?',
        'What is one thing you will do differently after today?'
      ]
    }
  ]
};
