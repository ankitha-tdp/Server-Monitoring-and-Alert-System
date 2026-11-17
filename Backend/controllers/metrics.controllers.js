import * as metricService from '../services/metricService.js';

export const getCpuMetrics = async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    const metrics = await metricService.fetchDeviceCpuMetrics(deviceId);
    
    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error in getCpuMetrics controller:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};