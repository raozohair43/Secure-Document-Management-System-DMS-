import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';
import { string } from 'zod';

// Extend the Express Request type so TypeScript knows req.user exists
export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Malformed token.' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
    req.user = decoded; // Attach the user payload to the request object
    next(); // Pass control to the next middleware or controller
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};