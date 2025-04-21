import { Router } from 'express';
import { adminController } from '../controllers/adminController';

const router = Router();

router.post('/login', adminController.login);
router.post('/verify', adminController.verifyToken);
router.post('/initialize', adminController.initializeAdmin);

export default router;