import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Get your DB URL from the environment
const connectionString = process.env.DATABASE_URL as string;

// Initialize the PostgreSQL connection pool
const pool = new Pool({ connectionString });

// Pass the pool to the Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with the required adapter
const prisma = new PrismaClient({ adapter });

export default prisma;