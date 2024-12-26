import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || '';
// TODO: Temporarily changed for 1 day, will need to be returned to 1 hour
const EXPIRATION_TIME = '1d';

export function generateToken<T extends object>(payload: T): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRATION_TIME });
}

export function verifyToken<T>(token: string): T | null {
  try {
    return jwt.verify(token, SECRET_KEY) as T;
  } catch {
    return null;
  }
}
