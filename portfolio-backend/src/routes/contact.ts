import { Router } from 'express';
import { contactController } from '../controllers/contactController';

const router = Router();

router.post('/', contactController.submitContact);
router.get('/', contactController.getAllContacts);

export default router;