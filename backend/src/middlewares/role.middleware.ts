import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';

// Pass an array of allowed roles, e.g., authorizeRoles('Admin', 'Manager')
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // req.user is populated by the auth.middleware
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: You do not have the required permissions.' 
      });
    }
    next();
  };
};