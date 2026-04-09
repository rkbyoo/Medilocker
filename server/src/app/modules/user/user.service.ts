import { UserModel } from './user.model';
import { DatabaseUser } from '../../types/global';

export class UserService {
  static async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    return await UserModel.findByEmail(email);
  }

  static async getUserByPhone(phone: string): Promise<DatabaseUser | null> {
    return await UserModel.findByPhone(phone);
  }

  static async getUserById(userId: string): Promise<DatabaseUser | null> {
    return await UserModel.findById(userId);
  }

  static async createUser(userData: {
    full_name: string;
    email: string;
    phone?: string;
    password_hash: string;
    role: string;
  }): Promise<DatabaseUser> {
    return await UserModel.create(userData);
  }

  static async updateUserLastLogin(userId: string): Promise<void> {
    await UserModel.updateLastLogin(userId);
  }

  static sanitizeUser(user: DatabaseUser): Omit<DatabaseUser, 'password_hash'> {
    const { password_hash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}