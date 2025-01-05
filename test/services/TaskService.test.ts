import { TaskService } from '../../src/services/TaskService';
import { TaskRepository } from '../../src/repositories/TaskRepository';
import { ProjectRepository } from '../../src/repositories/ProjectRepository';

jest.mock('../../src/repositories/TaskRepository');
jest.mock('../../src/repositories/ProjectRepository');

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  let mockProjectRepository: jest.Mocked<ProjectRepository>;

  beforeEach(() => {
    mockTaskRepository = new TaskRepository() as jest.Mocked<TaskRepository>;
    mockProjectRepository = new ProjectRepository() as jest.Mocked<ProjectRepository>;
    taskService = new TaskService(mockTaskRepository, mockProjectRepository);
  });

  describe('createTask', () => {
    it('should create a task if the project exists and user has access', async () => {
      const mockProjects = [
        {
          id: '1',
          title: 'Project Title',
          description: 'Project Description',
          createdAt: new Date(),
          userId: '1',
          tasks: [
            {
              id: '1',
              title: 'Task Title',
              status: 'pending',
              assignedTo: null,
              assignee: null,
            },
          ],
        },
      ];
      mockProjectRepository.findProjectsByUserId.mockResolvedValue(mockProjects);

      mockTaskRepository.createTask.mockResolvedValue({
        id: '1',
        title: 'Task 1',
        description: null,
        deadline: new Date(),
        projectId: '1',
        status: 'created',
        assignedTo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      });

      const result = await taskService.createTask('Task 1', null, new Date(), '1', '1');

      expect(result).toBeDefined();
      expect(mockProjectRepository.findProjectsByUserId).toHaveBeenCalledWith('1');
      expect(mockTaskRepository.createTask).toHaveBeenCalledWith(
        'Task 1',
        null,
        expect.any(Date),
        '1',
      );
    });

    it('should throw an error if the project is not found or user has no access', async () => {
      mockProjectRepository.findProjectsByUserId.mockResolvedValue([]);

      await expect(taskService.createTask('Task 1', null, new Date(), '1', '1')).rejects.toThrow(
        'Project not found or access denied',
      );
    });

    it('should throw an error if title or deadline is invalid', async () => {
      await expect(taskService.createTask('', null, new Date(), '1', '1')).rejects.toThrow(
        'Task title is required',
      );

      await expect(taskService.createTask('Task 1', null, null as any, '1', '1')).rejects.toThrow(
        'Deadline date is required',
      );
    });
  });

  describe('assignTaskAssignee', () => {
    it('should assign a task to a user if conditions are met', async () => {
      const mockTask = {
        id: '1',
        title: 'Task Title',
        description: null,
        deadline: new Date(),
        projectId: '1',
        status: 'pending',
        assignedTo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        project: {
          id: '1',
          title: 'Project Title',
          description: 'Project Description',
          createdAt: new Date(),
          userId: '1',
        },
      };

      mockTaskRepository.findTaskById.mockResolvedValue(mockTask);
      mockTaskRepository.assignTaskAssignee.mockResolvedValue(mockTask);

      const result = await taskService.assignTaskAssignee('1', '1');

      expect(result).toBeDefined();
      expect(mockTaskRepository.findTaskById).toHaveBeenCalledWith('1');
      expect(mockTaskRepository.assignTaskAssignee).toHaveBeenCalledWith('1', '1');
    });

    it('should throw an error if task is not found', async () => {
      mockTaskRepository.findTaskById.mockResolvedValue(null);

      await expect(taskService.assignTaskAssignee('1', 'user1')).rejects.toThrow('Task not found');
    });

    it('should throw an error if user does not have permission', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Task Title',
        description: null,
        deadline: new Date(),
        projectId: 'project-1',
        status: 'pending',
        assignedTo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        project: {
          id: 'project-1',
          title: 'Project Title',
          description: 'Project Description',
          createdAt: new Date(),
          userId: 'user-1',
        },
      };

      mockTaskRepository.findTaskById.mockResolvedValue(mockTask);

      await expect(taskService.assignTaskAssignee('1', 'user1')).rejects.toThrow(
        'You do not have permission to assign this task',
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('should update the task status if conditions are met', async () => {
      const mockTask = {
        id: '1',
        title: 'Task Title',
        description: null,
        deadline: new Date(),
        projectId: '1',
        status: 'pending',
        assignedTo: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        project: {
          id: '1',
          title: 'Project Title',
          description: 'Project Description',
          createdAt: new Date(),
          userId: '1',
        },
      };

      mockTaskRepository.findTaskById.mockResolvedValue(mockTask);
      mockTaskRepository.updateTaskStatus.mockResolvedValue(mockTask);

      const result = await taskService.updateTaskStatus('1', '1', 'completed');

      expect(result).toBeDefined();
      expect(mockTaskRepository.findTaskById).toHaveBeenCalledWith('1');
      expect(mockTaskRepository.updateTaskStatus).toHaveBeenCalledWith(
        '1',
        'completed',
        expect.any(Date),
      );
    });

    it('should throw an error if status is invalid', async () => {
      await expect(taskService.updateTaskStatus('1', '1', 'invalid_status')).rejects.toThrow(
        'Invalid task status',
      );
    });

    it('should throw an error if task is not found', async () => {
      mockTaskRepository.findTaskById.mockResolvedValue(null);

      await expect(taskService.updateTaskStatus('1', '1', 'completed')).rejects.toThrow(
        'Task not found',
      );
    });

    it('should throw an error if user is not authorized', async () => {
      const mockTask = {
        id: '1',
        title: 'Task Title',
        description: null,
        deadline: new Date(),
        projectId: '1',
        status: 'pending',
        assignedTo: '2',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        project: {
          id: '1',
          title: 'Project Title',
          description: 'Project Description',
          createdAt: new Date(),
          userId: '1',
        },
      };

      mockTaskRepository.findTaskById.mockResolvedValue(mockTask);

      await expect(taskService.updateTaskStatus('1', '3', 'completed')).rejects.toThrow(
        'You are not authorized to change the status of this task',
      );
    });
  });

  describe('getDeveloperWorkTime', () => {
    it('should calculate total work time for developer correctly', async () => {
      const mockCurrentTime = new Date('2023-01-01T03:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockCurrentTime);

      const mockTasks = [
        {
          id: '1',
          title: 'Task Title',
          description: null,
          status: 'pending',
          deadline: new Date(),
          projectId: '1',
          assignedTo: null,
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date(),
          completedAt: null,
        },
      ];

      mockTaskRepository.findTasksByUserId.mockResolvedValue(mockTasks);

      const result = await taskService.getDeveloperWorkTime('1');

      expect(result).toBeCloseTo(3, 2);
      expect(mockTaskRepository.findTasksByUserId).toHaveBeenCalledWith('1');
    });

    it('should return 0 if no tasks are found', async () => {
      mockTaskRepository.findTasksByUserId.mockResolvedValue([]);

      const result = await taskService.getDeveloperWorkTime('1');

      expect(result).toBe(0);
      expect(mockTaskRepository.findTasksByUserId).toHaveBeenCalledWith('1');
    });
  });

  describe('getDeveloperWorkTimeWithFilters', () => {
    it('should calculate total work time with filters correctly', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task Title',
          description: null,
          status: 'pending',
          deadline: new Date(),
          projectId: '1',
          assignedTo: null,
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date(),
          completedAt: null,
        },
      ];

      mockTaskRepository.findTasksByFilters.mockResolvedValue(mockTasks);

      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-01T23:59:59Z');

      const result = await taskService.getDeveloperWorkTimeWithFilters(
        '1',
        '1',
        startDate,
        endDate,
      );

      expect(result).toBeCloseTo(3, 2);
      expect(mockTaskRepository.findTasksByFilters).toHaveBeenCalledWith(
        '1',
        '1',
        startDate,
        endDate,
      );
    });

    it('should return 0 if no tasks match the filters', async () => {
      mockTaskRepository.findTasksByFilters.mockResolvedValue([]);

      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-01T23:59:59Z');

      const result = await taskService.getDeveloperWorkTimeWithFilters(
        '1',
        '1',
        startDate,
        endDate,
      );

      expect(result).toBe(0);
      expect(mockTaskRepository.findTasksByFilters).toHaveBeenCalledWith(
        '1',
        '1',
        startDate,
        endDate,
      );
    });
  });

  describe('getTotalProjectWorkTime', () => {
    it('should calculate total work time for a project correctly', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task Title',
          description: null,
          status: 'pending',
          deadline: new Date(),
          projectId: '1',
          assignedTo: null,
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date(),
          completedAt: null,
        },
      ];

      mockTaskRepository.findTasksByProjectsWithFilters.mockResolvedValue(mockTasks);

      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-02T23:59:59Z');

      const result = await taskService.getTotalProjectWorkTime('1', startDate, endDate);

      expect(result).toBeCloseTo(3, 2);
      expect(mockTaskRepository.findTasksByProjectsWithFilters).toHaveBeenCalledWith('1');
    });

    it('should return 0 if no tasks match the project or filters', async () => {
      mockTaskRepository.findTasksByProjectsWithFilters.mockResolvedValue([]);

      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-02T23:59:59Z');

      const result = await taskService.getTotalProjectWorkTime('1', startDate, endDate);

      expect(result).toBe(0);
      expect(mockTaskRepository.findTasksByProjectsWithFilters).toHaveBeenCalledWith('1');
    });
  });
});
