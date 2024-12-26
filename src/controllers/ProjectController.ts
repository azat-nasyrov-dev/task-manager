import { Response } from 'express';
import { ProjectService } from '../services/ProjectService';
import { logger } from '../utils/logger';
import { ExpressRequestInterface } from '../types/ExpressRequestInterface';

export class ProjectController {
  private readonly projectService: ProjectService;

  constructor(projectService: ProjectService) {
    this.projectService = projectService;
  }

  public async createProject(req: ExpressRequestInterface, res: Response) {
    const { title, description } = req.body;
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
      const project = await this.projectService.createProject(title, description, userId);

      logger.info(`Project created successfully: ID=${project.id}`);
      res.status(201).json(project);
    } catch (error: any) {
      logger.error(`Project creation failed: ${error.message}`);
      res.status(400).json({
        error: 'Failed to create project',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
}
