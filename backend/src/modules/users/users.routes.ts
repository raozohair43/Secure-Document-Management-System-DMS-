import { Router } from 'express';
import { listUsers, getUser, addUser, editUser, removeUser } from './users.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

const router = Router();

// Secure ALL routes in this file
router.use(authenticate, authorizeRoles('Admin'));

router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', addUser);
router.patch('/:id', editUser);
router.delete('/:id', removeUser);

export default router;