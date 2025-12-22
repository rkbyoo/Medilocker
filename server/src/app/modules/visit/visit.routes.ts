import { Router } from 'express';
import { VisitController } from './visit.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { CreateVisitSchema, UpdateVisitSchema, VisitQuerySchema } from './visit.dto';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create visit
router.post(
  '/',
  validateRequest(CreateVisitSchema),
  VisitController.create
);

// Get visits with query filters
router.get(
  '/',
  validateRequest(VisitQuerySchema, 'query'),
  VisitController.getAll
);

// Get patient medical history
router.get(
  '/patient/:patient_id/history',
  VisitController.getPatientHistory
);

// Get visit by ID
router.get(
  '/:id',
  VisitController.getById
);

// Update visit
router.put(
  '/:id',
  validateRequest(UpdateVisitSchema),
  VisitController.update
);

export { router as visitRoutes };

