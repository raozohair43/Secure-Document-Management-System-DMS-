import { z } from 'zod';

export const grantPermissionSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
  permissionType: z.enum(['view', 'edit', 'download'] as const, {
    message: 'Permission must be view, edit, or download'
  }),
});