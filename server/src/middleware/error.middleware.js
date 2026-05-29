import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Resource not found' });
  }

  if (req.log) req.log.error({ err }, 'Unhandled error');
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
}
