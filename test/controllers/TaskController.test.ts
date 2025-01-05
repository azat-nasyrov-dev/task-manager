import { Response } from 'express';
import { TaskController } from '../../src/controllers/TaskController';
import { TaskService } from '../../src/services/TaskService';
import { TaskRepository } from '../../src/repositories/TaskRepository';
import { ProjectRepository } from '../../src/repositories/ProjectRepository';
import { ExpressRequestInterface } from '../../src/types/ExpressRequestInterface';

jest.mock('../../src/services/TaskService');
jest.mock('../../src/repositories/TaskRepository');
jest.mock('../../src/repositories/ProjectRepository');

describe('TaskController', () => {
  let taskController: TaskController;
  let mockTaskService: jest.Mocked<TaskService>;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  let mockProjectRepository: jest.Mocked<ProjectRepository>;
  let mockReq: Partial<ExpressRequestInterface>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockTaskRepository = new TaskRepository() as jest.Mocked<TaskRepository>;
    mockProjectRepository = new ProjectRepository() as jest.Mocked<ProjectRepository>;
    mockTaskService = new TaskService(
      mockTaskRepository,
      mockProjectRepository,
    ) as jest.Mocked<TaskService>;

    taskController = new TaskController(mockTaskService);

    mockReq = {
      body: { title: 'Test Task', description: 'Test Description', projectId: '1' },
      userId: 'user1',
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should create a task successfully', async () => {
    const mockTask = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      deadline: new Date(),
      projectId: '1',
      assignedTo: 'user2',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    mockTaskService.createTask.mockResolvedValue(mockTask);

    await taskController.createTask(mockReq as ExpressRequestInterface, mockRes as Response);

    expect(mockTaskService.createTask).toHaveBeenCalledWith(
      'Test Task',
      'Test Description',
      'user1',
      '1',
    );
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockTask);
  });

  it('should return 401 if userId is missing', async () => {
    mockReq.userId = undefined;

    await taskController.createTask(mockReq as ExpressRequestInterface, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'User ID is missing in the request',
    });
  });

  it('should handle error when task creation fails', async () => {
    const errorMessage = 'Task creation failed';
    mockTaskService.createTask.mockRejectedValue(new Error(errorMessage));

    await taskController.createTask(mockReq as ExpressRequestInterface, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Failed to create task',
      message: errorMessage,
    });
  });

  it('should assign task to user successfully', async () => {
    const taskId = '1';
    const mockTask = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      deadline: new Date(),
      projectId: '1',
      assignedTo: 'user2',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    mockTaskService.assignTaskAssignee.mockResolvedValue(mockTask);

    mockReq.body = { taskId, assigneeId: 'user2' };

    await taskController.assignTaskAssignee(
      mockReq as ExpressRequestInterface,
      mockRes as Response,
    );

    expect(mockTaskService.assignTaskAssignee).toHaveBeenCalledWith(taskId, 'user1');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockTask);
  });

  it('should return 401 if userId is missing in assignTaskAssignee', async () => {
    mockReq.userId = undefined;

    await taskController.assignTaskAssignee(
      mockReq as ExpressRequestInterface,
      mockRes as Response,
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'User ID is missing in the request',
    });
  });

  it('should handle error when assigning task fails', async () => {
    const errorMessage = 'Task assignment failed';
    mockTaskService.assignTaskAssignee.mockRejectedValue(new Error(errorMessage));

    mockReq.body = { taskId: '1', assigneeId: 'user2' };

    await taskController.assignTaskAssignee(
      mockReq as ExpressRequestInterface,
      mockRes as Response,
    );

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Failed to assign task',
      message: errorMessage,
    });
  });

  it('should find tasks by projectId successfully', async () => {
    const mockTasks = [
      {
        id: 'task1',
        title: 'Task 1',
        description: 'Task description 1',
        status: 'in-progress',
        deadline: new Date(),
        projectId: '1',
        assignedTo: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      },
      {
        id: 'task2',
        title: 'Task 2',
        description: 'Task description 2',
        status: 'completed',
        deadline: new Date(),
        projectId: '1',
        assignedTo: 'user2',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
      },
    ];

    mockTaskService.findTasksByProjectId.mockResolvedValue(mockTasks);

    mockReq.params = { projectId: '1' };

    await taskController.findTasksByProjectId(
      mockReq as ExpressRequestInterface,
      mockRes as Response,
    );

    expect(mockTaskService.findTasksByProjectId).toHaveBeenCalledWith('1');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
  });

  it('should return 401 if userId is missing in findTasksByProjectId', async () => {
    mockReq.userId = undefined;

    await taskController.findTasksByProjectId(
      mockReq as ExpressRequestInterface,
      mockRes as Response,
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'User ID is missing in the request',
    });
  });

  it('should handle error when no tasks found by projectId', async () => {
    const errorMessage = 'No tasks found for project';
    mockTaskService.findTasksByProjectId.mockRejectedValue(new Error(errorMessage));

    mockReq.params = { projectId: '1' };

    await taskController.findTasksByProjectId(
      mockReq as ExpressRequestInterface,
      mockRes as Response,
    );

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Failed to fetch tasks',
      message: errorMessage,
    });
  });

  it('should update task status successfully', async () => {
    const taskId = '1';
    const status = 'completed';
    const mockTask = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      deadline: new Date(),
      projectId: '1',
      assignedTo: 'user2',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    mockTaskService.updateTaskStatus.mockResolvedValue(mockTask);

    mockReq.body = { taskId, status };
    mockReq.userId = 'user1';

    await taskController.updateTaskStatus(mockReq as ExpressRequestInterface, mockRes as Response);

    expect(mockTaskService.updateTaskStatus).toHaveBeenCalledWith(taskId, 'user1', status);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockTask);
  });

  it('should return 401 if userId is missing in updateTaskStatus', async () => {
    mockReq.userId = undefined;

    await taskController.updateTaskStatus(mockReq as ExpressRequestInterface, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'User ID is missing in the request',
    });
  });

  it('should handle error when updating task status fails', async () => {
    const errorMessage = 'Status update failed';
    mockTaskService.updateTaskStatus.mockRejectedValue(new Error(errorMessage));

    mockReq.body = { taskId: '1', status: 'completed' };

    await taskController.updateTaskStatus(mockReq as ExpressRequestInterface, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Failed to update task status',
      message: errorMessage,
    });
  });
});
