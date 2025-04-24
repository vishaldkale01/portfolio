import { Router } from 'express';
import { contactController } from '../controllers/contactController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', contactController.submitContact);
router.get('/', contactController.getAllContacts);
router.post('/:id/reply', authMiddleware, contactController.replyToContact);
router.delete('/:id', authMiddleware, contactController.deleteContact);

export default router;