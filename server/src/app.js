import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import taskRoutes from './routes/task.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

   const allowedOrigins = process.env.CLIENT_ORIGIN?.split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  app.use(helmet());
  app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
  app.use(express.json());
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/tasks', taskRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
