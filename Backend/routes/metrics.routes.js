import express from 'express';
import { getAllMetrics } from '../controllers/metrics.controllers.js';
import authenticateUser from '../middleware/auth.middleware.js';

const router = express.Router();

// Require a valid login token before accessing metrics
router.use(authenticateUser);

router.get('/:deviceId', getAllMetrics);

export default router;
