import { Router } from 'express';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { ProjectService } from '../services/ProjectService';
import { ProjectController } from '../controllers/ProjectController';
import { auth } from '../middlewares/auth';

const projectRepository = new ProjectRepository();
const projectService = new ProjectService(projectRepository);
const projectController = new ProjectController(projectService);

const router = Router();
router.post('/create', auth, projectController.createProject.bind(projectController));

export default router;
