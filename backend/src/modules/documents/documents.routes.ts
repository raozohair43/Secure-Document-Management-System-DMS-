import { Router } from 'express';
import { uploadDocument, getAllDocuments, getDocumentById, deleteDocument, getVersions, uploadVersion, downloadVersion, searchDocs } from './documents.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';
import { checkDocumentAccess } from '../../middlewares/permission.middleware.js';
import { viewVersion } from './documents.controller.js';

const router = Router();

// 1. Authenticate -> 2. Parse File -> 3. Run Controller
router.post('/upload', authenticate, upload.single('file'), uploadDocument);
router.get('/', authenticate, getAllDocuments);

router.get('/search', authenticate, searchDocs);

// 1. Authenticate -> 2. Check if user is owner/shared -> 3. Run Controller
router.get('/:id', authenticate, checkDocumentAccess, getDocumentById);
router.delete('/:id', authenticate, checkDocumentAccess, deleteDocument);

// history
router.get('/:id/versions', authenticate, checkDocumentAccess, getVersions);

// upload new version
router.post('/:id/versions', authenticate, checkDocumentAccess, upload.single('file'), uploadVersion);

// download specific version
router.get('/versions/:id/download', authenticate, downloadVersion);
router.get('/versions/:id/view', authenticate, viewVersion);


export default router;