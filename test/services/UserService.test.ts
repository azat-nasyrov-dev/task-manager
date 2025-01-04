import { UserService } from '../../src/services/UserService';
import { UserRepository } from '../../src/repositories/UserRepository';
import { generateToken } from '../../src/utils/jwtUtils';

jest.mock('../../src/repositories/UserRepository');
jest.mock('../../src/utils/jwtUtils');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  const mockGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService(mockUserRepository);
  });

  it('should register a new user', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: new Date(),
    };
    const mockToken = 'mocked-jwt-token';

    mockUserRepository.findUserByEmail.mockResolvedValue(null);
    mockUserRepository.createUser.mockResolvedValue(mockUser);
    mockGenerateToken.mockReturnValue(mockToken);

    const result = await userService.register('John Doe', 'john.doe@example.com');

    expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith('john.doe@example.com');
    expect(mockUserRepository.createUser).toHaveBeenCalledWith('John Doe', 'john.doe@example.com');
    expect(mockGenerateToken).toHaveBeenCalledWith({ userId: mockUser.id });
    expect(result.token).toBe(mockToken);
    expect(result.user).toEqual(mockUser);
  });

  it('should throw an error if email is already taken', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: new Date(),
    };

    mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);

    await expect(userService.register('John Doe', 'john.doe@example.com')).rejects.toThrow(
      'A user with this email already exists',
    );

    expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith('john.doe@example.com');
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    expect(mockGenerateToken).not.toHaveBeenCalled();
  });
});
