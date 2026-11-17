import express from 'express';
import { registerDevice } from '../controllers/deviceController.js';

const router = express.Router();

// POST /api/devices
router.post('/', registerDevice);

export default router;