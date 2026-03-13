import { Router } from 'express';
import { getLogs, getLogsByUserId } from './logs.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

const router = Router();

// Protect these routes so ONLY Admins can view the enterprise audit logs
router.use(authenticate, authorizeRoles('Admin'));

router.get('/', getLogs);
router.get('/:userId', getLogsByUserId);

export default router;