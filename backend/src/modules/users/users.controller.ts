import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service.js';
import { createUserSchema, updateUserSchema } from './users.validation.js';

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await usersService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) { next(error); }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getUserById(req.params.id as string);
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
};

export const addUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const user = await usersService.createUser(validatedData);
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    next(error);
  }
};

export const editUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);
    const user = await usersService.updateUser(req.params.id as string, validatedData);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    next(error);
  }
};

export const removeUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await usersService.deleteUser(req.params.id as string);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) { next(error); }
};