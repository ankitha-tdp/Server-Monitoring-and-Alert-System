import * as metricService from '../services/metricService.js';

export const getAllMetrics = async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    const metrics = await metricService.fetchAllDeviceMetrics(deviceId);
    
    return res.status(200).json({
      success: true,
      data: metrics, // Returns { cpu: [...], memory: [...], disk: [...] }
    });
  } catch (error) {
    console.error('Error in getAllMetrics controller:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};