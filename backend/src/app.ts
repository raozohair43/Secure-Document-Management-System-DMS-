import express,{ Application } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware.js';
import { logger } from './utils/logger.util.js';

//
import authRoutes from './modules/auth/auth.routes.js';
import documentRoutes from './modules/documents/documents.routes.js'
import shareRoutes from './modules/shares/shares.routes.js'
import permissionRoutes from './modules/permissions/permissions.routes.js'
import logsRoutes from './modules/logs/logs.routes.js'
import usersRoutes from './modules/users/users.routes.js'

const app: Application = express();

// Global Middlewares
app.use(express.json());
app.use(cors());

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running securely! 🚀' });
});

// TODO: Mount Module Routes Here later
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', shareRoutes);
app.use('/api', permissionRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/users', usersRoutes);

// Global Error Handler (Must be the last middleware)
app.use(errorHandler);

export default app;