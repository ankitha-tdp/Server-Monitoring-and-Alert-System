import express from 'express';

import {
  registerDevice,
  getDeviceConfig,
  updateDevice,
  deleteDevice,
  getDevices
} from '../controllers/devices.controllers.js';

import authenticateUser from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', registerDevice);
router.get('/', getDevices);

// Download device-specific Telegraf configuration
router.get('/config/:deviceId', getDeviceConfig);

router.patch('/:deviceId', updateDevice);
router.delete('/:deviceId', deleteDevice);

export default router;
