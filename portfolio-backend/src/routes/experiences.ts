import { Router } from 'express';
import { experienceController } from '../controllers/experienceController';

const router = Router();

router.get('/', experienceController.getAllExperiences);
router.get('/current', experienceController.getCurrentExperience);
router.post('/', experienceController.createExperience);
router.put('/:id', experienceController.updateExperience);
router.delete('/:id', experienceController.deleteExperience);

export default router;