import { Router } from 'express';
import { addPermission, listPermissions, removePermission } from './permissions.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { checkDocumentAccess } from '../../middlewares/permission.middleware.js';

const router = Router();

// :id here refers to documentId
router.post('/documents/:id/permissions', authenticate, checkDocumentAccess, addPermission);
router.get('/documents/:id/permissions', authenticate, checkDocumentAccess, listPermissions);

// :id here refers to the permissionId itself
router.delete('/permissions/:id', authenticate, removePermission);

export default router;