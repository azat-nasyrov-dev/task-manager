import request from 'supertest';
import express from 'express';
import { UserController } from '../../src/controllers/UserController';
import { UserService } from '../../src/services/UserService';
import { UserRepository } from '../../src/repositories/UserRepository';

jest.mock('../../src/services/UserService');
jest.mock('../../src/repositories/UserRepository');

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let app: express.Express;

  beforeEach(() => {
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockUserService = new UserService(mockUserRepository) as jest.Mocked<UserService>;
    userController = new UserController(mockUserService);

    app = express();
    app.use(express.json());
    app.post('/users/register', (req, res) => userController.register(req, res));
  });

  it('should register a new user and return token and user info', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: new Date(),
    };
    const mockToken = 'mocked-jwt-token';

    mockUserService.register = jest.fn().mockResolvedValue({ user: mockUser, token: mockToken });

    const response = await request(app).post('/users/register').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(mockUser.id);
    expect(response.body.token).toBe(mockToken);
    expect(response.body.name).toBeUndefined();
    expect(response.body.email).toBeUndefined();
    expect(response.body.createdAt).toBeUndefined();
  });

  it('should return error if email is already taken', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: new Date(),
    };

    mockUserService.register = jest
      .fn()
      .mockRejectedValue(new Error('A user with this email already exists'));

    const response = await request(app).post('/users/register').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('A user with this email already exists');
  });
});
