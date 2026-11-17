import express from 'express';
import { getCpuMetrics } from '../controllers/metricController.js';

const router = express.Router();

// GET /api/metrics/:deviceId/cpu
router.get('/:deviceId/cpu', getCpuMetrics);

export default router;