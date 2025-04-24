import { Router } from 'express';
import { contactSettingsController } from '../controllers/contactSettingsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', contactSettingsController.getSettings);
router.put('/', authMiddleware, contactSettingsController.updateSettings);

export default router;