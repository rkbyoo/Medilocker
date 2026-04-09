import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { RegisterDto, LoginDto, RefreshTokenDto, SendOtpDto, VerifyOtpDto } from './auth.dto';

const router = Router();

router.post('/register', validateRequest(RegisterDto), AuthController.register);
router.post('/login', validateRequest(LoginDto), AuthController.login);
router.post('/refresh', validateRequest(RefreshTokenDto), AuthController.refresh);
router.post('/logout', validateRequest(RefreshTokenDto), AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.post('/otp/send', validateRequest(SendOtpDto), AuthController.sendOtp);
router.post('/otp/verify', validateRequest(VerifyOtpDto), AuthController.verifyOtp);

export default router;