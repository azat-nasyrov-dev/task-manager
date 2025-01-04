import { PrismaClient, User } from '@prisma/client';
import { UserRepository } from '../../src/repositories/UserRepository';

jest.mock('@prisma/client', () => {
  const mockUserClient = {
    create: jest.fn(),
    findUnique: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: mockUserClient,
    })),
  };
});

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockPrismaUserClient: any;

  beforeEach(() => {
    const prismaClient = new PrismaClient();
    mockPrismaUserClient = prismaClient.user;
    userRepository = new UserRepository();
    (userRepository as any).prisma = prismaClient;
  });

  it('should create a user', async () => {
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: new Date(),
    };

    mockPrismaUserClient.create.mockResolvedValue(mockUser);

    const result = await userRepository.createUser('John Doe', 'john.doe@example.com');

    expect(mockPrismaUserClient.create).toHaveBeenCalledWith({
      data: { name: 'John Doe', email: 'john.doe@example.com' },
    });
    expect(result).toEqual(mockUser);
  });

  it('should find a user by email', async () => {
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: new Date(),
    };

    mockPrismaUserClient.findUnique.mockResolvedValue(mockUser);

    const result = await userRepository.findUserByEmail('john.doe@example.com');

    expect(mockPrismaUserClient.findUnique).toHaveBeenCalledWith({
      where: { email: 'john.doe@example.com' },
    });
    expect(result).toEqual(mockUser);
  });
});
