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
}
