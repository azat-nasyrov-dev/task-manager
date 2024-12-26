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
}
