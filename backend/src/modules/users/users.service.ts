import  prisma  from '../../config/prisma.config.js';
import bcrypt from 'bcrypt';

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true, role: { select: { roleName: true } } },
  });
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true, role: { select: { roleName: true } } },
  });
  if (!user) throw { statusCode: 404, message: 'User not found' };
  return user;
};

export const createUser = async (data: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw { statusCode: 400, message: 'Email already in use' };

  let role = await prisma.role.findUnique({ where: { roleName: data.roleName } });
  if (!role) {
    role = await prisma.role.create({ data: { roleName: data.roleName, description: `System ${data.roleName}` } });
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await prisma.user.create({
    data: { name: data.name, email: data.email, password: hashedPassword, roleId: role.id },
    select: { id: true, name: true, email: true, role: { select: { roleName: true } } },
  });
};

export const updateUser = async (userId: string, data: any) => {
  const updateData: any = { ...data };

  if (data.roleName) {
    let role = await prisma.role.findUnique({ where: { roleName: data.roleName } });
    if (!role) role = await prisma.role.create({ data: { roleName: data.roleName, description: `${data.roleName}` } });
    updateData.roleId = role.id;
    delete updateData.roleName; // Remove from object before passing to Prisma
  }

  return await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, role: { select: { roleName: true } } },
  });
};

export const deleteUser = async (userId: string) => {
  // In a real SaaS, you usually "archive" users or reassign their documents before hard deleting.
  // For this portfolio project, we will execute a standard delete.
  return await prisma.user.delete({
    where: { id: userId },
    select: { id: true, email: true },
  });
};