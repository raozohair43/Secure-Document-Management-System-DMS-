import { z } from 'zod';

export const uploadMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});