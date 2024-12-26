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
}
