import  prisma  from '../../config/prisma.config.js';

export const uploadNewDocument = async (userId: string, file: Express.Multer.File, data: any) => {
  // Using a transaction ensures that if one of these fails, NONE of them save.
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the base document
    const document = await tx.document.create({
      data: {
        title: data.title,
        description: data.description,
        ownerId: userId,
      },
    });

    // 2. Create the first version record
    const version = await tx.documentVersion.create({
      data: {
        documentId: document.id,
        filePath: file.path, // The local path saved by Multer
        versionNumber: 1,
        uploadedBy: userId,
        fileSize: file.size,
        fileType: file.mimetype,
      },
    });

    // 3. Log the action
    await tx.auditLog.create({
      data: {
        userId,
        action: 'UPLOAD_DOCUMENT',
        entityType: 'document',
        entityId: document.id,
      },
    });

    return { document, version };
  });

  return result;
};

export const getUserDocuments = async (userId: string) => {
  // Fetch documents the user owns OR has explicit permission to view
  return await prisma.document.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { permissions: { some: { userId: userId } } }
      ],
      isArchived: false,
    },
    include: { 
      versions: { select: { versionNumber: true, uploadedAt: true }, orderBy: { versionNumber: 'desc' }, take: 1 },
      owner: { select: { name: true, email: true } } // 👈 ADDED THIS to fix Dashboard & List crashes!
    },
  });
};

export const getDocumentDetails = async (documentId: string) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { 
      versions: { orderBy: { versionNumber: 'desc' } }, 
      owner: { select: { name: true, email: true } },
      permissions: { include: { user: { select: { name: true, email: true } } } } // 👈 ADDED THIS so your new Permissions tab works!
    },
  });
  if (!document) throw { statusCode: 404, message: 'Document not found' };
  return document;
};

export const archiveDocument = async (documentId: string, userId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const doc = await tx.document.update({
      where: { id: documentId },
      data: { isArchived: true },
    });

    await tx.auditLog.create({
      data: { userId, action: 'ARCHIVE_DOCUMENT', entityType: 'document', entityId: documentId },
    });

    return doc;
  });
  return result;
};



export const getDocumentVersions = async (documentId: string) => {
  return await prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: { versionNumber: 'desc' },
    include: { uploader: { select: { name: true, email: true } } },
  });
};

export const uploadNewVersion = async (documentId: string, userId: string, file: Express.Multer.File) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Find the latest version number
    const latestVersion = await tx.documentVersion.findFirst({
      where: { documentId },
      orderBy: { versionNumber: 'desc' },
    });
    
    const newVersionNumber = (latestVersion?.versionNumber || 0) + 1;

    // 2. Create the new version record
    const newVersion = await tx.documentVersion.create({
      data: {
        documentId,
        filePath: file.path,
        versionNumber: newVersionNumber,
        uploadedBy: userId,
        fileSize: file.size,
        fileType: file.mimetype,
      },
    });

    // 3. Update the document's updatedAt timestamp
    await tx.document.update({
      where: { id: documentId },
      data: { updatedAt: new Date() },
    });

    // 4. Log the action
    await tx.auditLog.create({
      data: { userId, action: 'UPLOAD_VERSION', entityType: 'document', entityId: documentId },
    });

    return newVersion;
  });
};

export const getDownloadPath = async (versionId: string, userId: string, userRole: string) => {
  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
    include: { document: { include: { permissions: true } } },
  });

  if (!version) throw { statusCode: 404, message: 'Version not found' };

  // Strict Security Check: Owner, Admin, or Explicitly Shared
  const isOwner = version.document.ownerId === userId;
  const isAdmin = userRole === 'Admin';

  //find their specific permission
  const hasPermission = version.document.permissions.find(p => p.userId === userId);
  const canDownload = hasPermission && (hasPermission.permissionType === 'view' || hasPermission.permissionType === 'edit' || hasPermission.permissionType === 'download');

  if (!isOwner && !isAdmin && !canDownload) {
    throw { statusCode: 403, message: 'Forbidden: You do not have permission to download this file.' };
  }

  // Log the download
  await prisma.auditLog.create({
    data: { userId, action: 'DOWNLOAD_VERSION', entityType: 'document', entityId: version.documentId },
  });

  return version.filePath;
};

export const searchDocuments = async (userId: string, query: any) => {
  const { title, owner, fileType, dateFrom, dateTo } = query;

  // Build a dynamic where clause based on the provided query parameters
  const whereClause: any = {
    isArchived: false,
    OR: [
      { ownerId: userId },
      { permissions: { some: { userId: userId } } } // Ensure they only search what they can access
    ],
  };

  if (title) whereClause.title = { contains: title, mode: 'insensitive' };
  if (owner) whereClause.ownerId = owner;
  if (dateFrom || dateTo) {
    whereClause.createdAt = {};
    if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
    if (dateTo) whereClause.createdAt.lte = new Date(dateTo);
  }

  // To filter by fileType, we need to check the related versions
  if (fileType) {
    whereClause.versions = {
      some: { fileType: { contains: fileType, mode: 'insensitive' } }
    };
  }

  return await prisma.document.findMany({
    where: whereClause,
    include: {
      owner: { select: { name: true, email: true } },
      versions: { select: { fileType: true, versionNumber: true }, orderBy: { versionNumber: 'desc' }, take: 1 }
    },
  });
};

export const getViewPath = async (versionId: string, userId: string, userRole: string) => {
  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
    include: { document: { include: { permissions: true } } },
  });

  if (!version) throw { statusCode: 404, message: 'Version not found' };

  const isOwner = version.document.ownerId === userId;
  const isAdmin = userRole === 'Admin';
  const userPermission = version.document.permissions.find(p => p.userId === userId);
  
  // Notice we allow 'view', 'download', AND 'edit' here
  const canView = userPermission && ['view', 'download', 'edit'].includes(userPermission.permissionType);

  if (!isOwner && !isAdmin && !canView) {
    throw { statusCode: 403, message: 'Forbidden: You do not have permission to view this file.' };
  }

  return version.filePath;
};