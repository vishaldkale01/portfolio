import { Router } from 'express';
import { experienceController } from '../controllers/experienceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', experienceController.getAllExperiences);
router.get('/current', experienceController.getCurrentExperience);

// Protected routes
router.post('/', authMiddleware, experienceController.createExperience);
router.put('/:id', authMiddleware, experienceController.updateExperience);
router.delete('/:id', authMiddleware, experienceController.deleteExperience);

export default router;