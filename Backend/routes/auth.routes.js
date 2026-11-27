
import express from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controllers.js';
import authenticateUser from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', authenticateUser, getMe);

router.post('/logout', authenticateUser, logout);

export default router;
