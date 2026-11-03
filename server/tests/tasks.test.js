import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { Task } from '../src/models/Task.js';

let mongo;
const app = createApp();

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Task.deleteMany({});
});

describe('POST /api/tasks', () => {
  it('creates a task with defaults', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: '  Write tests  ', dueAt: '2026-11-04T10:00:00.000Z' })
      .expect(201);

    expect(res.body).toMatchObject({
      title: 'Write tests',
      description: '',
      priority: null,
      status: 'in_progress',
      completedAt: null,
    });
    expect(res.body.id).toBeDefined();
    expect(res.body._id).toBeUndefined();
  });

  it('requires a title and a due date', async () => {
    const res = await request(app).post('/api/tasks').send({ description: 'no title' }).expect(400);
    expect(res.body.errors).toHaveProperty('title');
    expect(res.body.errors).toHaveProperty('dueAt');
  });

  it('rejects an unknown priority', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'x', dueAt: '2026-11-04T10:00:00.000Z', priority: 'urgent' })
      .expect(400);
    expect(res.body.errors.priority).toMatch(/low, medium or high/);
  });

  it('rejects an invalid date', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'x', dueAt: 'tomorrow-ish' })
      .expect(400);
    expect(res.body.errors.dueAt).toBe('Invalid date');
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('updates fields and tracks completion time', async () => {
    const task = await Task.create({ title: 'Old', dueAt: new Date() });

    const done = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .send({ title: 'New', status: 'completed', priority: 'high' })
      .expect(200);
    expect(done.body).toMatchObject({ title: 'New', status: 'completed', priority: 'high' });
    expect(done.body.completedAt).not.toBeNull();

    const reopened = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .send({ status: 'in_progress', priority: null })
      .expect(200);
    expect(reopened.body.completedAt).toBeNull();
    expect(reopened.body.priority).toBeNull();
  });

  it('ignores fields that are not editable', async () => {
    const task = await Task.create({ title: 'Task', dueAt: new Date() });
    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .send({ createdAt: '2000-01-01T00:00:00.000Z' })
      .expect(200);
    expect(new Date(res.body.createdAt).getFullYear()).not.toBe(2000);
  });

  it('returns 404 for unknown or malformed ids', async () => {
    await request(app).patch(`/api/tasks/${new mongoose.Types.ObjectId()}`).send({}).expect(404);
    await request(app).patch('/api/tasks/not-an-id').send({}).expect(404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes a task', async () => {
    const task = await Task.create({ title: 'Bye', dueAt: new Date() });
    await request(app).delete(`/api/tasks/${task.id}`).expect(204);
    expect(await Task.countDocuments()).toBe(0);
    await request(app).delete(`/api/tasks/${task.id}`).expect(404);
  });
});

describe('GET /api/tasks', () => {
  beforeEach(async () => {
    await Task.create([
      { title: 'Buy cat food', dueAt: '2026-11-03T08:00:00Z' },
      { title: 'Team meeting', description: 'Discuss the cat (food) budget', dueAt: '2026-11-05T08:00:00Z' },
      { title: 'Gym', dueAt: '2026-11-12T08:00:00Z', status: 'completed' },
    ]);
  });

  it('searches title and description, case insensitive', async () => {
    const res = await request(app).get('/api/tasks').query({ search: 'CAT' }).expect(200);
    expect(res.body.map((t) => t.title)).toEqual(['Buy cat food', 'Team meeting']);
  });

  it('treats regex characters in the search literally', async () => {
    const res = await request(app).get('/api/tasks').query({ search: '(food)' }).expect(200);
    expect(res.body).toHaveLength(1);
  });

  it('filters by date range (to is exclusive) and status', async () => {
    const range = await request(app)
      .get('/api/tasks')
      .query({ from: '2026-11-03T00:00:00Z', to: '2026-11-05T08:00:00Z' })
      .expect(200);
    expect(range.body.map((t) => t.title)).toEqual(['Buy cat food']);

    const done = await request(app).get('/api/tasks').query({ status: 'completed' }).expect(200);
    expect(done.body.map((t) => t.title)).toEqual(['Gym']);
  });

  it('validates query params', async () => {
    await request(app).get('/api/tasks').query({ from: 'yesterday' }).expect(400);
    await request(app).get('/api/tasks').query({ status: 'done' }).expect(400);
  });
});

describe('GET /api/tasks/weeks', () => {
  it('groups tasks into Monday-Sunday weeks', async () => {
    await Task.create([
      // Mon 2 Nov 2026 and Sun 8 Nov 2026 fall in the same week
      { title: 'a', dueAt: '2026-11-02T00:30:00Z', status: 'completed' },
      { title: 'b', dueAt: '2026-11-08T22:00:00Z' },
      // next Monday starts a new week
      { title: 'c', dueAt: '2026-11-09T09:00:00Z' },
    ]);

    const res = await request(app).get('/api/tasks/weeks').query({ tz: 'UTC' }).expect(200);
    expect(res.body).toEqual([
      {
        weekStart: '2026-11-02T00:00:00.000Z',
        weekEnd: '2026-11-09T00:00:00.000Z',
        total: 2,
        completed: 1,
        open: 1,
      },
      {
        weekStart: '2026-11-09T00:00:00.000Z',
        weekEnd: '2026-11-16T00:00:00.000Z',
        total: 1,
        completed: 0,
        open: 1,
      },
    ]);
  });

  it('uses the given timezone for week boundaries', async () => {
    // Sunday 8 Nov 20:00 UTC is already Monday 9 Nov 01:30 in India
    await Task.create({ title: 'late', dueAt: '2026-11-08T20:00:00Z' });

    const utc = await request(app).get('/api/tasks/weeks').query({ tz: 'UTC' });
    const ist = await request(app).get('/api/tasks/weeks').query({ tz: 'Asia/Kolkata' });

    expect(utc.body[0].weekStart).toBe('2026-11-02T00:00:00.000Z');
    // Monday 9 Nov 00:00 IST
    expect(ist.body[0].weekStart).toBe('2026-11-08T18:30:00.000Z');
  });

  it('rejects an unknown timezone', async () => {
    await request(app).get('/api/tasks/weeks').query({ tz: 'Mars/Olympus' }).expect(400);
  });
});

describe('CORS', () => {
  it('allows CLIENT_ORIGIN even when it was set with a trailing slash', async () => {
    const original = process.env.CLIENT_ORIGIN;
    process.env.CLIENT_ORIGIN = 'https://todo.example.com/, http://localhost:5173';
    const corsApp = createApp();
    if (original === undefined) delete process.env.CLIENT_ORIGIN;
    else process.env.CLIENT_ORIGIN = original;

    const allowed = await request(corsApp).get('/api/health').set('Origin', 'https://todo.example.com');
    expect(allowed.headers['access-control-allow-origin']).toBe('https://todo.example.com');

    const blocked = await request(corsApp).get('/api/health').set('Origin', 'https://evil.example.com');
    expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
  });
});
