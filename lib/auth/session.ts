/**
 * Simple session-based authentication
 * Uses environment variables for user credentials (simple, ops-friendly)
 * 
 * Dependencies:
 * - uuid: For generating secure session IDs (already in package.json)
 * 
 * Note: This implementation uses in-memory session storage for simplicity.
 * For production deployments with multiple instances, consider:
 * - Redis for session storage
 * - Database-backed sessions
 * - JWT tokens (stateless)
 */

import { User, Session, AuthResponse } from './types';
import { v4 as uuidv4 } from 'uuid';

// Session duration: 24 hours
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// In-memory session store
// Note: Sessions are lost on server restart and don't scale across instances.
// For production multi-instance deployments, implement persistent storage.
const sessions = new Map<string, Session>();

/**
 * Get configured users from environment variables
 * Format: AUTH_USERS=email1:password1:name1:role1,email2:password2:name2:role2
 * Example: AUTH_USERS=admin@example.com:secretpass:Admin User:admin
 */
function getConfiguredUsers(): Array<{ email: string; password: string; name: string; role: 'admin' | 'user' }> {
  const usersEnv = process.env.AUTH_USERS;
  if (!usersEnv) {
    // Default user for development
    return [
      { email: 'admin@arreport.com', password: 'admin123', name: 'Admin', role: 'admin' }
    ];
  }
  
  return usersEnv.split(',').map(userStr => {
    const [email, password, name = 'User', role = 'user'] = userStr.split(':');
    return { 
      email: email?.trim(), 
      password: password?.trim(), 
      name: name?.trim(), 
      role: (role?.trim() as 'admin' | 'user') || 'user' 
    };
  }).filter(u => u.email && u.password);
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<AuthResponse> {
  const users = getConfiguredUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (!user) {
    return { ok: false, error: 'Invalid email or password' };
  }
  
  const authenticatedUser: User = {
    id: uuidv4(),
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: new Date().toISOString()
  };
  
  return { ok: true, user: authenticatedUser };
}

/**
 * Create a new session for a user
 */
export function createSession(user: User): string {
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  
  sessions.set(sessionId, {
    user,
    expiresAt
  });
  
  // Clean up expired sessions periodically
  cleanupExpiredSessions();
  
  return sessionId;
}

/**
 * Get session by ID
 */
export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }
  
  // Check if session has expired
  if (new Date(session.expiresAt) < new Date()) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session;
}

/**
 * Delete a session (logout)
 */
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

/**
 * Cleanup expired sessions
 */
function cleanupExpiredSessions(): void {
  const now = new Date();
  const sessionEntries = Array.from(sessions.entries());
  for (const [sessionId, session] of sessionEntries) {
    if (new Date(session.expiresAt) < now) {
      sessions.delete(sessionId);
    }
  }
}

/**
 * Session cookie name
 */
export const SESSION_COOKIE_NAME = 'ar_session';

/**
 * Check if auth is enabled
 */
export function isAuthEnabled(): boolean {
  // Auth can be disabled by setting AUTH_ENABLED=false
  const authEnabled = process.env.AUTH_ENABLED;
  return authEnabled !== 'false';
}
