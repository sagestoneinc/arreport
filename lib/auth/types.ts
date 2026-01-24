/**
 * User types for authentication
 */

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: string;
}

export interface Session {
  user: User;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  ok: boolean;
  error?: string;
  user?: User;
}
