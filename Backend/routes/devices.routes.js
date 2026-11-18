import express from 'express';
import { 
  registerDevice, 
  getDeviceScript, 
  updateDevice, 
  deleteDevice 
} from '../controllers/deviceController.js';

const router = express.Router();

router.post('/', registerDevice);
router.get('/script/:deviceId', getDeviceScript);
router.patch('/:deviceId', updateDevice);   
router.delete('/:deviceId', deleteDevice); 

export default router;