import express from 'express';
import { 
  registerDevice, 
  getDeviceScript, 
  updateDevice, 
  deleteDevice,
  getDevices
} from '../controllers/devices.controllers.js';
import authenticateUser from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', registerDevice);
router.get('/', getDevices);
router.get('/script/:deviceId', getDeviceScript);
router.patch('/:deviceId', updateDevice);   
router.delete('/:deviceId', deleteDevice); 

export default router;