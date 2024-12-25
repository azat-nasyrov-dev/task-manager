import { Router } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';
import { UserController } from '../controllers/UserController';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = Router();
router.post('/register', userController.register.bind(userController));

export default router;
