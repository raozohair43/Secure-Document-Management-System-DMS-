import { Request, Response, NextFunction } from 'express';
import * as logsService from './logs.service.js';

export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await logsService.getAllLogs();
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export const getLogsByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await logsService.getUserLogs(req.params.userId as string);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};