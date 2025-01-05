import { PrismaClient, Task } from '@prisma/client';
import { TaskRepository } from '../../src/repositories/TaskRepository';

jest.mock('@prisma/client', () => {
  const mockTaskClient = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      task: mockTaskClient,
    })),
  };
});

describe('TaskRepository', () => {
  let taskRepository: TaskRepository;
  let mockPrismaTaskClient: any;

  beforeEach(() => {
    const prismaClient = new PrismaClient();
    mockPrismaTaskClient = prismaClient.task;
    taskRepository = new TaskRepository();
    (taskRepository as any).prisma = prismaClient;
  });

  it('should create a task', async () => {
    const mockTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      deadline: new Date(),
      projectId: 'project1',
      status: 'pending',
      assignedTo: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaTaskClient.create.mockResolvedValue(mockTask);

    const result = await taskRepository.createTask(
      'Test Task',
      'Test Description',
      new Date(),
      'project1',
    );

    expect(mockPrismaTaskClient.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Task',
        description: 'Test Description',
        deadline: expect.any(Date),
        projectId: 'project1',
      },
    });
    expect(result).toEqual(mockTask);
  });

  it('should find tasks by project ID', async () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        deadline: new Date(),
        projectId: 'project1',
        status: 'pending',
        assignedTo: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockPrismaTaskClient.findMany.mockResolvedValue(mockTasks);

    const result = await taskRepository.findTasksByProjectId('project1');

    expect(mockPrismaTaskClient.findMany).toHaveBeenCalledWith({
      where: { projectId: 'project1' },
    });
    expect(result).toEqual(mockTasks);
  });

  it('should find a task by ID', async () => {
    const mockTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      deadline: new Date(),
      projectId: 'project1',
      status: 'pending',
      assignedTo: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaTaskClient.findUnique.mockResolvedValue(mockTask);

    const result = await taskRepository.findTaskById('1');

    expect(mockPrismaTaskClient.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: { project: true },
    });
    expect(result).toEqual(mockTask);
  });

  it('should assign a task to a user', async () => {
    const mockTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      deadline: new Date(),
      projectId: 'project1',
      status: 'pending',
      assignedTo: 'user1',
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaTaskClient.update.mockResolvedValue(mockTask);

    const result = await taskRepository.assignTaskAssignee('1', 'user1');

    expect(mockPrismaTaskClient.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { assignedTo: 'user1' },
    });
    expect(result).toEqual(mockTask);
  });

  it('should update task status', async () => {
    const mockTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      deadline: new Date(),
      projectId: 'project1',
      status: 'completed',
      assignedTo: null,
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaTaskClient.update.mockResolvedValue(mockTask);

    const result = await taskRepository.updateTaskStatus('1', 'completed', new Date());

    expect(mockPrismaTaskClient.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { status: 'completed', completedAt: expect.any(Date) },
    });
    expect(result).toEqual(mockTask);
  });

  it('should find tasks by user ID', async () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        deadline: new Date(),
        projectId: 'project1',
        status: 'completed',
        assignedTo: 'user1',
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockPrismaTaskClient.findMany.mockResolvedValue(mockTasks);

    const result = await taskRepository.findTasksByUserId('user1');

    expect(mockPrismaTaskClient.findMany).toHaveBeenCalledWith({
      where: {
        assignedTo: 'user1',
        OR: [{ status: 'completed' }, { status: 'in_progress' }],
      },
    });
    expect(result).toEqual(mockTasks);
  });
});
