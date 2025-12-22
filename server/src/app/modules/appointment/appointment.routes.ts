import { Router } from 'express';
import { AppointmentController } from './appointment.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { CreateAppointmentSchema, UpdateAppointmentSchema, AppointmentQuerySchema } from './appointment.dto';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create appointment
router.post(
  '/',
  validateRequest(CreateAppointmentSchema),
  AppointmentController.create
);

// Get appointments with query filters
router.get(
  '/',
  validateRequest(AppointmentQuerySchema, 'query'),
  AppointmentController.getAll
);

// Get today's appointments for a doctor
router.get(
  '/doctor/:doctor_id/today',
  AppointmentController.getTodays
);

// Get tomorrow's appointments for a doctor
router.get(
  '/doctor/:doctor_id/tomorrow',
  AppointmentController.getTomorrows
);

// Get completed appointments for a doctor
router.get(
  '/doctor/:doctor_id/completed',
  AppointmentController.getCompleted
);

// Get appointment by ID
router.get(
  '/:id',
  AppointmentController.getById
);

// Update appointment
router.put(
  '/:id',
  validateRequest(UpdateAppointmentSchema),
  AppointmentController.update
);

// Cancel appointment
router.patch(
  '/:id/cancel',
  AppointmentController.cancel
);

export { router as appointmentRoutes };

