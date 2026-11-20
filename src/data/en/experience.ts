// Experience page content (English), from brief section 4 and 5.
// Card one-liners are [TO CONFIRM] in the brief. Governance bullets are
// exactly as written in the brief.
export type Band = 'Earlier' | 'Delivery' | 'Governance';
export type Group = { title?: string; meta?: string; bullets: string[] };
export type Stop = {
  id: string; band: Band; dates: string; role: string; org: string; team: string; line: string; groups: Group[];
};

export const experience = {
  sections: [
    { id: 'the-path', label: 'The path' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'selected-work', label: 'Selected work' },
    { id: 'industries', label: 'Industries and platforms' },
    { id: 'skills', label: 'Skills' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'get-in-touch', label: 'Get in touch' },
  ],
  intro:
    "I started in delivery, configuring and implementing Infor CloudSuite for food & beverage and chemicals customers. As Solution Architect I worked in pre-sales, with the Solution Consulting and Sales teams, to understand customers' requirements and propose the solution stack, then carried that solution into delivery. Since February 2026 I decide which services deals are ready to be signed.",

  stops: [
    {
      id: 'internships', band: 'Earlier', dates: 'Dec 2019 – Mar 2021', role: 'Two internships',
      org: 'Schaeffler, Schweinfurt', team: 'Schaeffler, Schweinfurt',
      line: 'Strategic project management, then product management.',
      groups: [
        { title: 'Strategic Project Management intern', meta: 'Regional CEO Office Europe, Dec 2019 – Apr 2020',
          bullets: ['Management-meeting preparation and reporting on strategic projects.', 'Coordination of the TÜV audit.'] },
        { title: 'Product Management intern', meta: 'Rotational and Sensoric Systems, Oct 2020 – Mar 2021',
          bullets: ['Market research and support for product strategy and launch planning.'] },
      ],
    },
    {
      id: 'associate', band: 'Delivery', dates: 'Sep 2021 – Apr 2023', role: 'Associate Consultant', org: 'Infor', team: 'Infor, hybrid',
      line: 'Configured, tested and supported CloudSuite Food & Beverage go-lives.',
      groups: [{ bullets: [
        'I configured, tested and supported go-lives for Infor CloudSuite Food & Beverage implementations.',
        "I gathered requirements with customers and trained end users. I've been an Infor Certified Instructor since 2022.",
        'I did project planning and status reporting with project managers.',
      ] }],
    },
    {
      id: 'consultant', band: 'Delivery', dates: 'Apr 2023 – Oct 2025', role: 'Consultant', org: 'Infor', team: 'Infor, remote',
      line: 'Delivered ERP implementations for food & beverage and chemicals customers.',
      groups: [{ bullets: [
        'I delivered ERP implementations for food & beverage and chemicals customers, across functional and technical workstreams.',
        'I did fit-gap analysis, project estimates and implementation roadmaps.',
        'I localized and translated process and training material for regional requirements.',
        'I ran workshops and gave executive presentations to customer process owners and leadership.',
        'I mentored new consultants and trainees. I was a member of the steering committee of the Food & Beverage Community of Practice.',
      ] }],
    },
    {
      id: 'architect', band: 'Delivery', dates: 'Oct 2025 – Feb 2026', role: 'Solution Architect', org: 'Infor', team: 'Infor, remote',
      line: 'Proposed the solution stack in pre-sales and carried it into delivery.',
      groups: [{ bullets: [
        "In pre-sales, I worked with the Solution Consulting and Sales teams to understand the customer's requirements and propose the solution stack. That is the basis for the solution proposal, scope and estimates for the work.",
        'I shaped the solution scope and architecture for customers in specific industries, from pre-sales into delivery.',
        'I ran requirements and architecture workshops with customer stakeholders, including senior management, and turned them into solution roadmaps.',
        'I owned the functional solution into delivery and kept changes to the target architecture under control.',
      ] }],
    },
    {
      id: 'governance', band: 'Governance', dates: 'Feb 2026 – present', role: 'Transformation Specialist, Senior', org: 'Infor',
      team: 'Infor Global Professional Services, Düsseldorf',
      line: 'I decide which services deals are ready to be signed.',
      groups: [{ bullets: [
        "I review complex services bids independently before they're approved, focusing on whether they're ready for a fixed fee. I check scope, estimates, resourcing, delivery model and customer commitments against each other.",
        'I write clear approval, rejection and escalation notes for deal teams and senior stakeholders.',
        'I govern the global Statement of Work (SOW) templates: their content, version control, alternative language and enablement. I coordinate this with Legal, Finance, IT and the regional teams.',
        'I roll out the templates in several languages (German, French, Spanish and others) and check the localized versions against the approved source.',
        'I improve processes and reporting so governance is faster and more predictable for field teams.',
      ] }],
    },
  ] as Stop[],

  work: [
    {
      title: 'Consulting: stream leadership and implementation',
      items: [
        { industry: 'Chemicals', text: 'Stream lead for Maintenance: led process redesign and change management, and supported the Solution Architects with configuration management and reporting.' },
        { industry: 'Chemicals', text: 'Stream lead for Procurement: analysed and designed improved business processes and made sure they were adopted.' },
        { industry: 'Manufacturing', text: 'Owned the maintenance implementation end to end, from requirements and scoping to go-live support. Trusted advisor for M3 Maintenance.' },
        { industry: 'Food & beverage', text: 'Found and analysed process gaps in the logistics and warehousing streams, led associate consultants across streams and consolidated the gap reporting.' },
        { industry: 'Food & beverage', text: 'Analysed existing processes for optimisation, automated key tasks and improved usability to raise user adoption.' },
        { industry: 'Distribution', text: 'Owned the localisation of an industry process catalogue: reviewed and amended the processes and checked the translated versions for accuracy and consistency.' },
      ],
    },
    {
      title: 'Solution architecture: pre-sales and early delivery',
      items: [
        { industry: 'Food & beverage, two pre-sales engagements', text: 'Led workshops built on best-practice frameworks, assessed fit/gap and complexity, defined the recommended solution stack and total estimate, and presented to the executive team. One engagement helped win a net-new deal.' },
        { industry: 'Food & beverage', text: 'Designed and supervised phase 1 of the implementation and supported the project sponsors at critical decision points.' },
      ],
    },
    {
      title: 'Bridge to governance: early commercial work',
      items: [
        { industry: 'Food & beverage', text: 'Gathered requirements and did the scoping, estimate and work order. Created the project plan and oversaw setup. Analysed the cloud infrastructure for optimisation, and led the review and amendment of a SaaS Order Form with a cross-functional team.' },
      ],
    },
  ],

  industries: ['Manufacturing', 'Distribution and wholesale', 'Food & beverage', 'Chemicals'],
  platforms:
    'Infor M3-based CloudSuites: Food & Beverage, Distribution Enterprise, Chemicals, Manufacturing. Including M3 Maintenance, M3 Inventory Planning Workbench, Infor Factory Track, Infor M3 Graphical Lot Tracker and Infor Process Intelligence. Also Microsoft Copilot.',
  basicExposure: 'Infor VISUAL, SAP S/4HANA',

  skills: {
    delivery: [
      'Process analysis and redesign', 'Requirements and architecture workshops', 'Fit-gap and complexity assessment',
      'Estimating and roadmaps', 'Solution-stack definition', 'Stream leadership', 'Change management and training', 'Mentoring',
    ],
    governance: [
      'Reviewing bids and deals for consistent scope and commitments', 'Governing SOWs and templates',
      'Multilingual localization and rollout', 'Management reporting', 'Executive presentations',
    ],
  },

  certifications: [
    { date: 'Mar 2022', name: 'Infor Certified Instructor' },
    { date: 'Mar 2022', name: 'Infor Certified M3 Warehousing & Procurement Consultant' },
    { date: 'Oct 2021', name: 'Infor Certified CloudSuite Food & Beverage (M3) Associate' },
  ],
};
