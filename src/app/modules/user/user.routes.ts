import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/profile', authenticate, UserController.getProfile);

export default router;