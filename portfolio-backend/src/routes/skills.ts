import { Router } from 'express';
import { skillController } from '../controllers/skillController';

const router = Router();

router.get('/', skillController.getAllSkills);
router.get('/category/:category', skillController.getSkillsByCategory);
router.post('/', skillController.createSkill);
router.put('/:id', skillController.updateSkill);
router.delete('/:id', skillController.deleteSkill);

export default router;