import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { connectDB } from '../config/db.js'
import { User, Experience, Question, Resource, AnalyticsEvent } from '../models/index.js'

// Seed data
const users = [
  {
    name: 'Yagnesh Admin',
    email: 'admin@vrsec.ac.in',
    passwordHash: 'Admin@1234',
    role: 'admin',
    college: 'VR Siddhartha Engineering College',
    graduationYear: 2027,
    isVerified: true,
    contributionCount: 0,
  },
  {
    name: 'Priya Sharma',
    email: 'priya@vrsec.ac.in',
    passwordHash: 'Student@1234',
    role: 'student',
    college: 'VR Siddhartha Engineering College',
    graduationYear: 2024,
    targetCompanies: ['Amazon', 'Flipkart'],
    targetRole: 'SDE',
    isVerified: true,
    contributionCount: 3,
  },
  {
    name: 'Rohit Reddy',
    email: 'rohit@vrsec.ac.in',
    passwordHash: 'Student@1234',
    role: 'student',
    college: 'VR Siddhartha Engineering College',
    graduationYear: 2024,
    targetCompanies: ['TCS', 'Infosys', 'Wipro'],
    targetRole: 'SDE',
    isVerified: true,
    contributionCount: 2,
  },
  {
    name: 'Anjali Nair',
    email: 'anjali@vrsec.ac.in',
    passwordHash: 'Student@1234',
    role: 'student',
    college: 'VR Siddhartha Engineering College',
    graduationYear: 2025,
    targetCompanies: ['Google', 'Microsoft'],
    targetRole: 'SDE',
    isVerified: true,
    contributionCount: 1,
  },
  {
    name: 'Karthik Varma',
    email: 'karthik@vrsec.ac.in',
    passwordHash: 'Student@1234',
    role: 'student',
    college: 'VR Siddhartha Engineering College',
    graduationYear: 2024,
    targetCompanies: ['JP Morgan', 'Goldman Sachs'],
    targetRole: 'SDE',
    isVerified: true,
    contributionCount: 2,
  },
]

const getExperiences = (userIds) => [
  {
    company: 'Amazon',
    role: 'SDE-1',
    year: 2024,
    roundType: 'technical',
    offerReceived: true,
    ctcOffered: '24 LPA',
    narrative: 'The Amazon SDE-1 interview in 2024 had 3 technical rounds and 1 hiring manager round. First technical round focused on DSA - I was asked to implement LRU Cache using HashMap and DoublyLinkedList. The interviewer was quite thorough about time and space complexity. Second round had two questions: merge k sorted arrays and a binary tree zigzag traversal. Both had to be optimal. Third technical round was system design - design a URL shortener like bit.ly. They expected me to cover hash functions, database schema, scalability, and cache layer. Final round with the hiring manager focused on leadership principles - specifically about a time I disagreed with a team member and how I resolved it.',
    preparationTips: 'Focus heavily on LeetCode medium problems. Amazon cares a lot about leadership principles - prepare 2-3 STAR stories for each principle. For system design, practice URL shortener, rate limiter, and notification system.',
    extractedTags: {
      topics: ['DSA', 'System Design', 'LRU Cache', 'Binary Trees', 'Arrays'],
      keywords: ['LRU Cache', 'URL shortener', 'leadership principles', 'HashMap', 'binary tree'],
      difficulty: 4,
      autoTagged: false,
    },
    embeddingStatus: 'pending',
    submittedBy: userIds[1],
    upvotes: 12,
    isVerified: true,
    views: 45,
  },
  {
    company: 'Amazon',
    role: 'SDE-1',
    year: 2024,
    roundType: 'hr',
    offerReceived: true,
    ctcOffered: '24 LPA',
    narrative: 'Amazon HR round in 2024 was about 45 minutes. The interviewer started with "Tell me about yourself" and quickly moved to behavioral questions. All questions were mapped to Amazon Leadership Principles. I was asked about a situation where I failed and what I learned. Another question was about a time when I had to learn something quickly. They also asked why Amazon specifically - make sure you research the team you are applying to. The interviewer was warm but very structured. They took notes throughout. At the end they asked if I had questions - ask something specific about the team or recent Amazon initiative.',
    preparationTips: 'Memorize all 16 Amazon Leadership Principles. Prepare at least 2 STAR stories per principle. Research the specific Amazon team before the interview. Practice out loud - your stories should sound natural not memorized.',
    extractedTags: {
      topics: ['HR', 'Leadership Principles', 'Behavioral'],
      keywords: ['STAR', 'leadership principles', 'behavioral', 'Amazon culture'],
      difficulty: 3,
      autoTagged: false,
    },
    embeddingStatus: 'pending',
    submittedBy: userIds[1],
    upvotes: 8,
    isVerified: true,
    views: 38,
  },
  {
    company: 'JP Morgan Chase',
    role: 'Software Engineer',
    year: 2024,
    roundType: 'coding',
    offerReceived: true,
    ctcOffered: '18 LPA',
    narrative: 'JP Morgan 2024 coding round was on HackerRank - 2 hours, 3 problems. First problem was easy - find the maximum subarray sum (Kadane algorithm). Second was medium - given a list of transactions, find all suspicious transactions where amount exceeded twice the average of the previous 5 transactions. Third was hard - design a bank account system with deposits, withdrawals and a time-travel query (get balance at timestamp T). I solved first two completely and got partial credit on third. 65 percentile cutoff for shortlisting.',
    preparationTips: 'Practice array manipulation, sliding window, and prefix sum problems heavily for JPMC. Financial domain questions appear - understand basic concepts like transactions, timestamps, and account systems. Speed matters - solve easy in under 15 minutes.',
    extractedTags: {
      topics: ['DSA', 'Arrays', 'Sliding Window', 'Prefix Sum'],
      keywords: ['Kadane', 'subarray', 'transactions', 'timestamp', 'HackerRank'],
      difficulty: 3,
      autoTagged: false,
    },
    embeddingStatus: 'pending',
    submittedBy: userIds[4],
    upvotes: 15,
    isVerified: true,
    views: 62,
  },
  {
    company: 'JP Morgan Chase',
    role: 'Software Engineer',
    year: 2024,
    roundType: 'technical',
    offerReceived: true,
    ctcOffered: '18 LPA',
    narrative: 'JP Morgan technical interview 2024 had two rounds. First technical was core Java concepts - they asked about Java memory model, difference between HashMap and ConcurrentHashMap, what happens when two threads modify the same HashMap simultaneously. Then they gave a coding problem: implement a thread-safe LRU Cache. Second technical round was more design-oriented - design a real-time notification system for a banking app. They wanted me to cover message queues, push notification services, persistence, and failure handling. Knowledge of Spring Boot was a plus but not mandatory.',
    preparationTips: 'JPMC loves Java - revise Java concurrency, Collections framework, and basic multithreading. For system design in fintech context think about reliability, consistency, and audit trails. Prepare for thread-safe data structure implementation.',
    extractedTags: {
      topics: ['Java', 'Multithreading', 'System Design', 'LRU Cache', 'Concurrency'],
      keywords: ['HashMap', 'ConcurrentHashMap', 'thread-safe', 'LRU', 'notification system'],
      difficulty: 4,
      autoTagged: false,
    },
    embeddingStatus: 'pending',
    submittedBy: userIds[4],
    upvotes: 11,
    isVerified: true,
    views: 44,
  },
  {
    company: 'TCS',
    role: 'System Engineer',
    year: 2024,
    roundType: 'aptitude',
    offerReceived: true,
    ctcOffered: '7 LPA',
    narrative: 'TCS NQT 2024 - the National Qualifier Test is the first filter. It has 3 sections: Verbal (20 questions, 20 min), Reasoning (20 questions, 25 min), and Numerical (20 questions, 25 min). There is negative marking of 0.33 per wrong answer. The verbal section had sentence completion, reading comprehension, and error spotting. Reasoning had puzzles, series, blood relations, and coding-decoding. Numerical had profit/loss, time-work, percentages, and data interpretation. I scored 78 percentile which was enough for the next round. Cutoff varies - aim for 70+ percentile to be safe.',
    preparationTips: 'Use TCS NQT mock tests from PrepInsta and IndiaBix. Focus on speed - many students know answers but cannot finish in time. Attempt verbal first as it is fastest. For reasoning practice blood relations and syllogisms daily for 2 weeks.',
    extractedTags: {
      topics: ['Aptitude', 'Verbal', 'Reasoning', 'Quantitative'],
      keywords: ['NQT', 'negative marking', 'verbal', 'reasoning', 'numerical'],
      difficulty: 2,
      autoTagged: false,
    },
    embeddingStatus: 'pending',
    submittedBy: userIds[2],
    upvotes: 20,
    isVerified: true,
    views: 89,
  },
  {
    company: 'Infosys',
    role: 'Systems Engineer',
    year: 2024,
    roundType: 'coding',
    offerReceived: true,
    ctcOffered: '6.5 LPA',
    narrative: 'Infosys InfyTQ coding round 2024 - 3 hours on HackerEarth platform. Had 2 coding problems and 10 MCQs on data structures and algorithms. First coding problem: given a string find the longest palindromic substring - I used dynamic programming approach in O(n^2). Second coding problem: given n cities connected by roads, find the minimum cost to connect all cities (Minimum Spanning Tree using Kruskal algorithm). MCQs covered Big O notation, stack vs queue, binary search trees, and sorting algorithms. Passing threshold was 60 percent.',
    preparationTips: 'InfyTQ certification beforehand greatly helps - do the free course on infytq.com. For the coding round focus on strings, dynamic programming, and graph algorithms. MCQs are straightforward if you know basics. Do not leave MCQs - no negative marking.',
    extractedTags: {
      topics: ['DSA', 'Dynamic Programming', 'Graphs', 'Strings', 'Trees'],
      keywords: ['palindrome', 'MST', 'Kruskal', 'dynamic programming', 'HackerEarth'],
      difficulty: 3,
      autoTagged: false,
    },
    embeddingStatus: 'pending',
    submittedBy: userIds[2],
    upvotes: 14,
    isVerified: true,
    views: 57,
  },
  {
    company: 'Microsoft',
    role: 'SDE-1',
    year: 2023,
    roundType: 'system_design',
    offerReceived: false,
    narrative: 'Microsoft system design round 2023. I was asked to design a collaborative document editor like Google Docs. The interviewer wanted me to cover real-time collaboration (I discussed Operational Transformation vs CRDT), conflict resolution when two users edit simultaneously, offline support and sync, storage design for document versions, and how to scale to 10 million concurrent users. I struggled with the CRDT vs OT tradeoff explanation. The interviewer was helpful and gave hints when I got stuck. Ultimately did not get through because my scalability discussion was weak.',
    preparationTips: 'For Microsoft system design read Designing Data-Intensive Applications. They expect depth on consistency models, distributed systems concepts. Practice out loud - explain your thinking as you go. They care about the process not just the answer.',
    extractedTags: {
      topics: ['System Design', 'Distributed Systems', 'Real-time', 'Scalability'],
      keywords: ['Google Docs', 'CRDT', 'Operational Transformation', 'conflict resolution', 'scalability'],
      difficulty: 5,
      autoTagged: false,
    },
    embeddingStatus: 'pending',
    submittedBy: userIds[3],
    upvotes: 18,
    isVerified: true,
    views: 73,
  },
  {
    company: 'Wipro',
    role: 'Project Engineer',
    year: 2024,
    roundType: 'hr',
    offerReceived: true,
    ctcOffered: '6.5 LPA',
    narrative: 'Wipro HR round 2024 was very standard - about 30 minutes on video call. Questions asked: Tell me about yourself, Why Wipro, Where do you see yourself in 5 years, Are you willing to relocate, What is your biggest strength and weakness. They also asked about my final year project briefly. The interviewer was friendly. No technical questions at all in HR round. Make sure you have clear answers for relocation (say yes unless you genuinely cannot) and the 5-year plan question - they want to see you are committed to growing within the company.',
    preparationTips: 'Wipro HR is purely a formality if you have cleared the technical round. Keep answers concise and positive. Do not speak negatively about previous companies or professors. Prepare a 60-second self introduction that covers education, skills, and one project.',
    extractedTags: {
      topics: ['HR', 'Behavioral'],
      keywords: ['relocation', 'self introduction', 'strengths weaknesses', 'career goals'],
      difficulty: 1,
      autoTagged: false,
    },
    embeddingStatus: 'pending',
    submittedBy: userIds[2],
    upvotes: 6,
    isVerified: false,
    views: 29,
  },
  {
    company: 'Google',
    role: 'SWE-L3',
    year: 2023,
    roundType: 'technical',
    offerReceived: false,
    narrative: 'Google L3 technical interview 2023 - two coding interviews back to back. First interviewer gave me a graph problem: find all critical connections in a network (Bridges in a graph - Tarjan algorithm). I knew the algorithm but made an error in the index tracking. Spent 15 minutes debugging live which hurt my time. Second interviewer gave a more open-ended problem: given a stream of integers, return the median at any point. I used two heaps approach correctly and discussed edge cases thoroughly. The debrief said my problem-solving approach was strong but execution speed needed improvement. Applying again next cycle.',
    preparationTips: 'Google expects clean correct code under time pressure. Practice on a blank document editor - not IDE with autocomplete. After solving any LeetCode problem try to code it again from scratch in 20 minutes. Speed and cleanliness both matter. Graph algorithms - Tarjan, Dijkstra, BFS/DFS variants are common.',
    extractedTags: {
      topics: ['DSA', 'Graphs', 'Heaps', 'Algorithms'],
      keywords: ['Tarjan', 'bridges in graph', 'median stream', 'two heaps', 'critical connections'],
      difficulty: 5,
      autoTagged: false,
    },
    embeddingStatus: 'pending',
    submittedBy: userIds[3],
    upvotes: 22,
    isVerified: true,
    views: 91,
  },
  {
    company: 'Flipkart',
    role: 'SDE-1',
    year: 2024,
    roundType: 'technical',
    offerReceived: true,
    ctcOffered: '20 LPA',
    narrative: 'Flipkart SDE-1 2024 had 3 technical rounds. First round was pure DSA - implement a hit counter that returns the number of hits in the past 5 minutes. I used a sliding window with deque. Second round was design-focused - design the backend for Flipkart product search with filters. I covered inverted index, Elasticsearch, faceted search, caching with Redis, and pagination. Third round was a mix - they gave me a partially implemented LLD for a notification system and asked me to complete it. This tested object-oriented design - I used Observer pattern. Flipkart interviewers are friendly but expect you to drive the discussion.',
    preparationTips: 'Flipkart values LLD (Low Level Design) heavily compared to other companies. Practice designing classes for parking lot, elevator, snake and ladder. For system design cover search systems and recommendation engines. DSA is standard LeetCode medium level.',
    extractedTags: {
      topics: ['DSA', 'System Design', 'LLD', 'OOP', 'Sliding Window'],
      keywords: ['hit counter', 'inverted index', 'Elasticsearch', 'Observer pattern', 'LLD'],
      difficulty: 4,
      autoTagged: false,
    },
    embeddingStatus: 'pending',
    submittedBy: userIds[1],
    upvotes: 16,
    isVerified: true,
    views: 68,
  },
]

const getQuestions = (expIds) => [
  { text: 'Implement an LRU Cache with O(1) get and O(1) put operations.', company: 'Amazon', year: 2024, roundType: 'technical', tags: ['DSA', 'LRU Cache', 'HashMap', 'Linked List'], sourceExperience: expIds[0], upvotes: 8 },
  { text: 'Design a URL shortener like bit.ly. Cover hashing, storage, scalability and caching.', company: 'Amazon', year: 2024, roundType: 'system_design', tags: ['System Design', 'Hashing', 'Scalability', 'Cache'], sourceExperience: expIds[0], upvotes: 12 },
  { text: 'Given an integer array, find the contiguous subarray with the largest sum (Kadane algorithm).', company: 'JP Morgan', year: 2024, roundType: 'coding', tags: ['DSA', 'Arrays', 'Dynamic Programming'], sourceExperience: expIds[2], upvotes: 6 },
  { text: 'Implement a thread-safe LRU Cache in Java using ConcurrentHashMap and ReentrantReadWriteLock.', company: 'JP Morgan', year: 2024, roundType: 'technical', tags: ['Java', 'Concurrency', 'LRU Cache', 'Multithreading'], sourceExperience: expIds[3], upvotes: 9 },
  { text: 'Find all bridges (critical connections) in an undirected graph.', company: 'Google', year: 2023, roundType: 'technical', tags: ['DSA', 'Graphs', 'Tarjan Algorithm'], sourceExperience: expIds[8], upvotes: 14 },
  { text: 'Given a data stream of integers, return the median after each new element is added.', company: 'Google', year: 2023, roundType: 'technical', tags: ['DSA', 'Heaps', 'Two Heaps'], sourceExperience: expIds[8], upvotes: 11 },
  { text: 'Design a hit counter that returns the count of hits in the past 5 minutes.', company: 'Flipkart', year: 2024, roundType: 'technical', tags: ['DSA', 'Sliding Window', 'Deque'], sourceExperience: expIds[9], upvotes: 7 },
  { text: 'Design Flipkart product search with filters, sorting, and pagination.', company: 'Flipkart', year: 2024, roundType: 'system_design', tags: ['System Design', 'Search', 'Elasticsearch', 'Redis'], sourceExperience: expIds[9], upvotes: 10 },
  { text: 'Design a real-time collaborative document editor like Google Docs.', company: 'Microsoft', year: 2023, roundType: 'system_design', tags: ['System Design', 'Real-time', 'Distributed Systems', 'CRDT'], sourceExperience: expIds[6], upvotes: 17 },
  { text: 'Find the longest palindromic substring in a given string.', company: 'Infosys', year: 2024, roundType: 'coding', tags: ['DSA', 'Strings', 'Dynamic Programming'], sourceExperience: expIds[5], upvotes: 5 },
  { text: 'Find the minimum cost to connect all cities (Minimum Spanning Tree - Kruskal or Prim).', company: 'Infosys', year: 2024, roundType: 'coding', tags: ['DSA', 'Graphs', 'MST', 'Greedy'], sourceExperience: expIds[5], upvotes: 4 },
  { text: 'Perform a zigzag level order traversal of a binary tree.', company: 'Amazon', year: 2024, roundType: 'technical', tags: ['DSA', 'Binary Trees', 'BFS'], sourceExperience: expIds[0], upvotes: 6 },
  { text: 'Design a real-time notification system for a banking application.', company: 'JP Morgan', year: 2024, roundType: 'system_design', tags: ['System Design', 'Message Queue', 'Push Notifications', 'Fintech'], sourceExperience: expIds[3], upvotes: 8 },
  { text: 'Describe the difference between HashMap and ConcurrentHashMap. What happens when two threads modify the same HashMap?', company: 'JP Morgan', year: 2024, roundType: 'technical', tags: ['Java', 'Concurrency', 'Collections'], sourceExperience: expIds[3], upvotes: 5 },
  { text: 'Design the Low Level Design for a notification system using the Observer pattern.', company: 'Flipkart', year: 2024, roundType: 'technical', tags: ['LLD', 'OOP', 'Design Patterns', 'Observer Pattern'], sourceExperience: expIds[9], upvotes: 9 },
]

const resources = [
  { skill: 'DSA', title: 'Striver DSA Sheet - 191 Must-Do Problems', type: 'article', url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', platform: 'TakeUForward', difficulty: 2, isVerified: true },
  { skill: 'DSA', title: 'NeetCode 150 - Curated LeetCode Problems', type: 'practice', url: 'https://neetcode.io/practice', platform: 'NeetCode', difficulty: 2, isVerified: true },
  { skill: 'DSA', title: 'Abdul Bari - Algorithms Playlist', type: 'video', url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O', platform: 'YouTube', duration: '35 hours', difficulty: 1, isVerified: true },
  { skill: 'System Design', title: 'System Design Primer - GitHub', type: 'documentation', url: 'https://github.com/donnemartin/system-design-primer', platform: 'GitHub', difficulty: 2, isVerified: true },
  { skill: 'System Design', title: 'Gaurav Sen - System Design YouTube Playlist', type: 'video', url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX', platform: 'YouTube', duration: '12 hours', difficulty: 2, isVerified: true },
  { skill: 'System Design', title: 'Designing Data-Intensive Applications - Martin Kleppmann', type: 'book', url: 'https://dataintensive.net/', platform: 'Book', difficulty: 3, isVerified: true },
  { skill: 'LLD', title: 'Sudocode - LLD Playlist (Parking Lot, Elevator, etc)', type: 'video', url: 'https://www.youtube.com/c/sudocode', platform: 'YouTube', duration: '8 hours', difficulty: 2, isVerified: true },
  { skill: 'Java', title: 'Java Brains - Core Java Playlist', type: 'video', url: 'https://www.youtube.com/c/JavaBrainsChannel', platform: 'YouTube', duration: '20 hours', difficulty: 1, isVerified: true },
  { skill: 'Java', title: 'Java Concurrency in Practice - Brian Goetz', type: 'book', url: 'https://jcip.net/', platform: 'Book', difficulty: 3, isVerified: true },
  { skill: 'Graphs', title: 'Striver - Graph Series A to Z', type: 'video', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn', platform: 'YouTube', duration: '14 hours', difficulty: 2, isVerified: true },
  { skill: 'Dynamic Programming', title: 'Aditya Verma - DP Playlist', type: 'video', url: 'https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqhdCPmFohncHwz8TY2Go', platform: 'YouTube', duration: '18 hours', difficulty: 2, isVerified: true },
  { skill: 'Dynamic Programming', title: 'LeetCode DP Study Plan', type: 'practice', url: 'https://leetcode.com/studyplan/dynamic-programming/', platform: 'LeetCode', duration: '4 weeks', difficulty: 2, isVerified: true },
  { skill: 'DBMS', title: 'Gate Smashers - DBMS Complete Course', type: 'video', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y', platform: 'YouTube', duration: '12 hours', difficulty: 1, isVerified: true },
  { skill: 'OS', title: 'Gate Smashers - Operating System Complete Course', type: 'video', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p', platform: 'YouTube', duration: '15 hours', difficulty: 1, isVerified: true },
  { skill: 'Aptitude', title: 'IndiaBix - Aptitude Questions and Answers', type: 'practice', url: 'https://www.indiabix.com/', platform: 'IndiaBix', difficulty: 1, isVerified: true },
  { skill: 'Aptitude', title: 'PrepInsta - TCS NQT Mock Tests', type: 'practice', url: 'https://prepinsta.com/tcs-nqt/', platform: 'PrepInsta', difficulty: 1, isVerified: true },
  { skill: 'React', title: 'Namaste React - Complete React Course', type: 'video', url: 'https://namastedev.com/learn/namaste-react', platform: 'NamasteDev', duration: '30 hours', difficulty: 2, isVerified: true },
  { skill: 'Node.js', title: 'Node.js Official Documentation', type: 'documentation', url: 'https://nodejs.org/en/docs/', platform: 'nodejs.org', difficulty: 2, isVerified: true },
  { skill: 'MongoDB', title: 'MongoDB University Free Courses', type: 'course', url: 'https://learn.mongodb.com/', platform: 'MongoDB University', duration: '6 hours', difficulty: 1, isVerified: true },
  { skill: 'Heaps', title: 'LeetCode - Heap Problems List', type: 'practice', url: 'https://leetcode.com/tag/heap-priority-queue/', platform: 'LeetCode', difficulty: 2, isVerified: true },
]

// Main seed function
async function seed() {
  try {
    await connectDB()
    console.log('\nStarting seed process...\n')

    // 1. Clear all collections
    console.log('Clearing existing data...')
    await User.deleteMany({})
    await Experience.deleteMany({})
    await Question.deleteMany({})
    await Resource.deleteMany({})
    await AnalyticsEvent.deleteMany({})
    console.log('All collections cleared')

    // 2. Seed Users (passwords are hashed by pre-save hook)
    console.log('\nSeeding users...')
	const createdUsers = []
	for (const user of users) {
		createdUsers.push(await User.create(user))
	}
	const userIds = createdUsers.map((u) => u._id)
	console.log(`${createdUsers.length} users created`)
	console.log('Admin login: admin@vrsec.ac.in / Admin@1234')
	console.log('Student login: priya@vrsec.ac.in / Student@1234')

	// 3. Seed Experiences
	console.log('\nSeeding experiences...')
	const expData = getExperiences(userIds)
	const createdExps = await Experience.insertMany(expData)
	const expIds = createdExps.map((e) => e._id)
	console.log(`${createdExps.length} experiences created`)

    // 4. Update user contributionCounts
    await User.findByIdAndUpdate(userIds[1], { contributionCount: 3 })
    await User.findByIdAndUpdate(userIds[2], { contributionCount: 3 })
    await User.findByIdAndUpdate(userIds[3], { contributionCount: 2 })
    await User.findByIdAndUpdate(userIds[4], { contributionCount: 2 })

    // 5. Seed Questions
    console.log('\nSeeding questions...')
    const qData = getQuestions(expIds)
    const createdQs = await Question.insertMany(qData)
    console.log(`${createdQs.length} questions created`)

    // 6. Seed Resources
    console.log('\nSeeding resources...')
    const createdResources = await Resource.insertMany(resources)
    console.log(`${createdResources.length} resources created`)

    // 7. Seed a few AnalyticsEvents
    console.log('\nSeeding analytics events...')
    const events = [
      { userId: userIds[1], eventType: 'experience_view', targetId: expIds[0], targetModel: 'Experience', payload: {} },
      { userId: userIds[2], eventType: 'question_view', targetId: createdQs[0]._id, targetModel: 'Question', payload: {} },
      { userId: userIds[3], eventType: 'question_time', targetId: createdQs[4]._id, targetModel: 'Question', payload: { seconds: 180 } },
      { userId: userIds[1], eventType: 'experience_bookmark', targetId: expIds[2], targetModel: 'Experience', payload: {} },
      { userId: userIds[4], eventType: 'search_query', payload: { query: 'JP Morgan technical 2024', resultsCount: 2 } },
    ]
    await AnalyticsEvent.insertMany(events)
    console.log(`${events.length} analytics events created`)

    // 8. Final summary
    console.log('\n' + '='.repeat(50))
    console.log('SEED COMPLETE')
    console.log('='.repeat(50))
    console.log(`Users:           ${createdUsers.length}`)
    console.log(`Experiences:     ${createdExps.length}`)
    console.log(`Questions:       ${createdQs.length}`)
    console.log(`Resources:       ${createdResources.length}`)
    console.log(`Analytics Events:${events.length}`)
    console.log('\nOpen MongoDB Atlas to verify all collections are populated.')
    console.log('Admin: admin@vrsec.ac.in | Student: priya@vrsec.ac.in')
    process.exit(0)
  } catch (err) {
    console.error('\nSeed failed:', err.message)
    console.error(err)
    process.exit(1)
  }
}

seed()
