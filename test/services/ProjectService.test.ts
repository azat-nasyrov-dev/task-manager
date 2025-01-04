import { ProjectService } from '../../src/services/ProjectService';
import { ProjectRepository } from '../../src/repositories/ProjectRepository';

jest.mock('../../src/repositories/ProjectRepository');

describe('ProjectService', () => {
  let projectService: ProjectService;
  let mockProjectRepository: jest.Mocked<ProjectRepository>;

  beforeEach(() => {
    mockProjectRepository = new ProjectRepository() as jest.Mocked<ProjectRepository>;
    projectService = new ProjectService(mockProjectRepository);
  });

  it('should create a project successfully', async () => {
    const mockProject = {
      id: '1',
      title: 'Test Project',
      description: 'Test Description',
      userId: 'user1',
      createdAt: new Date(),
      tasks: [],
    };

    mockProjectRepository.createProject.mockResolvedValue(mockProject);

    const result = await projectService.createProject('Test Project', 'Test Description', 'user1');

    expect(mockProjectRepository.createProject).toHaveBeenCalledWith(
      'Test Project',
      'Test Description',
      'user1',
    );
    expect(result).toEqual(mockProject);
  });

  it('should throw error when project title is empty', async () => {
    await expect(projectService.createProject('', 'Test Description', 'user1')).rejects.toThrow(
      'Project title is required',
    );
  });

  it('should find projects with tasks for a user', async () => {
    const mockProjects = [
      {
        id: '1',
        title: 'Test Project 1',
        description: 'Test Description 1',
        userId: 'user1',
        createdAt: new Date(),
        tasks: [
          {
            id: '1',
            title: 'Task 1',
            status: 'pending',
            assignedTo: 'user1',
            assignee: { name: 'John Doe' },
          },
        ],
      },
      {
        id: '2',
        title: 'Test Project 2',
        description: 'Test Description 2',
        userId: 'user1',
        createdAt: new Date(),
        tasks: [
          {
            id: '2',
            title: 'Task 2',
            status: 'completed',
            assignedTo: 'user2',
            assignee: { name: 'Jane Doe' },
          },
        ],
      },
    ];

    mockProjectRepository.findProjectsByUserId.mockResolvedValue(mockProjects);

    const result = await projectService.findProjectsWithTasks('user1');

    expect(mockProjectRepository.findProjectsByUserId).toHaveBeenCalledWith('user1');
    expect(result).toEqual(mockProjects);
  });

  it('should throw error when no projects are found for the user', async () => {
    mockProjectRepository.findProjectsByUserId.mockResolvedValue([]);

    await expect(projectService.findProjectsWithTasks('user1')).rejects.toThrow(
      'No projects found',
    );
  });
});
