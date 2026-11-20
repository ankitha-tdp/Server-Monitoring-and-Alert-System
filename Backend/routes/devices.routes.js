import express from 'express';
import { 
  registerDevice, 
  getDeviceScript, 
  updateDevice, 
  deleteDevice,
  getDevices
} from '../controllers/devices.controllers.js';

const router = express.Router();

router.post('/', registerDevice);
router.get('/', getDevices);
router.get('/script/:deviceId', getDeviceScript);
router.patch('/:deviceId', updateDevice);   
router.delete('/:deviceId', deleteDevice); 

export default router;