import { PrismaClient } from '@prisma/client';

export class UserRepository {
  private readonly prisma = new PrismaClient();

  public async createUser(name: string, email: string) {
    return this.prisma.user.create({ data: { name, email } });
  }

  public async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
