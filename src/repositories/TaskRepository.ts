import { PrismaClient } from '@prisma/client';

export class TaskRepository {
  private readonly prisma = new PrismaClient();

  public async createTask(
    title: string,
    description: string | null,
    deadline: Date,
    projectId: string,
  ) {
    return this.prisma.task.create({
      data: { title, description, deadline, projectId },
    });
  }

  public async findTasksByProjectId(projectId: string) {
    return this.prisma.task.findMany({ where: { projectId } });
  }

  public async findTaskById(taskId: string) {
    return this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
  }

  public async assignTaskAssignee(taskId: string, userId: string) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: { assignedTo: userId },
    });
  }

  public async updateTaskStatus(taskId: string, status: string, completedAt: Date | null) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status, completedAt },
    });
  }

  public async findTasksByUserId(userId: string) {
    return this.prisma.task.findMany({
      where: {
        assignedTo: userId,
        OR: [{ status: 'completed' }, { status: 'in_progress' }],
      },
    });
  }

  public async findTasksByFilters(
    userId: string,
    projectId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = {
      assignedTo: userId,
    };

    if (projectId) {
      where.projectId = projectId;
    }
    if (startDate) {
      where.createdAt = { gte: startDate };
    }
    if (endDate) {
      if (!where.createdAt) where.createdAt = {};
      where.createdAt.lte = endDate;
    }

    return this.prisma.task.findMany({ where });
  }
}
