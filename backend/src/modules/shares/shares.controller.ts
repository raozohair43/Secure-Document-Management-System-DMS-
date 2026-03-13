import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import * as sharesService from './shares.service.js';
import { createShareLinkSchema } from './shares.validation.js';

export const createLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createShareLinkSchema.parse(req.body);
    const result = await sharesService.generateShareLink(req.params.id as string, req.user!.userId, validatedData);
    
    // Return the full URL for the frontend to easily copy
    const fullUrl = `${req.protocol}://${req.get('host')}/api/share/${result.token}`;
    
    res.status(201).json({ success: true, data: { ...result, url: fullUrl } });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    next(error);
  }
};

export const getSharedDoc = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await sharesService.accessSharedDocument(req.params.token as string);
    res.status(200).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

export const deleteLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await sharesService.revokeShareLink(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true, message: 'Share link revoked successfully' });
  } catch (error) {
    next(error);
  }
};

export const downloadSharedDoc = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await sharesService.accessSharedDocument(req.params.token as string, true);
    // Assuming versions[0] holds the latest file path. Adjust if your logic differs.
    const latestVersion = document.versions[0]; 
    
    if (!latestVersion || !latestVersion.filePath) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }
    
    res.download(latestVersion.filePath, `${document.title}.${latestVersion.fileType.split('/')[1] || 'bin'}`);
  } catch (error) {
    next(error);
  }
};