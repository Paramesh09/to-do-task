// Fills the database with a few weeks of sample tasks so the UI has something to show.
// Usage: npm run seed  (add --keep to skip clearing existing tasks)
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Task } from '../models/Task.js';

const DAY = 24 * 60 * 60 * 1000;

function at(dayOffset, hours, minutes = 0) {
  const date = new Date(Date.now() + dayOffset * DAY);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

const samples = [
  { title: 'Finishing wireframe', description: 'Onboarding + home screen for the mobile app', dueAt: at(-8, 11), priority: 'high', status: 'completed' },
  { title: 'Pay electricity bill', dueAt: at(-6, 18), priority: 'medium', status: 'completed' },
  { title: 'Call the bank about the card', dueAt: at(-5, 15, 30), priority: 'low' },
  { title: 'Meeting with team', description: 'Sprint planning, bring the API notes', dueAt: at(0, 10), priority: 'high' },
  { title: 'Buy a cat food', dueAt: at(0, 19), priority: 'low', status: 'completed' },
  { title: 'Finishing daily commission', dueAt: at(1, 17), priority: 'medium' },
  { title: 'Review pull requests', description: 'Search + weekly summary PRs', dueAt: at(2, 14), priority: 'medium' },
  { title: 'Gym', dueAt: at(3, 7) },
  { title: 'Doing homework', description: 'Chapter 4 exercises', dueAt: at(9, 20), priority: 'medium' },
  { title: 'Dentist appointment', dueAt: at(11, 9, 30), priority: 'high' },
];

await connectDB(process.env.MONGODB_URI);

if (!process.argv.includes('--keep')) {
  await Task.deleteMany({});
}
await Task.create(samples);
console.log(`Inserted ${samples.length} tasks`);

await mongoose.disconnect();
