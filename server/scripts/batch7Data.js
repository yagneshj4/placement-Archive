function buildNarrative({
  company,
  role,
  year,
  roundType,
  city,
  platform,
  duration,
  prepWindow,
  questionA,
  questionB,
  projectFocus,
  interviewMoment,
  resultLine,
}) {
  return `I attended the ${company} ${role} placement process in ${year} through our VRSEC placement cell in Vijayawada. The first stage was an online assessment on ${platform} with a strict ${duration} timer. I prepared for around ${prepWindow} with a focused plan: one aptitude set, one coding problem set, and one revision block for CS fundamentals every day. The assessment pattern had quantitative aptitude, logical reasoning, verbal, and coding/problem-solving sections. I remember getting questions like ${questionA} and ${questionB}. I wrote down constraints first, tested edge cases on rough sheet, and only then finalized submission to reduce avoidable mistakes.

After shortlisting, I attended interviews in ${city}. Since this was mainly a ${roundType} heavy flow, the panel expected stronger problem-solving depth and clean communication. They asked me to explain project decisions around ${projectFocus}, followed by DSA, SQL, OOP, and scenario-based debugging. I noticed interviewers appreciated clear structure: approach, complexity, edge cases, and tradeoffs. During the round, ${interviewMoment}. That helped me stay calm and convert the discussion into a practical, collaborative format rather than a one-way Q&A.

In HR and managerial interactions, they asked about relocation, shift readiness, teamwork pressure, and delivery ownership. I avoided generic answers and used measurable examples from internship and mini-project work. ${resultLine} Overall, this process reinforced that for ${company}, medium-to-hard DSA clarity, disciplined communication, and practical engineering thinking matter more than memorizing textbook lines.`;
}

function buildTips(company, tipFocus) {
  return `For ${company}, prioritize DSA and practical backend thinking: arrays, strings, hashing, heaps, graphs, dynamic programming, and clean SQL basics. Practice timed coding rounds in 90-120 minute windows and explain tradeoffs aloud during mock interviews. For system-design questions, include APIs, DB schema, caching, retries, and failure handling. ${tipFocus}`;
}

function createEntry(spec, idx) {
  return {
    company: spec.company,
    role: spec.role,
    year: spec.year,
    roundType: spec.roundType,
    offerReceived: spec.offerReceived,
    ctcOffered: spec.offerReceived ? spec.ctcOffered : '',
    narrative: buildNarrative(spec),
    preparationTips: buildTips(spec.company, spec.tipFocus),
    extractedTags: {
      topics: spec.topics,
      keywords: spec.keywords,
      difficulty: spec.difficulty,
      autoTagged: false,
    },
    embeddingStatus: 'pending',
    upvotes: 9 + (idx % 21),
    isVerified: idx % 10 < 7,
    views: 42 + ((idx * 19) % 175),
  };
}

const templates = {
  Wipro: {
    roles: ['Project Engineer', 'Software Engineer'],
    ctc: ['6.5 LPA', '7.5 LPA', '8.5 LPA'],
    platforms: ['AMCAT', 'Superset', 'HackerRank'],
    cities: ['Hyderabad', 'Bengaluru', 'Chennai', 'Pune'],
    qA: ['array rotation optimization', 'string pattern frequency', 'minimum platforms scheduling', 'basic SQL joins with filters', 'debug OOP inheritance bug'],
    qB: ['REST API for employee onboarding', 'retry handling in service calls', 'normalize table schema decision', 'queue-based ticket assignment', 'binary search in rotated array'],
    topics: [['DSA', 'Algorithms', 'Arrays', 'Strings', 'Problem Solving'], ['SQL', 'DBMS', 'Joins', 'Normalization', 'Technical'], ['OOP', 'Java', 'Debugging', 'Communication', 'Technical']],
  },
  'TCS Digital': {
    roles: ['Digital Role Engineer', 'System Engineer'],
    ctc: ['7 LPA', '8 LPA', '9 LPA'],
    platforms: ['TCS iON', 'CodeVita', 'HackerEarth'],
    cities: ['Hyderabad', 'Chennai', 'Kolkata'],
    qA: ['graph BFS shortest path', 'hash map frequency analysis', 'DP for coin change variant', 'aptitude speed-distance-time', 'logical arrangement puzzle'],
    qB: ['database index choice under heavy reads', 'API pagination strategy', 'LLD for leave management', 'deadlock prevention basics', 'cache invalidation use case'],
    topics: [['DSA', 'Graphs', 'Dynamic Programming', 'Algorithms', 'Problem Solving'], ['Aptitude', 'Logical Reasoning', 'Quant', 'Verbal', 'Speed'], ['System Design', 'LLD', 'API Design', 'DBMS', 'OOP']],
  },
  Infosys: {
    roles: ['Specialist Programmer', 'Systems Engineer'],
    ctc: ['9 LPA', '10 LPA', '11 LPA'],
    platforms: ['InfyTQ', 'HackerRank'],
    cities: ['Mysuru', 'Bengaluru', 'Hyderabad'],
    qA: ['linked list cycle detection', 'top-k using heap', 'SQL group by with having'],
    qB: ['design notification microservice', 'thread pool tuning discussion', 'error handling in async API'],
    topics: [['DSA', 'Heaps', 'Linked Lists', 'Algorithms', 'Problem Solving'], ['SQL', 'DBMS', 'Technical', 'Communication', 'OOP'], ['System Design', 'Microservices', 'API Design', 'Concurrency', 'Debugging']],
  },
};

function pick(arr, i) {
  return arr[i % arr.length];
}

function makeCompanyBatch(company, count, startIdx) {
  const cfg = templates[company];
  const entries = [];
  const roundCycle = ['aptitude', 'coding', 'technical', 'coding', 'technical', 'hr', 'coding', 'technical', 'system_design', 'coding'];

  for (let i = 0; i < count; i += 1) {
    const g = startIdx + i;
    const roundType = pick(roundCycle, i);
    const offerReceived = i % 9 !== 4;
    const difficulty = roundType === 'system_design' ? 4 : roundType === 'coding' || roundType === 'technical' ? 3 : 2;

    entries.push(
      createEntry(
        {
          company,
          role: pick(cfg.roles, i),
          year: pick([2024, 2023, 2022, 2021], i),
          roundType,
          offerReceived,
          ctcOffered: pick(cfg.ctc, i),
          city: pick(cfg.cities, i),
          platform: pick(cfg.platforms, i),
          duration: roundType === 'coding' || roundType === 'technical' || roundType === 'system_design' ? '120-minute' : '90-minute',
          prepWindow: roundType === 'coding' || roundType === 'technical' || roundType === 'system_design' ? '8 weeks' : '6 weeks',
          questionA: pick(cfg.qA, i),
          questionB: pick(cfg.qB, i),
          projectFocus: 'service reliability, SQL query quality, and practical debugging in backend workflows',
          interviewMoment: 'the interviewer added production constraints and I compared alternatives with clear tradeoffs',
          resultLine: offerReceived
            ? 'I cleared the process and received the final offer.'
            : 'I did not clear the final shortlist in this cycle, but the feedback was useful for later drives.',
          tipFocus: 'Revise aptitude plus coding daily and keep one mock interview every weekend for consistency.',
          topics: pick(cfg.topics, i),
          keywords: [pick(cfg.qA, i), pick(cfg.qB, i), 'complexity', 'edge cases', 'communication'],
          difficulty,
        },
        g
      )
    );
  }

  return entries;
}

const batch7 = [
  ...makeCompanyBatch('Wipro', 25, 0),
  ...makeCompanyBatch('TCS Digital', 20, 200),
  ...makeCompanyBatch('Infosys', 5, 400),
];

export default batch7;
