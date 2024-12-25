import { Request } from 'express';

export interface ExpressRequestInterface extends Request {
  userId?: string;
}
