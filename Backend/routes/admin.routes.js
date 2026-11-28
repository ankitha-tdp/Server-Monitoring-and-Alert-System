
import express from 'express';
import authenticateUser, {
    requireAdmin
} from '../middleware/auth.middleware.js';

import {
    getAllUsers,
    getAllDevices,
    deleteUser
} from '../controllers/admin.controllers.js';

const router = express.Router();

router.use(authenticateUser, requireAdmin);

router.get('/users', getAllUsers);
router.get('/devices', getAllDevices);
router.delete('/users/:userId', deleteUser);

export default router;
