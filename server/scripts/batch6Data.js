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
    upvotes: 7 + (idx % 24),
    isVerified: idx % 10 < 7,
    views: 45 + ((idx * 17) % 170),
  };
}

const templates = {
  Microsoft: {
    roles: ['Software Engineer', 'SDE-1'],
    ctc: ['22 LPA', '24 LPA', '26 LPA', '28 LPA'],
    platforms: ['Codility', 'HackerRank', 'Microsoft OA'],
    cities: ['Hyderabad', 'Bengaluru', 'Noida'],
    qA: ['design autocomplete service', 'longest increasing subsequence', 'meeting rooms allocation', 'clone graph with mapping', 'design key-value store'],
    qB: ['system design for collaborative editor', 'event-driven notification pipeline', 'segment tree range updates', 'design URL shortener analytics', 'deadlock debugging scenario'],
    topics: [['DSA', 'Algorithms', 'Arrays', 'Strings', 'Problem Solving'], ['System Design', 'Distributed Systems', 'API Design', 'Caching', 'DBMS'], ['Graphs', 'Dynamic Programming', 'Heaps', 'Data Structures', 'Algorithms']],
  },
  Oracle: {
    roles: ['Associate Software Engineer', 'Software Developer'],
    ctc: ['12 LPA', '14 LPA', '16 LPA'],
    platforms: ['HackerRank', 'Oracle OA'],
    cities: ['Bengaluru', 'Hyderabad', 'Chennai'],
    qA: ['database normalization case', 'SQL join optimization', 'balanced parentheses validation', 'priority queue scheduling', 'binary search on answer'],
    qB: ['design inventory API contracts', 'connection pooling strategy', 'index selection for heavy reads', 'queue consumer retry policy', 'transaction isolation scenario'],
    topics: [['SQL', 'DBMS', 'Normalization', 'Joins', 'Technical'], ['DSA', 'Algorithms', 'Stacks', 'Queues', 'Problem Solving'], ['System Design', 'API Design', 'OOP', 'Java', 'Communication']],
  },
  Adobe: {
    roles: ['Member of Technical Staff', 'Software Engineer'],
    ctc: ['24 LPA', '26 LPA', '30 LPA'],
    platforms: ['HackerEarth', 'Adobe OA'],
    cities: ['Noida', 'Bengaluru'],
    qA: ['string compression variants', 'design image metadata index', 'graph traversal for dependency bundles'],
    qB: ['LLD for document comments module', 'cache invalidation for preview service', 'API throttling approach'],
    topics: [['DSA', 'Algorithms', 'Strings', 'Arrays', 'Problem Solving'], ['System Design', 'LLD', 'API Design', 'Caching', 'DBMS'], ['OOP', 'Technical', 'Communication', 'JavaScript', 'Debugging']],
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
    const offerReceived = i % 8 !== 2;
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
          projectFocus: 'backend reliability, API latency optimization, and schema/index tradeoffs',
          interviewMoment: 'the panel added constraints mid-way and I adapted by comparing multiple valid approaches',
          resultLine: offerReceived
            ? 'I cleared the process and received the final offer.'
            : 'I did not clear the final shortlist in this cycle, but the feedback was useful for later drives.',
          tipFocus: 'Use timed mocks and explain complexity and tradeoffs clearly to stand out in technical rounds.',
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

const batch6 = [
  ...makeCompanyBatch('Microsoft', 25, 0),
  ...makeCompanyBatch('Oracle', 20, 200),
  ...makeCompanyBatch('Adobe', 5, 400),
];

export default batch6;
