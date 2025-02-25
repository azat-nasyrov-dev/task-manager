import { Router } from 'express';
import { TaskRepository } from '../repositories/TaskRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { TaskService } from '../services/TaskService';
import { TaskController } from '../controllers/TaskController';
import { auth } from '../middlewares/auth';

const taskRepository = new TaskRepository();
const projectRepository = new ProjectRepository();
const taskService = new TaskService(taskRepository, projectRepository);
const taskController = new TaskController(taskService);

const router = Router();
router.post('/create', auth, taskController.createTask.bind(taskController));
router.put('/assign', auth, taskController.assignTaskAssignee.bind(taskController));
router.put('/status', auth, taskController.updateTaskStatus.bind(taskController));
router.get('/work-time', auth, taskController.getDeveloperWorkTime.bind(taskController));
router.get(
  '/work-time/filtered',
  auth,
  taskController.getDeveloperWorkTimeWithFilters.bind(taskController),
);
router.get('/project-work-time', auth, taskController.getTotalProjectWorkTime.bind(taskController));

export default router;
