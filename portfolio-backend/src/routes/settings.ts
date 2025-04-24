import { Router } from 'express';
import { settingsController } from '../controllers/settingsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public route - anyone can get settings
router.get('/', settingsController.getSettings);

// Protected route - only admin can update settings
router.put('/', authMiddleware, settingsController.updateSettings);

export default router;