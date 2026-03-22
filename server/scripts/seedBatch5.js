import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { connectDB } from '../config/db.js';
import { User, Experience } from '../models/index.js';
import batch5 from './batch5Data.js';

function expKey(exp) {
  return [
    exp.company,
    exp.role,
    exp.year,
    exp.roundType,
    exp.offerReceived,
    exp.ctcOffered || '',
    exp.narrative,
  ].join('||');
}

const seedBatch5 = async () => {
  try {
    await connectDB();

    let users = await User.find({}, { _id: 1 }).lean();

    if (!users.length) {
      const fallbackUsers = [
        {
          name: 'Batch Seeder Student 1',
          email: 'batch5.student1@vrsec.ac.in',
          passwordHash: 'Student@1234',
          role: 'student',
          college: 'VR Siddhartha Engineering College',
          graduationYear: 2024,
          isVerified: true,
        },
        {
          name: 'Batch Seeder Student 2',
          email: 'batch5.student2@vrsec.ac.in',
          passwordHash: 'Student@1234',
          role: 'student',
          college: 'VR Siddhartha Engineering College',
          graduationYear: 2025,
          isVerified: true,
        },
      ];

      await User.insertMany(fallbackUsers);
      users = await User.find({}, { _id: 1 }).lean();
    }

    if (!users.length) {
      throw new Error('No users found. Seed users first so experiences can be linked via submittedBy.');
    }

    const existing = await Experience.find(
      {},
      'company role year roundType offerReceived ctcOffered narrative'
    ).lean();

    const existingKeys = new Set(existing.map(expKey));

    const experiencesWithUser = batch5.map((exp) => ({
      ...exp,
      submittedBy: users[Math.floor(Math.random() * users.length)]._id,
    }));

    const toInsert = experiencesWithUser.filter((exp) => !existingKeys.has(expKey(exp)));

    if (toInsert.length > 0) {
      await Experience.insertMany(toInsert);
    }

    const totalCount = await Experience.countDocuments();

    const byCompany = toInsert.reduce((acc, e) => {
      acc[e.company] = (acc[e.company] || 0) + 1;
      return acc;
    }, {});

    const byRound = toInsert.reduce((acc, e) => {
      acc[e.roundType] = (acc[e.roundType] || 0) + 1;
      return acc;
    }, {});

    const byYear = toInsert.reduce((acc, e) => {
      acc[e.year] = (acc[e.year] || 0) + 1;
      return acc;
    }, {});

    console.log('Batch 5 processed successfully.');
    console.log(`Inserted now: ${toInsert.length}`);
    console.log(`Total experiences in DB: ${totalCount}`);
    console.log('By company:', byCompany);
    console.log('By roundType:', byRound);
    console.log('By year:', byYear);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding Batch 5:', error.message);
    process.exit(1);
  }
};

seedBatch5();
