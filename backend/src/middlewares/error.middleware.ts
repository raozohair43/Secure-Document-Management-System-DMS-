import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.util.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`[Error] ${err.message || 'Internal Server Error'}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};