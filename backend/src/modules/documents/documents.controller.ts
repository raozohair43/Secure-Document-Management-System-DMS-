import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import * as documentService from './documents.service.js';
import { uploadMetadataSchema } from './documents.validation.js';
import path from 'path';

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw { statusCode: 400, message: 'No file uploaded' };

    const validatedData = uploadMetadataSchema.parse(req.body);
    const userId = req.user!.userId;

    const result = await documentService.uploadNewDocument(userId, req.file, validatedData);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    next(error);
  }
};

export const getAllDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const documents = await documentService.getUserDocuments(req.user!.userId);
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const document = await documentService.getDocumentDetails(req.params.id as string);
    res.status(200).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await documentService.archiveDocument(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true, message: 'Document archived successfully' });
  } catch (error) {
    next(error);
  }
};

export const getVersions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const versions = await documentService.getDocumentVersions(req.params.id as string);
    res.status(200).json({ success: true, data: versions });
  } catch (error) {
    next(error);
  }
};

export const uploadVersion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw { statusCode: 400, message: 'No file uploaded' };

    const result = await documentService.uploadNewVersion(req.params.id as string, req.user!.userId, req.file);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const downloadVersion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filePath = await documentService.getDownloadPath(req.params.id as string, req.user!.userId, req.user!.role);
    
    // Express helper to transfer the file as an attachment
    res.download(filePath, (err) => {
      if (err) {
        next({ statusCode: 500, message: 'Error downloading file' });
      }
    });
  } catch (error) {
    next(error);
  }
};

export const searchDocs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const documents = await documentService.searchDocuments(req.user!.userId, req.query);
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

export const viewVersion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filePath = await documentService.getViewPath(req.params.id as string, req.user!.userId, req.user!.role);
    
    // sendFile requires an absolute path to render inline in the browser
    res.sendFile(path.resolve(filePath)); 
  } catch (error) {
    next(error);
  }
};