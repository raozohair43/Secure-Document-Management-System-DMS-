import prisma from '../../config/prisma.config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.config.js';

export const registerUser = async (data: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw { statusCode: 400, message: 'Email already in use' };

  // Get or create the requested role
  let role = await prisma.role.findUnique({ where: { roleName: data.roleName } });
  if (!role) {
    role = await prisma.role.create({ data: { roleName: data.roleName, description: `System ${data.roleName}` } });
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      roleId: role.id,
    },
    select: { id: true, name: true, email: true, role: true }, // Don't return password
  });

  return user;
};

export const loginUser = async (data: any) => {
  const user = await prisma.user.findUnique({ 
    where: { email: data.email },
    include: { role: true }
  });
  if (!user) throw { statusCode: 401, message: 'Invalid credentials' };

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw { statusCode: 401, message: 'Invalid credentials' };

  const token = jwt.sign(
    { userId: user.id, role: user.role.roleName },
    env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role.roleName } };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true, role: { select: { roleName: true } } }, // Never return the password!
  });

  if (!user) throw { statusCode: 404, message: 'User not found' };
  return user;
};