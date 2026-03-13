import { z } from 'zod';

export const createShareLinkSchema = z.object({
  expiresAt: z.string().datetime({ message: 'Must be a valid ISO datetime string' }),
  accessLimit: z.number().int().positive().optional(),
});