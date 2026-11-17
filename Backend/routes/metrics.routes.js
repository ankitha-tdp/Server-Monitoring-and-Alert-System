import express from 'express';
import { getAllMetrics } from '../controllers/metricController.js';

const router = express.Router();

// GET /api/metrics/:deviceId
router.get('/:deviceId', getAllMetrics);

export default router;