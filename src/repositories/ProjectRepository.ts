import { PrismaClient } from '@prisma/client';

export class ProjectRepository {
  private readonly prisma = new PrismaClient();

  public async createProject(title: string, description: string | null, userId: string) {
    return this.prisma.project.create({
      data: { title, description, userId },
    });
  }

  public async findProjectsByUserId(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            assignedTo: true,
            assignee: {
              select: { name: true },
            },
          },
        },
      },
    });
  }
}
