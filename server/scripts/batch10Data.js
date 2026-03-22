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
    upvotes: 8 + (idx % 23),
    isVerified: idx % 10 < 7,
    views: 44 + ((idx * 29) % 170),
  };
}

const templates = {
  'L&T Technology Services': {
    roles: ['Graduate Engineer Trainee', 'Software Engineer'],
    ctc: ['6 LPA', '7 LPA', '8 LPA'],
    platforms: ['Superset', 'HackerEarth', 'AMCAT'],
    cities: ['Hyderabad', 'Bengaluru', 'Chennai'],
    qA: ['binary search lower bound use case', 'array partition balancing', 'SQL joins and group by', 'OOP interface design', 'graph cycle detection'],
    qB: ['design telemetry API', 'retry and timeout policy', 'index selection for query speed', 'queue worker scaling basics', 'cache key design'],
    topics: [['DSA', 'Algorithms', 'Arrays', 'Problem Solving', 'Technical'], ['SQL', 'DBMS', 'Joins', 'Backend', 'Communication'], ['OOP', 'Java', 'Debugging', 'API Design', 'System Design']],
  },
  Mindtree: {
    roles: ['Software Engineer', 'Associate Software Engineer'],
    ctc: ['5.5 LPA', '6.5 LPA', '7.5 LPA'],
    platforms: ['HackerRank', 'Mindtree OA'],
    cities: ['Bengaluru', 'Hyderabad', 'Pune'],
    qA: ['hash map frequency problems', 'stack expression evaluator', 'aptitude percentages and ratios', 'string window optimization', 'BFS shortest path'],
    qB: ['LLD for support ticket module', 'API auth middleware', 'schema normalization choices', 'error handling in async jobs', 'rate limiting policy'],
    topics: [['DSA', 'Hashing', 'Stacks', 'Algorithms', 'Problem Solving'], ['Aptitude', 'Quant', 'Logical Reasoning', 'Verbal', 'Speed'], ['System Design', 'LLD', 'DBMS', 'OOP', 'Debugging']],
  },
  Mphasis: {
    roles: ['Associate Software Engineer', 'Trainee Engineer'],
    ctc: ['5 LPA', '6 LPA', '7 LPA'],
    platforms: ['AMCAT', 'Mphasis OA'],
    cities: ['Pune', 'Bengaluru', 'Chennai'],
    qA: ['linked list manipulations', 'greedy interval scheduling', 'SQL aggregation edge cases'],
    qB: ['design feedback API', 'cache invalidation strategy', 'background queue retry'],
    topics: [['DSA', 'Linked Lists', 'Greedy', 'Algorithms', 'Problem Solving'], ['SQL', 'DBMS', 'Technical', 'Communication', 'Backend'], ['System Design', 'API Design', 'OOP', 'Debugging', 'JavaScript']],
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
    const offerReceived = i % 9 !== 1;
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
          projectFocus: 'clean backend implementation, robust SQL handling, and reliable API behavior under load',
          interviewMoment: 'the interviewer changed constraints mid-solution and I compared options with clear tradeoffs',
          resultLine: offerReceived
            ? 'I cleared the process and received the final offer.'
            : 'I did not clear the final shortlist in this cycle, but the feedback was useful for later drives.',
          tipFocus: 'Practice one aptitude set, one SQL set, and one coding problem daily for steady progress.',
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

const batch10 = [
  ...makeCompanyBatch('L&T Technology Services', 25, 0),
  ...makeCompanyBatch('Mindtree', 20, 200),
  ...makeCompanyBatch('Mphasis', 5, 400),
];

export default batch10;
