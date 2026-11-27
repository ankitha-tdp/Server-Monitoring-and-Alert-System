import express from 'express';
import authenticateUser from '../middleware/auth.middleware.js';
import {
    createAlertRule,
    getAlertRules,
    updateAlertRule,
    deleteAlertRule,
    getAlerts,
    acknowledgeAlert,
    resolveAlert
} from '../controllers/alerts.controllers.js';
const router = express.Router();

router.use(authenticateUser);

router.post('/rules', createAlertRule);
router.get('/rules', getAlertRules);
router.patch('/rules/:ruleId', updateAlertRule);
router.delete('/rules/:ruleId', deleteAlertRule);
router.get('/', getAlerts);
router.patch('/:alertId/acknowledge', acknowledgeAlert);
router.patch('/:alertId/resolve', resolveAlert);

export default router;