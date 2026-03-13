import  prisma  from '../../config/prisma.config.js';

export const getAllLogs = async () => {
  return await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  });
};

export const getUserLogs = async (userId: string) => {
  return await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  });
};