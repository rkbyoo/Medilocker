import { Router } from 'express';
import { BillController } from './bill.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

router.get('/', BillController.getAll);

export const billRoutes = router;
