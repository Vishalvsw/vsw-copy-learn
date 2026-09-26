import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db, User, Subscription, getAccessHierarchyLevel } from './db.js';

// Simple in-memory session token store: token -> userId
const tokenStore = new Map<string, { userId: string; expiresAt: number }>();

export function createSessionToken(userId: string): string {
  const token = 'vsw_' + crypto.randomBytes(32).toString('hex');
  // Token valid for 30 days
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  tokenStore.set(token, { userId, expiresAt });
  return token;
}

export function revokeSessionToken(token: string) {
  tokenStore.delete(token);
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  userSubscription?: Subscription | null;
  userAccessLevel?: 'Free' | 'Starter' | 'Professional' | 'Premium';
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7).trim();
  const session = tokenStore.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) tokenStore.delete(token);
    return next();
  }

  const data = db.get();
  const user = data.users.find((u) => u.id === session.userId);
  if (!user || user.status === 'suspended') {
    return next();
  }

  req.user = user;

  // Find active subscription for user
  const now = new Date();
  const activeSub = data.subscriptions
    .filter((s) => s.userId === user.id && s.status === 'active' && new Date(s.expiryDate) > now)
    .sort((a, b) => getAccessHierarchyLevel(b.accessLevel) - getAccessHierarchyLevel(a.accessLevel))[0] || null;

  req.userSubscription = activeSub;
  req.userAccessLevel = user.role === 'admin' ? 'Premium' : (activeSub ? activeSub.accessLevel : 'Free');

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required.' });
  }
  next();
}

export function checkProjectAccess(
  userRole?: string,
  userAccessLevel?: 'Free' | 'Starter' | 'Professional' | 'Premium',
  projectAccessLevel?: 'Free' | 'Starter' | 'Professional' | 'Premium'
): { allowed: boolean; reason?: string } {
  if (!projectAccessLevel || projectAccessLevel === 'Free') {
    return { allowed: true };
  }
  if (userRole === 'admin') {
    return { allowed: true };
  }
  if (!userAccessLevel || userAccessLevel === 'Free') {
    return {
      allowed: false,
      reason: `Upgrade your plan to access this project. Requires ${projectAccessLevel} access.`,
    };
  }

  const userRank = getAccessHierarchyLevel(userAccessLevel);
  const requiredRank = getAccessHierarchyLevel(projectAccessLevel);

  if (userRank >= requiredRank) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Upgrade your plan to access this project. Requires ${projectAccessLevel} or higher (current plan: ${userAccessLevel}).`,
  };
}
