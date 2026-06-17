import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { findOrCreateUser } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; clerkId: string };
    }
  }
}

function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new AppError('No token provided', 401));

  const token = header.slice(7);

  try {
    const decoded = decodeJwt(token);
    if (!decoded?.sub) return next(new AppError('Invalid token', 401));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return next(new AppError('Token expired', 401));
    }

    const dbUser = await findOrCreateUser(decoded.sub);
    req.user = { id: dbUser.id, email: dbUser.email, clerkId: decoded.sub };
    next();
  } catch (err) {
    console.error('Auth error:', err);
    next(new AppError('Authentication failed', 401));
  }
}
