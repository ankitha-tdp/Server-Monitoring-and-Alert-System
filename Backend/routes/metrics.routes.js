import express from 'express';
import { getAllMetrics } from '../controllers/metrics.controllers.js';

const router = express.Router();

// GET /api/metrics/:deviceId
router.get('/:deviceId', getAllMetrics);

export default router;