import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { logger } from '../utils/logger';

export class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async register(req: Request, res: Response) {
    try {
      const { name, email } = req.body;
      const { user, token } = await this.userService.register(name, email);

      logger.info(`User registered successfully: ID=${user.id}`);
      res.status(201).json({ id: user.id, token });
    } catch (error: any) {
      logger.error(`Registration failed: ${error.message}`);
      res.status(400).json({
        error: 'Registration failed',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
}
