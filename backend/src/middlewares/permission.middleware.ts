import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import prisma  from '../config/prisma.config.js';

export const checkDocumentAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const documentId = req.params.id;

    const document = await prisma.document.findUnique({
      where: { id: documentId as string},
      include: { permissions: true } // Fetch shared permissions alongside the document
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // 1. Allow if the user is the Owner
    if (document.ownerId === userId) return next();

    // 2. Allow if the user is an Admin
    if (req.user!.role === 'Admin') return next();

    // 3. Allow if the user has been explicitly granted permission
    const hasPermission = document.permissions.find(p => p.userId === userId);
    if (hasPermission) {
      if (req.path.includes('/share') && hasPermission.permissionType !== 'edit') {
        return res.status(403).json({ success: false, message: 'Only Owners or Editors can create share links.' });
      }
      return next();
    }

    // If none of the above, deny access
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: You do not have access to view or modify this document.' 
    });
  } catch (error) {
    next(error); // Pass DB errors to global error handler
  }
};