import { TaskRepository } from '../repositories/TaskRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';

export class TaskService {
  private readonly taskRepository: TaskRepository;
  private readonly projectRepository: ProjectRepository;

  constructor(taskRepository: TaskRepository, projectRepository: ProjectRepository) {
    this.taskRepository = taskRepository;
    this.projectRepository = projectRepository;
  }

  public async createTask(
    title: string,
    description: string | null,
    deadline: Date,
    projectId: string,
    userId: string,
  ) {
    const project = await this.projectRepository.findProjectsByUserId(userId);

    if (!project.some((p) => p.id === projectId)) {
      throw new Error('Project not found or access denied');
    }
    if (!title || title.trim() === '') {
      throw new Error('Task title is required');
    }
    if (!deadline) {
      throw new Error('Deadline date is required');
    }

    return await this.taskRepository.createTask(title, description, deadline, projectId);
  }

  public async assignTaskAssignee(taskId: string, userId: string) {
    const task = await this.taskRepository.findTaskById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }
    if (task.project.userId !== userId) {
      throw new Error('You do not have permission to assign this task');
    }

    return await this.taskRepository.assignTaskAssignee(taskId, userId);
  }

  public async updateTaskStatus(taskId: string, userId: string, newStatus: string) {
    const validStatuses = ['created', 'in_progress', 'completed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid task status');
    }

    const task = await this.taskRepository.findTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.assignedTo !== userId) {
      throw new Error('You are not authorized to change the status of this task');
    }

    const completedAt = newStatus === 'completed' ? new Date() : null;
    return await this.taskRepository.updateTaskStatus(taskId, newStatus, completedAt);
  }

  public async getDeveloperWorkTime(userId: string) {
    const tasks = await this.taskRepository.findTasksByUserId(userId);

    let totalTimeSpent = 0;

    for (const task of tasks) {
      let taskStartTime = task.createdAt;
      if (task.assignedTo) {
        taskStartTime = task.createdAt;
      }

      const taskEndTime = task.completedAt || new Date();
      totalTimeSpent += taskEndTime.getTime() - taskStartTime.getTime();
    }

    return totalTimeSpent / (1000 * 60 * 60);
  }
}
