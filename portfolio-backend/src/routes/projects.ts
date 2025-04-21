import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', projectController.getAllProjects);
router.get('/current',  projectController.getCurrentProjects);

// Protected routes
router.post('/', authMiddleware, projectController.createProject);
router.put('/:id', authMiddleware, projectController.updateProject);
router.delete('/:id', authMiddleware, projectController.deleteProject);

export default router;