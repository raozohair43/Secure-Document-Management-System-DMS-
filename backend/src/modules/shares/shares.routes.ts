import { Router } from 'express';
import { createLink, getSharedDoc, deleteLink } from './shares.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { checkDocumentAccess } from '../../middlewares/permission.middleware.js';
import { downloadSharedDoc } from './shares.controller.js';

const router = Router();

// Create link (Requires Auth + Document Access) - using :id for documentId
router.post('/documents/:id/share', authenticate, checkDocumentAccess, createLink);

// Public access (No Auth required!)
router.get('/share/:token', getSharedDoc);
router.get('/share/:token/download', downloadSharedDoc);

// Revoke link (Requires Auth) - using :id for shareLinkId
router.delete('/share/:id', authenticate, deleteLink);

export default router;