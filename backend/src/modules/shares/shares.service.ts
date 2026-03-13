import  prisma  from '../../config/prisma.config.js';
import crypto from 'crypto';

export const generateShareLink = async (documentId: string, userId: string, data: any) => {
  const token = crypto.randomBytes(32).toString('hex');

  const shareLink = await prisma.shareLink.create({
    data: {
      documentId,
      token,
      expiresAt: new Date(data.expiresAt),
      accessLimit: data.accessLimit,
      createdBy: userId,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: { userId, action: 'CREATE_SHARE_LINK', entityType: 'share', entityId: shareLink.id },
  });

  return shareLink;
};

export const accessSharedDocument = async (token: string, isDownload = false) => {
  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: { document: { include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } } } },
  });

  if (!link) throw { statusCode: 404, message: 'Invalid share link' };

  // Check Expiration
  if (new Date() > link.expiresAt) {
    throw { statusCode: 410, message: 'This share link has expired' };
  }

  // Check Access Limits
  if (link.accessLimit && link.accessCount >= link.accessLimit) {
    throw { statusCode: 403, message: 'This share link has reached its maximum access limit' };
  }

  // Increment access count
  // await prisma.shareLink.update({
  //   where: { id: link.id },
  //   data: { accessCount: link.accessCount + 1 },
  // });

  if(!isDownload){
    await prisma.shareLink.update({
      where: {id: link.id},
      data: {accessCount: link.accessCount + 1},
    })
  }
  
  return link.document;
};

export const revokeShareLink = async (linkId: string, userId: string) => {
  const link = await prisma.shareLink.delete({
    where: { id: linkId },
  });

  await prisma.auditLog.create({
    data: { userId, action: 'REVOKE_SHARE_LINK', entityType: 'share', entityId: linkId },
  });

  return link;
};