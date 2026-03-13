import app from './app.js';
import { env } from './config/env.config.js';
import { logger } from './utils/logger.util.js';
import prisma from './config/prisma.config.js';

const PORT = env.PORT;

const startServer = async () => {
  try {
    
    await prisma.$connect(); 
    logger.info('📦 Database connected successfully!');
    
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error( error as Error,'❌ Database connection failed:');
    process.exit(1); // Kill the server if the DB is down
  }
};

startServer();