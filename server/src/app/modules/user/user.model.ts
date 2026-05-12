import { prisma } from '../../config/prisma';
import { DatabaseUser } from '../../types/global';
import { UserRole } from '../../generated/prisma';

export class UserModel {
  static async findByEmail(email: string): Promise<DatabaseUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user as DatabaseUser | null;
  }

  static async findByPhone(phone: string): Promise<DatabaseUser | null> {
    const user = await prisma.user.findFirst({
      where: { phone },
    });
    return user as DatabaseUser | null;
  }

  static async findById(userId: string): Promise<DatabaseUser | null> {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });
    return user as DatabaseUser | null;
  }

  static async create(userData: {
    full_name: string;
    email: string;
    phone?: string;
    password_hash: string;
    role: string;
  }): Promise<DatabaseUser> {
    const user = await prisma.user.create({
      data: {
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        password_hash: userData.password_hash,
        role: userData.role as UserRole,
      },
    });
    return user as DatabaseUser;
  }

  static async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { user_id: userId },
      data: { updated_at: new Date() },
    });
  }
}