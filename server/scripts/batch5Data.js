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
    upvotes: 8 + (idx % 22),
    isVerified: idx % 10 < 7,
    views: 40 + ((idx * 13) % 160),
  };
}

const templates = {
  Amazon: {
    roles: ['SDE-1', 'Software Development Engineer'],
    ctc: ['22 LPA', '24 LPA', '26 LPA', '28 LPA'],
    platforms: ['HackerRank', 'Amazon OA', 'Codility'],
    cities: ['Hyderabad', 'Bengaluru', 'Chennai', 'Pune'],
    qA: ['LRU cache implementation', 'top-k frequent elements', 'word break DP', 'shortest path in weighted graph', 'design rate limiter'],
    qB: ['system design for URL shortener', 'idempotent payment API', 'binary tree max path sum', 'design scalable notification service', 'cache invalidation strategy'],
    topics: [['DSA', 'Algorithms', 'Arrays', 'Strings', 'Problem Solving'], ['System Design', 'Distributed Systems', 'API Design', 'Redis', 'DBMS'], ['Graphs', 'Dynamic Programming', 'Heaps', 'Data Structures', 'Algorithms']],
  },
  Flipkart: {
    roles: ['SDE-1', 'Software Engineer'],
    ctc: ['18 LPA', '20 LPA', '22 LPA'],
    platforms: ['HackerRank', 'Flipkart OA'],
    cities: ['Bengaluru', 'Hyderabad', 'Chennai'],
    qA: ['design hit counter', 'merge k sorted lists', 'minimum window substring', 'class design for cart system', 'MST for warehouse network'],
    qB: ['product search API with filters', 'LLD for inventory service', 'thread-safe queue discussion', 'SQL indexing for catalog', 'retry strategy in checkout'],
    topics: [['DSA', 'Algorithms', 'Heaps', 'Linked Lists', 'Problem Solving'], ['System Design', 'LLD', 'API Design', 'SQL', 'Redis'], ['Concurrency', 'Java', 'DBMS', 'Technical', 'Communication']],
  },
  Meesho: {
    roles: ['SDE-1', 'Backend Engineer'],
    ctc: ['16 LPA', '18 LPA'],
    platforms: ['HackerEarth', 'HackerRank'],
    cities: ['Bengaluru', 'Hyderabad'],
    qA: ['design order status tracking', 'topological sort for dependency jobs', 'anagram grouping'],
    qB: ['rate limiter for seller APIs', 'cache-first read optimization', 'SQL query tuning basics'],
    topics: [['DSA', 'Algorithms', 'Strings', 'Arrays', 'Problem Solving'], ['System Design', 'API Design', 'Distributed Systems', 'Redis', 'DBMS'], ['SQL', 'OOP', 'Technical', 'Communication', 'JavaScript']],
  },
};

function pick(arr, i) {
  return arr[i % arr.length];
}

function makeCompanyBatch(company, count, startIdx) {
  const cfg = templates[company];
  const entries = [];
  const roundCycle = ['coding', 'technical', 'coding', 'system_design', 'technical', 'coding', 'technical', 'hr', 'coding', 'technical'];

  for (let i = 0; i < count; i += 1) {
    const g = startIdx + i;
    const roundType = pick(roundCycle, i);
    const offerReceived = i % 8 !== 3;
    const difficulty = roundType === 'system_design' ? 4 : roundType === 'coding' || roundType === 'technical' ? 4 : 3;

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
          prepWindow: roundType === 'coding' || roundType === 'technical' || roundType === 'system_design' ? '10 weeks' : '6 weeks',
          questionA: pick(cfg.qA, i),
          questionB: pick(cfg.qB, i),
          projectFocus: 'high-traffic backend reliability, database access patterns, and API latency tradeoffs',
          interviewMoment: 'the interviewer asked follow-up constraints and I adapted with complexity-based reasoning',
          resultLine: offerReceived
            ? 'I cleared the process and received the final offer.'
            : 'I did not clear the final shortlist in this cycle, but the feedback was useful for later drives.',
          tipFocus: 'Mock interviews with think-aloud explanation improve final-round performance significantly.',
          topics: pick(cfg.topics, i),
          keywords: [pick(cfg.qA, i), pick(cfg.qB, i), 'complexity', 'edge cases', 'scalability'],
          difficulty,
        },
        g
      )
    );
  }

  return entries;
}

const batch5 = [
  ...makeCompanyBatch('Amazon', 25, 0),
  ...makeCompanyBatch('Flipkart', 20, 200),
  ...makeCompanyBatch('Meesho', 5, 400),
];

export default batch5;
