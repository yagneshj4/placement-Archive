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
    upvotes: 5 + (idx % 26),
    isVerified: idx % 10 < 7,
    views: 48 + ((idx * 23) % 180),
  };
}

const templates = {
  Deloitte: {
    roles: ['Analyst', 'Associate Analyst'],
    ctc: ['7 LPA', '8 LPA', '9 LPA'],
    platforms: ['AMCAT', 'Superset', 'HackerRank'],
    cities: ['Hyderabad', 'Bengaluru', 'Pune'],
    qA: ['SQL window functions basic case', 'array duplicate handling', 'aptitude probability question', 'OOP abstraction example', 'string transformation logic'],
    qB: ['design audit-log API', 'data validation middleware', 'indexing strategy for reports', 'retry policy for third-party APIs', 'caching dashboards'],
    topics: [['SQL', 'DBMS', 'Technical', 'Communication', 'Backend'], ['DSA', 'Algorithms', 'Arrays', 'Strings', 'Problem Solving'], ['Aptitude', 'Logical Reasoning', 'Quant', 'Verbal', 'Speed']],
  },
  'PwC India': {
    roles: ['Associate Consultant', 'Technology Consultant'],
    ctc: ['6.5 LPA', '7.5 LPA', '8.5 LPA'],
    platforms: ['HackerEarth', 'PwC OA'],
    cities: ['Kolkata', 'Hyderabad', 'Bengaluru'],
    qA: ['graph BFS shortest route', 'hash map based anagram checks', 'SQL joins with conditions', 'debug recursion depth issue', 'set operations in coding'],
    qB: ['LLD for approval workflow', 'API pagination with filters', 'schema normalization tradeoffs', 'session management approach', 'error handling in async queue'],
    topics: [['DSA', 'Graphs', 'Hashing', 'Algorithms', 'Problem Solving'], ['System Design', 'LLD', 'API Design', 'DBMS', 'OOP'], ['Debugging', 'Technical', 'Communication', 'Backend', 'Java']],
  },
  'ZS Associates': {
    roles: ['Business Technology Analyst', 'Decision Analytics Associate'],
    ctc: ['11 LPA', '12 LPA', '13 LPA'],
    platforms: ['HackerRank', 'ZS OA'],
    cities: ['Pune', 'Bengaluru', 'Gurugram'],
    qA: ['data interpretation and logic set', 'SQL aggregation problem', 'array two-pointer optimization'],
    qB: ['design ETL validation pipeline', 'API for analytics ingestion', 'caching for reporting service'],
    topics: [['SQL', 'Data Analysis', 'DBMS', 'Technical', 'Communication'], ['DSA', 'Algorithms', 'Arrays', 'Two Pointers', 'Problem Solving'], ['System Design', 'API Design', 'Backend', 'Debugging', 'OOP']],
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
    const offerReceived = i % 9 !== 6;
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
          projectFocus: 'data-heavy backend workflows, SQL correctness, and API reliability under practical constraints',
          interviewMoment: 'the panel challenged assumptions and I updated the solution by comparing alternatives clearly',
          resultLine: offerReceived
            ? 'I cleared the process and received the final offer.'
            : 'I did not clear the final shortlist in this cycle, but the feedback was useful for later drives.',
          tipFocus: 'Daily practice should include aptitude, SQL, and one medium DSA problem with explanation.',
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

const batch9 = [
  ...makeCompanyBatch('Deloitte', 25, 0),
  ...makeCompanyBatch('PwC India', 20, 200),
  ...makeCompanyBatch('ZS Associates', 5, 400),
];

export default batch9;
