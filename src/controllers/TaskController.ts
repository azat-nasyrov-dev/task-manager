import { Response } from 'express';
import { TaskService } from '../services/TaskService';
import { ExpressRequestInterface } from '../types/ExpressRequestInterface';
import { logger } from '../utils/logger';

export class TaskController {
  private readonly taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  public async createTask(req: ExpressRequestInterface, res: Response) {
    const { title, description, deadline, projectId } = req.body;
    const userId = req.userId;

    if (!userId) {
      logger.error('User ID is missing in the request');
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID is missing in the request',
      });
      return;
    }

    try {
      const task = await this.taskService.createTask(
        title,
        description,
        new Date(deadline),
        projectId,
        userId,
      );

      logger.info(`Task created successfully: ID=${task.id}`);
      res.status(201).json(task);
    } catch (error: any) {
      logger.error(`Task creation failed: ${error.message}`);
      res.status(400).json({
        error: 'Failed to create task',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }

  public async findTasksByProjectId(
    req: ExpressRequestInterface,
    res: Response,
  ): Promise<Response> {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        logger.error('Project ID is missing in the request');
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Project ID is missing',
        });
      }

      logger.info(`Fetching tasks for project ID: ${projectId}`);

      const tasks = await this.taskService.findTasksByProjectId(projectId);

      if (!tasks || tasks.length === 0) {
        logger.warn(`No tasks found for project ID: ${projectId}`);
        throw new Error('No tasks found for project');
      }

      logger.info(`Found ${tasks.length} tasks for project ID: ${projectId}`);

      return res.status(200).json(tasks);
    } catch (error: any) {
      logger.error(`Failed to fetch tasks for project: ${error.message}`);
      return res.status(400).json({
        error: 'Failed to fetch tasks',
        message: error.message,
      });
    }
  }
  public async assignTaskAssignee(req: ExpressRequestInterface, res: Response) {
    const { taskId } = req.body;
    const userId = req.userId;

    if (!userId) {
      logger.error('User ID is missing in the request');
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID is missing in the request',
      });
      return;
    }

    try {
      const task = await this.taskService.assignTaskAssignee(taskId, userId);

      logger.info(`Task successfully assigned to user: TaskID=${task.id}, UserID=${userId}`);
      res.status(200).json(task);
    } catch (error: any) {
      logger.error(`Failed to assign task: ${error.message}`);
      res.status(400).json({
        error: 'Failed to assign task',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }

  public async updateTaskStatus(req: ExpressRequestInterface, res: Response) {
    const { taskId, status } = req.body;
    const userId = req.userId;

    if (!userId) {
      logger.error('User ID is missing in the request');
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID is missing in the request',
      });
      return;
    }

    try {
      const updatedTask = await this.taskService.updateTaskStatus(taskId, userId, status);

      logger.info(`Task status updated successfully: ID=${updatedTask.id}, Status=${status}`);
      res.status(200).json(updatedTask);
    } catch (error: any) {
      logger.error(`Failed to update task status: ${error.message}`);
      res.status(400).json({
        error: 'Failed to update task status',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }

  public async getDeveloperWorkTime(req: ExpressRequestInterface, res: Response) {
    const userId = req.userId;

    if (!userId) {
      logger.error('User ID is missing in the request');
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID is missing in the request',
      });
      return;
    }

    try {
      const totalTime = await this.taskService.getDeveloperWorkTime(userId);

      logger.info(`Developer total work time: ${totalTime} hours`);
      res.status(200).json({ userId, totalWorkTime: totalTime });
    } catch (error: any) {
      logger.error(`Failed to get developer work time: ${error.message}`);
      res.status(400).json({
        error: 'Failed to get developer work time',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }

  public async getDeveloperWorkTimeWithFilters(req: ExpressRequestInterface, res: Response) {
    const userId = req.userId;
    const { projectId, startDate, endDate } = req.query;

    if (!userId) {
      logger.error('User ID is missing in the request');
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID is missing in the request',
      });
      return;
    }

    try {
      const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
      const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

      if (
        (startDate && isNaN(parsedStartDate!.getTime())) ||
        (endDate && isNaN(parsedEndDate!.getTime()))
      ) {
        throw new Error('Invalid date format');
      }

      const totalTime = await this.taskService.getDeveloperWorkTimeWithFilters(
        userId,
        projectId as string | undefined,
        parsedStartDate,
        parsedEndDate,
      );

      logger.info(`Filtered developer work time: ${totalTime} hours`);
      res.status(200).json({ userId, totalWorkTime: totalTime });
    } catch (error: any) {
      logger.error(`Failed to get developer work time with filters: ${error.message}`);
      res.status(400).json({
        error: 'Failed to get developer work time with filters',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }

  public async getTotalProjectWorkTime(req: ExpressRequestInterface, res: Response) {
    const { projectId, startDate, endDate } = req.query;

    if (!projectId) {
      logger.error('Project ID is missing in the request');
      res.status(400).json({
        error: 'Bad Request',
        message: 'Project ID is required',
      });
      return;
    }

    try {
      const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
      const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

      if (
        (startDate && isNaN(parsedStartDate!.getTime())) ||
        (endDate && isNaN(parsedEndDate!.getTime()))
      ) {
        throw new Error('Invalid date format');
      }

      const totalTime = await this.taskService.getTotalProjectWorkTime(
        projectId as string,
        parsedStartDate,
        parsedEndDate,
      );

      logger.info(`Total project work time: ${totalTime} hours`);
      res.status(200).json({ projectId, totalWorkTime: totalTime });
    } catch (error: any) {
      logger.error(`Failed to get total project work time: ${error.message}`);
      res.status(400).json({
        error: 'Failed to get total project work time',
        message: error.message || 'An expected error occurred',
      });
    }
  }
}
