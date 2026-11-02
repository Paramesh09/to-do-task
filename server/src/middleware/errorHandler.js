import mongoose from 'mongoose';
import { HttpError } from '../utils/HttpError.js';

export function notFound(req, _res, next) {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = {};
    for (const [field, issue] of Object.entries(err.errors)) {
      if (issue.name === 'CastError') {
        errors[field] = /date/i.test(issue.kind) ? 'Invalid date' : `Invalid value for ${field}`;
      } else {
        errors[field] = issue.message;
      }
    }
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  if (err instanceof mongoose.Error.CastError && err.path === '_id') {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON body' });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 ? 'Something went wrong on our side' : err.message,
    ...(err.details && { errors: err.details }),
  });
}
