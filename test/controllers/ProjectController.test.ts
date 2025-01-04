import { ProjectController } from '../../src/controllers/ProjectController';
import { ProjectService } from '../../src/services/ProjectService';
import { Response } from 'express';
import { ExpressRequestInterface } from '../../src/types/ExpressRequestInterface';

jest.mock('../../src/services/ProjectService');

describe('ProjectController', () => {
  let projectController: ProjectController;
  let mockProjectService: jest.Mocked<ProjectService>;
  let mockReq: Partial<ExpressRequestInterface>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockProjectService = new ProjectService(null as any) as jest.Mocked<ProjectService>;

    projectController = new ProjectController(mockProjectService);

    mockReq = {
      body: { title: 'Test Project', description: 'Test Description' },
      userId: 'user1',
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should create a project successfully', async () => {
    const mockProject = {
      id: '1',
      title: 'Test Project',
      description: 'Test Description',
      userId: 'user1',
      createdAt: new Date(),
    };

    mockProjectService.createProject.mockResolvedValue(mockProject);

    await projectController.createProject(mockReq as ExpressRequestInterface, mockRes as Response);

    expect(mockProjectService.createProject).toHaveBeenCalledWith(
      'Test Project',
      'Test Description',
      'user1',
    );
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockProject);
  });

  it('should return 401 if userId is missing', async () => {
    mockReq.userId = undefined;

    await projectController.createProject(mockReq as ExpressRequestInterface, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'User ID is missing in the request',
    });
  });

  it('should handle error when project creation fails', async () => {
    const errorMessage = 'Project title is required';
    mockProjectService.createProject.mockRejectedValue(new Error(errorMessage));

    await projectController.createProject(mockReq as ExpressRequestInterface, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Failed to create project',
      message: errorMessage,
    });
  });

  it('should find projects with tasks successfully', async () => {
    const mockProjects = [
      {
        id: '1',
        title: 'Test Project 1',
        description: 'Test Description 1',
        userId: 'user1',
        createdAt: new Date(),
        tasks: [
          {
            id: 'task1',
            title: 'Test Task 1',
            status: 'in-progress',
            assignedTo: 'user2',
            assignee: { name: 'User 2' },
          },
        ],
      },
    ];

    mockProjectService.findProjectsWithTasks.mockResolvedValue(mockProjects);

    await projectController.findProjectsWithTasks(
      mockReq as ExpressRequestInterface,
      mockRes as Response,
    );

    expect(mockProjectService.findProjectsWithTasks).toHaveBeenCalledWith('user1');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockProjects);
  });

  it('should return 401 if userId is missing in findProjectsWithTasks', async () => {
    mockReq.userId = undefined;

    await projectController.findProjectsWithTasks(
      mockReq as ExpressRequestInterface,
      mockRes as Response,
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'User ID is missing in the request',
    });
  });

  it('should handle error when no projects found', async () => {
    const errorMessage = 'No projects found';
    mockProjectService.findProjectsWithTasks.mockRejectedValue(new Error(errorMessage));

    await projectController.findProjectsWithTasks(
      mockReq as ExpressRequestInterface,
      mockRes as Response,
    );

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Failed to fetch projects',
      message: errorMessage,
    });
  });
});
