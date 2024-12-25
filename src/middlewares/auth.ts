import { NextFunction, Response } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { ExpressRequestInterface } from '../types/ExpressRequestInterface';

export function auth(req: ExpressRequestInterface, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken<{ userId: string }>(token);

  if (!payload) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  req.userId = payload.userId;
  next();
}
