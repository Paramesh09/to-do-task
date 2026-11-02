import { STATUSES, Task } from '../models/Task.js';
import { HttpError } from '../utils/HttpError.js';

const EDITABLE_FIELDS = ['title', 'description', 'dueAt', 'priority', 'status'];

function pickEditable(body = {}) {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseDate(value, name) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `"${name}" is not a valid date`);
  }
  return date;
}

function isValidTimeZone(tz) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

async function findTaskOr404(id) {
  const task = await Task.findById(id);
  if (!task) throw new HttpError(404, 'Task not found');
  return task;
}

// GET /api/tasks?search=&from=&to=&status=
export async function listTasks(req, res) {
  const { search, from, to, status } = req.query;
  const filter = {};

  if (typeof search === 'string' && search.trim()) {
    const pattern = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  if (from || to) {
    filter.dueAt = {};
    if (from) filter.dueAt.$gte = parseDate(from, 'from');
    if (to) filter.dueAt.$lt = parseDate(to, 'to');
  }

  if (status) {
    if (!STATUSES.includes(status)) throw new HttpError(400, `Unknown status "${status}"`);
    filter.status = status;
  }

  const tasks = await Task.find(filter).sort({ dueAt: 1, createdAt: 1 });
  res.json(tasks);
}

// GET /api/tasks/weeks?tz=Asia/Kolkata
// Groups tasks into Monday-Sunday weeks in the caller's timezone.
export async function getWeeklySummary(req, res) {
  const tz = req.query.tz || 'UTC';
  if (!isValidTimeZone(tz)) throw new HttpError(400, `Unknown timezone "${tz}"`);

  const weeks = await Task.aggregate([
    {
      $group: {
        _id: {
          $dateTrunc: { date: '$dueAt', unit: 'week', startOfWeek: 'monday', timezone: tz },
        },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        weekStart: '$_id',
        weekEnd: { $dateAdd: { startDate: '$_id', unit: 'week', amount: 1, timezone: tz } },
        total: 1,
        completed: 1,
        open: { $subtract: ['$total', '$completed'] },
      },
    },
  ]);

  res.json(weeks);
}

export async function getTask(req, res) {
  const task = await findTaskOr404(req.params.id);
  res.json(task);
}

export async function createTask(req, res) {
  const task = await Task.create(pickEditable(req.body));
  res.status(201).json(task);
}

export async function updateTask(req, res) {
  const task = await findTaskOr404(req.params.id);
  task.set(pickEditable(req.body));
  await task.save();
  res.json(task);
}

export async function deleteTask(req, res) {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new HttpError(404, 'Task not found');
  res.status(204).end();
}
