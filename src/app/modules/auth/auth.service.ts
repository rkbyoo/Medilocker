import { UserService } from '../user/user.service';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { pool } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';
import { RegisterRequest, LoginRequest } from './auth.dto';
import { DatabaseUser, RefreshToken } from '../../types/global';

export class AuthService {
  static async register(userData: RegisterRequest): Promise<DatabaseUser> {
    // Check if user already exists
    const existingUser = await UserService.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const password_hash = await hashPassword(userData.password);

    // Create user
    const newUser = await UserService.createUser({
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone,
      password_hash,
      role: userData.role,
    });

    return newUser;
  }

  static async login(credentials: LoginRequest): Promise<{
    user: Omit<DatabaseUser, 'password_hash'>;
    accessToken: string;
    refreshToken: string;
  }> {
    // Find user by email
    const user = await UserService.getUserByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(credentials.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ user_id: user.user_id });

    // Store refresh token in database
    await this.storeRefreshToken(user.user_id, refreshToken);

    // Update last login
    await UserService.updateUserLastLogin(user.user_id);

    const sanitizedUser = UserService.sanitizeUser(user);

    return {
      user: sanitizedUser,
      accessToken,
      refreshToken,
    };
  }

  static async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // Check if refresh token exists in database and is not expired
    const storedToken = await this.getRefreshToken(refreshToken);
    if (!storedToken || storedToken.expires_at < new Date()) {
      throw new Error('Refresh token expired or invalid');
    }

    // Get user
    const user = await UserService.getUserById(decoded.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({ user_id: user.user_id });

    // Replace old refresh token with new one
    await this.replaceRefreshToken(refreshToken, newRefreshToken, user.user_id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(refreshToken: string): Promise<void> {
    await this.deleteRefreshToken(refreshToken);
  }

  private static async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const tokenId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await pool.query(
      `INSERT INTO refresh_tokens (token_id, user_id, refresh_token, expires_at, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [tokenId, userId, refreshToken, expiresAt]
    );
  }

  private static async getRefreshToken(refreshToken: string): Promise<RefreshToken | null> {
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE refresh_token = $1',
      [refreshToken]
    );
    return result.rows[0] || null;
  }

  private static async replaceRefreshToken(
    oldToken: string,
    newToken: string,
    userId: string
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await pool.query(
      `UPDATE refresh_tokens 
       SET refresh_token = $1, expires_at = $2, created_at = NOW()
       WHERE refresh_token = $3 AND user_id = $4`,
      [newToken, expiresAt, oldToken, userId]
    );
  }

  private static async deleteRefreshToken(refreshToken: string): Promise<void> {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE refresh_token = $1',
      [refreshToken]
    );
  }
}