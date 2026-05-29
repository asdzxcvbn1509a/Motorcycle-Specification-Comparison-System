import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, me } from '../controllers/auth.controller.js';
import { authRequired } from '../middleware/auth.middleware.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'พยายามล็อกอินบ่อยเกินไป กรุณารอ 15 นาทีแล้วลองใหม่' },
});

router.post('/login', loginLimiter, login);
router.post('/logout', authRequired, logout);
router.get('/me', authRequired, me);

export default router;
