import express from 'express';
import cors from 'cors';
import { authRoutes } from '../modules/auth';
import { userRoutes } from '../modules/user';
import { patientRoutes } from '../modules/patient';
import { appointmentRoutes } from '../modules/appointment';
import { visitRoutes } from '../modules/visit';
import { errorHandler, notFoundHandler } from '../middlewares/error.middleware';

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:4000', // Server itself
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4000',
  // Allow Electron file:// protocol
  'file://',
  null, // Allow requests with no origin (Electron production)
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Electron, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/visits', visitRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;