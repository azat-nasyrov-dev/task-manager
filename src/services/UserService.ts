import { UserRepository } from '../repositories/UserRepository';
import { generateToken } from '../utils/jwtUtils';

export class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async register(name: string, email: string) {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      throw Error('A user with this email already exists');
    }

    const user = await this.userRepository.createUser(name, email);
    const token = generateToken({ userId: user.id });

    return { user, token };
  }
}
