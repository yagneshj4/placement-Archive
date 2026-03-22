import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { connectDB } from '../config/db.js';
import { User, Experience } from '../models/index.js';
import batch2 from './batch2Data.js';

function randomUserId(userIds) {
  return userIds[Math.floor(Math.random() * userIds.length)];
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const k = item[key];
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function expKey(exp) {
  return `${exp.company}|${exp.role}|${exp.year}|${exp.roundType}|${exp.narrative}`;
}

async function seedBatch2() {
  try {
    await connectDB();

    let users = await User.find({}, { _id: 1 }).lean();
    if (!users.length) {
      await User.insertMany([
        {
          name: 'Batch Seeder Student 1',
          email: 'batch2.student1@vrsec.ac.in',
          passwordHash: 'Student@1234',
          role: 'student',
          college: 'VR Siddhartha Engineering College',
          graduationYear: 2024,
          isVerified: true,
        },
        {
          name: 'Batch Seeder Student 2',
          email: 'batch2.student2@vrsec.ac.in',
          passwordHash: 'Student@1234',
          role: 'student',
          college: 'VR Siddhartha Engineering College',
          graduationYear: 2025,
          isVerified: true,
        },
      ]);
      users = await User.find({}, { _id: 1 }).lean();
    }

    const userIds = users.map((u) => u._id);

    const readyBatch = batch2.map((exp) => ({
      ...exp,
      submittedBy: randomUserId(userIds),
    }));

    const existing = await Experience.find(
      {},
      { company: 1, role: 1, year: 1, roundType: 1, narrative: 1 }
    ).lean();
    const existingKeys = new Set(existing.map(expKey));
    const toInsert = readyBatch.filter((exp) => !existingKeys.has(expKey(exp)));
    const inserted = toInsert.length ? await Experience.insertMany(toInsert) : [];
    const totalDocs = await Experience.countDocuments();

    console.log('Batch 2 processed successfully.');
    console.log(`Inserted now: ${inserted.length}`);
    console.log(`Total experiences in DB: ${totalDocs}`);
    console.log('By company:', countBy(inserted, 'company'));
    console.log('By roundType:', countBy(inserted, 'roundType'));
    console.log('By year:', countBy(inserted, 'year'));
    console.log('Next: run npm run embed-seed to process pending embeddings.');

    process.exit(0);
  } catch (error) {
    console.error('Batch 2 seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedBatch2();
