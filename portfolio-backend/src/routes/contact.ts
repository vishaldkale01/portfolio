import { Router } from 'express';
import { contactController } from '../controllers/contactController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public route for submitting contact form
router.post('/', contactController.submitContact);

// Protected routes - require authentication
router.get('/', authMiddleware, contactController.getAllContacts);
router.post('/:id/reply', authMiddleware, contactController.replyToContact);
router.delete('/:id', authMiddleware, contactController.deleteContact);

export default router;