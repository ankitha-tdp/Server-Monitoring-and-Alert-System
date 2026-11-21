
import express from 'express';
import { register, login } from '../controllers/auth.controllers.js';
import authenticateUser from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', authenticateUser, (req, res) => {
    res.status(200).json({
        message: 'User authenticated successfully',
        user: req.user
    });
});

export default router;
