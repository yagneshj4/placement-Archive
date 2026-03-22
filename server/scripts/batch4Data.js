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
  return `I attended the ${company} ${role} placement process in ${year} through our VRSEC placement cell in Vijayawada. The first stage was an online assessment on ${platform} with a strict ${duration} timer. I prepared for around ${prepWindow} by splitting my schedule into aptitude timing practice, core CS fundamentals, and one daily coding set. The OA had the typical service-company structure: quantitative aptitude, logical reasoning, verbal, and one coding/problem-solving section. Questions I remember clearly were ${questionA} and ${questionB}. I made it a habit to note constraints first and then write the approach, because hidden test cases had cost me in earlier drives.

After shortlisting, I had interview rounds in ${city}. Since this was mainly a ${roundType} flow, the panel focused on clarity, problem-solving discipline, and communication. They asked project questions around ${projectFocus}, then moved to OOP, DBMS, SQL, OS, and scenario-based troubleshooting. I explained each answer in a fixed structure: approach, complexity, edge cases, and tradeoff. During the round, ${interviewMoment}. That actually improved my confidence because I stayed calm and gave specific examples from internship and mini-project work instead of textbook-only answers.

In HR and managerial discussion, I got questions on relocation, shift readiness, teamwork conflicts, and delivery pressure. I avoided generic responses and used measurable examples from hackathons and sprint tasks. ${resultLine} This experience proved that for companies like ${company}, strong fundamentals, consistency in timed tests, and clear communication matter more than solving extremely advanced competitive programming questions.`;
}

function buildTips(company, tipFocus) {
  return `For ${company}, keep preparation practical: aptitude speed, OOP, DBMS, SQL, OS basics, and medium DSA patterns (arrays, strings, hashmaps, stacks, queues, trees). Practice at least 8 to 10 full-length timed mocks before the drive. In interview answers, follow a clear sequence: understand problem, approach, complexity, edge cases, then tradeoffs. Keep two HR stories ready: one conflict and one failure-learning. ${tipFocus}`;
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
    upvotes: 6 + (idx % 24),
    isVerified: idx % 10 < 7,
    views: 30 + ((idx * 11) % 170),
  };
}

const templates = {
  Capgemini: {
    roles: ['Analyst', 'Senior Analyst'],
    ctc: ['4.2 LPA', '4.5 LPA', '6.9 LPA', '7.1 LPA'],
    platforms: ['Capgemini Assessment', 'HackerRank', 'HackerEarth'],
    cities: ['Vijayawada', 'Hyderabad', 'Pune', 'Bengaluru', 'Chennai'],
    qA: ['LRU cache operations', 'merge intervals', 'time-work and DI set', 'queue using two stacks', 'binary tree level order'],
    qB: ['SQL joins and group by', 'process vs thread', 'cache invalidation strategy', 'normalization and denormalization', 'statement-assumption reasoning'],
    topics: [['Aptitude', 'Quantitative', 'Reasoning', 'Verbal', 'Problem Solving'], ['SQL', 'DBMS', 'OOP', 'Technical', 'Communication'], ['DSA', 'Algorithms', 'Arrays', 'Strings', 'Problem Solving'], ['System Design', 'API Design', 'Redis', 'Distributed Systems', 'Technical']],
  },
  'L&T Infotech': {
    roles: ['Associate Software Engineer', 'Specialist Engineer'],
    ctc: ['4.3 LPA', '4.6 LPA', '7.0 LPA', '7.2 LPA'],
    platforms: ['LTI Assessment', 'HackerRank', 'HackerEarth'],
    cities: ['Vijayawada', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai'],
    qA: ['coin change DP', 'two-sum with hashmap', 'ratio-proportion set', 'word break DP', 'anagram grouping'],
    qB: ['thread synchronization', 'SQL indexing basics', 'group discussion topic on AI', 'topological sort', 'relocation readiness'],
    topics: [['Aptitude', 'Quantitative', 'Reasoning', 'Verbal', 'Problem Solving'], ['Dynamic Programming', 'Algorithms', 'DSA', 'Technical', 'Problem Solving'], ['SQL', 'DBMS', 'OOP', 'Technical', 'Communication'], ['Managerial', 'Project Management', 'Leadership', 'Communication', 'Teamwork']],
  },
  Accenture: {
    roles: ['Associate Software Engineer', 'Advanced ASE'],
    ctc: ['4.5 LPA', '4.8 LPA', '6.8 LPA'],
    platforms: ['Accenture Assessment', 'HackerRank', 'HackerEarth'],
    cities: ['Vijayawada', 'Hyderabad', 'Bengaluru', 'Pune', 'Chennai'],
    qA: ['minimum platform problem', 'anagram grouping', 'DI and percentages', 'rate limiter design', 'binary search edge cases'],
    qB: ['LRU cache', 'team conflict resolution', 'SQL join and having', 'distributed lock basics', 'critical reasoning set'],
    topics: [['Aptitude', 'Quantitative', 'Reasoning', 'Verbal', 'Problem Solving'], ['LRU Cache', 'Algorithms', 'DSA', 'Technical', 'Problem Solving'], ['HR', 'Behavioral', 'Communication', 'Teamwork', 'Leadership'], ['API Design', 'Distributed Systems', 'Redis', 'System Design', 'Technical']],
  },
  IBM: {
    roles: ['Associate System Engineer', 'Software Developer'],
    ctc: ['5.0 LPA', '5.2 LPA', '8.5 LPA'],
    platforms: ['IBM Assessment', 'HackerRank + Panel'],
    cities: ['Vijayawada', 'Hyderabad', 'Bengaluru', 'Pune', 'Virtual'],
    qA: ['multithreading vs multiprocessing', 'LIS optimization', 'probability and DI set', 'system design for log aggregation', 'SQL query tuning'],
    qB: ['indexing impact', 'anagram hashing', 'career goals in enterprise', 'retry and backpressure', 'HTTP vs HTTPS'],
    topics: [['Technical', 'Java', 'Multithreading', 'SQL', 'DBMS'], ['System Design', 'Distributed Systems', 'Kafka', 'API Design', 'Cloud Computing'], ['Aptitude', 'Quantitative', 'Reasoning', 'Verbal', 'Problem Solving'], ['HR', 'Behavioral', 'Communication', 'Teamwork', 'Leadership']],
  },
};

function pick(arr, i) {
  return arr[i % arr.length];
}

function makeCompanyBatch(company, count, startIdx) {
  const cfg = templates[company];
  const entries = [];
  const roundCycle = ['aptitude', 'technical', 'hr', 'coding', 'technical', 'aptitude', 'technical', 'hr', 'coding', 'technical'];

  for (let i = 0; i < count; i += 1) {
    const globalIdx = startIdx + i;
    const roundType = pick(roundCycle, i);

    if (company === 'Capgemini' && i === 9) {
      // ensure managerial coverage in this batch
      entries.push(createEntry({
        company,
        role: pick(cfg.roles, i),
        year: pick([2024, 2023, 2022, 2021], i),
        roundType: 'managerial',
        offerReceived: true,
        ctcOffered: pick(cfg.ctc, i),
        city: pick(cfg.cities, i),
        platform: pick(cfg.platforms, i),
        duration: '85-minute',
        prepWindow: '5 weeks',
        questionA: 'task prioritization under deadline pressure',
        questionB: 'quality vs delivery tradeoff',
        projectFocus: 'sprint planning and risk handling',
        interviewMoment: 'the manager asked for a real escalation case and I explained my action plan clearly',
        resultLine: 'Managerial round was positive and offer was confirmed.',
        tipFocus: 'Keep one escalation story with concrete actions and outcomes.',
        topics: ['Managerial', 'Project Management', 'Leadership', 'Communication', 'Teamwork'],
        keywords: ['prioritization', 'tradeoff', 'escalation', 'risk', 'managerial round'],
        difficulty: 3,
      }, globalIdx));
      continue;
    }

    if (company === 'Capgemini' && i === 10) {
      // ensure group discussion coverage
      entries.push(createEntry({
        company,
        role: pick(cfg.roles, i),
        year: pick([2024, 2023, 2022, 2021], i),
        roundType: 'group_discussion',
        offerReceived: false,
        ctcOffered: pick(cfg.ctc, i),
        city: 'Campus Hall',
        platform: pick(cfg.platforms, i),
        duration: '70-minute',
        prepWindow: '3 weeks',
        questionA: 'AI impact on fresher hiring',
        questionB: 'remote work versus office collaboration',
        projectFocus: 'n/a',
        interviewMoment: 'I had strong points but did not involve quieter participants enough',
        resultLine: 'I was filtered at GD stage in that drive.',
        tipFocus: 'In GD, facilitation and listening are evaluated strongly.',
        topics: ['Group Discussion', 'Communication', 'Behavioral', 'Leadership', 'Teamwork'],
        keywords: ['GD', 'AI hiring', 'remote work', 'facilitation', 'listening'],
        difficulty: 2,
      }, globalIdx));
      continue;
    }

    if (company === 'IBM' && i === 1) {
      // ensure IBM system design presence
      entries.push(createEntry({
        company,
        role: pick(cfg.roles, i),
        year: pick([2024, 2023, 2022, 2021], i),
        roundType: 'system_design',
        offerReceived: false,
        ctcOffered: pick(cfg.ctc, i),
        city: pick(cfg.cities, i),
        platform: pick(cfg.platforms, i),
        duration: '120-minute',
        prepWindow: '10 weeks',
        questionA: 'design log aggregation pipeline',
        questionB: 'retry and backpressure handling',
        projectFocus: 'event-stream architecture and observability',
        interviewMoment: 'I covered API flow well but was weak on partition strategy',
        resultLine: 'I did not clear final design discussion.',
        tipFocus: 'For event systems, include partitioning and ordering guarantees.',
        topics: ['System Design', 'Distributed Systems', 'Kafka', 'API Design', 'Cloud Computing'],
        keywords: ['log aggregation', 'backpressure', 'retry', 'partitioning', 'observability'],
        difficulty: 4,
      }, globalIdx));
      continue;
    }

    const topics = pick(cfg.topics, i);
    const difficulty = roundType === 'aptitude' || roundType === 'hr' ? 2 : (roundType === 'technical' ? 3 : 4);
    const offerReceived = i % 7 !== 3;

    entries.push(createEntry({
      company,
      role: pick(cfg.roles, i),
      year: pick([2024, 2023, 2022, 2021], i),
      roundType,
      offerReceived,
      ctcOffered: pick(cfg.ctc, i),
      city: pick(cfg.cities, i),
      platform: pick(cfg.platforms, i),
      duration: roundType === 'coding' || roundType === 'technical' ? '110-minute' : '90-minute',
      prepWindow: roundType === 'coding' || roundType === 'technical' ? '8 weeks' : '5 weeks',
      questionA: pick(cfg.qA, i),
      questionB: pick(cfg.qB, i),
      projectFocus: 'API reliability, schema choices, and deployment debugging',
      interviewMoment: 'the interviewer asked follow-ups on tradeoffs and I answered with concrete project examples',
      resultLine: offerReceived ? 'I cleared the process and received the offer.' : 'I did not clear the final shortlist in that cycle.',
      tipFocus: 'Revise fundamentals and keep structured interview communication.',
      topics,
      keywords: [pick(cfg.qA, i), pick(cfg.qB, i), 'tradeoff', 'edge cases', 'project examples'],
      difficulty,
    }, globalIdx));
  }

  return entries;
}

const batch4 = [
  ...makeCompanyBatch('Capgemini', 15, 0),
  ...makeCompanyBatch('L&T Infotech', 15, 100),
  ...makeCompanyBatch('Accenture', 15, 200),
  ...makeCompanyBatch('IBM', 5, 300),
];

export default batch4;
