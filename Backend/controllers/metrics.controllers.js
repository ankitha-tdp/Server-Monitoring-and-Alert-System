
import supabase from '../config/supabase.js';
import * as metricService from '../services/metrics.services.js';

export const getAllMetrics = async (req, res) => {
    try {
        const { deviceId } = req.params;

        if (!deviceId) {
            return res.status(400).json({
                error: 'Device ID is required'
            });
        }

        // Verify that this device belongs to the logged-in user
        const { data: device, error } = await supabase
            .from('devices')
            .select('id')
            .eq('id', deviceId)
            .eq('user_id', req.user.id)
            .single();

        if (error || !device) {
            return res.status(404).json({
                error: 'Device not found'
            });
        }

        const metrics = await metricService.fetchAllDeviceMetrics(deviceId);

        return res.status(200).json({
            success: true,
            data: metrics
        });

    } catch (error) {
        console.error('Error in getAllMetrics controller:', error);
        return res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};
