import { pool } from '../../config/database';
import { DatabaseUser } from '../../types/global';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  static async findByEmail(email: string): Promise<DatabaseUser | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(userId: string): Promise<DatabaseUser | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  static async create(userData: {
    full_name: string;
    email: string;
    phone?: string;
    password_hash: string;
    role: string;
  }): Promise<DatabaseUser> {
    const userId = uuidv4();
    const result = await pool.query(
      `INSERT INTO users (user_id, full_name, email, phone, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [userId, userData.full_name, userData.email, userData.phone, userData.password_hash, userData.role]
    );
    return result.rows[0];
  }

  static async updateLastLogin(userId: string): Promise<void> {
    await pool.query(
      'UPDATE users SET updated_at = NOW() WHERE user_id = $1',
      [userId]
    );
  }
}