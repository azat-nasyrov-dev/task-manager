import { ProjectRepository } from '../repositories/ProjectRepository';

export class ProjectService {
  private readonly projectRepository: ProjectRepository;

  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }

  public async createProject(title: string, description: string | null, userId: string) {
    if (!title || title.trim() === '') {
      throw new Error('Project title is required');
    }

    return await this.projectRepository.createProject(title, description, userId);
  }

  public async findProjectsWithTasks(userId: string) {
    const projects = await this.projectRepository.findProjectsByUserId(userId);
    if (!projects) {
      throw new Error('No projects found');
    }

    return projects;
  }
}
