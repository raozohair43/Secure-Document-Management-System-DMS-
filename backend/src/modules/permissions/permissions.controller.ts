import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import * as permissionsService from './permissions.service.js';
import { grantPermissionSchema } from './permissions.validation.js';

export const addPermission = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = grantPermissionSchema.parse(req.body);
    const result = await permissionsService.grantPermission(
      req.params.id as string, 
      req.user!.userId, 
      validatedData.userId, 
      validatedData.permissionType
    );
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    next(error);
  }
};

export const listPermissions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const permissions = await permissionsService.getDocumentPermissions(req.params.id as string);
    res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    next(error);
  }
};

export const removePermission = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await permissionsService.revokePermission(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true, message: 'Permission revoked successfully' });
  } catch (error) {
    next(error);
  }
};