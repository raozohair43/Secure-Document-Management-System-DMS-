import  prisma  from '../../config/prisma.config.js';

export const grantPermission = async (documentId: string, granterId: string, granteeId: string, permissionType: string) => {
  // 1. Verify the user we are sharing with actually exists
  const grantee = await prisma.user.findUnique({ where: { id: granteeId } });
  if (!grantee) throw { statusCode: 404, message: 'User to share with not found' };

  // 2. Prevent duplicate permissions
  const existingPermission = await prisma.documentPermission.findFirst({
    where: { documentId, userId: granteeId },
  });
  if (existingPermission) throw { statusCode: 400, message: 'User already has access to this document' };

  // 3. Grant access
  const permission = await prisma.documentPermission.create({
    data: {
      documentId,
      userId: granteeId,
      permissionType,
    },
  });

  // 4. Log the action
  await prisma.auditLog.create({
    data: { userId: granterId, action: `GRANT_${permissionType.toUpperCase()}`, entityType: 'document', entityId: documentId },
  });

  return permission;
};

export const getDocumentPermissions = async (documentId: string) => {
  return await prisma.documentPermission.findMany({
    where: { documentId },
    include: { user: { select: { name: true, email: true } } },
  });
};

export const revokePermission = async (permissionId: string, revokerId: string) => {
  const permission = await prisma.documentPermission.delete({
    where: { id: permissionId },
  });

  await prisma.auditLog.create({
    data: { userId: revokerId, action: 'REVOKE_PERMISSION', entityType: 'document', entityId: permission.documentId },
  });

  return permission;
};