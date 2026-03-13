import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.registerUser(validatedData);
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error); // Passes to global error handler
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(validatedData);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // req.user is guaranteed to exist here because the auth middleware verified the token
    const userId = req.user!.userId; 
    const user = await authService.getUserById(userId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};