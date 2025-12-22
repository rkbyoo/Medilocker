import { Router } from 'express';
import { PatientController } from './patient.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { CreatePatientDto, SearchPatientsDto } from './patient.dto';

const router = Router();

// All patient routes require authentication
router.use(authenticate);

// Register new patient
router.post(
  '/',
  validateRequest(CreatePatientDto),
  PatientController.register
);

// Get patient by ID
router.get('/:id', PatientController.getById);

// Search/list patients
router.get(
  '/',
  validateRequest(SearchPatientsDto, 'query'),
  PatientController.search
);

export default router;

