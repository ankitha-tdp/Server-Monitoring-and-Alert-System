import  supabase  from '../config/supabase.js';
import { generateTelegrafSetupScript } from '../utils/generateTelegrafScript.js';
import { fetchDevicesByRole, createDeviceWithSetupScript } from '../services/devices.services.js';

// POST /api/devices - Aligned with schema columns
export const registerDevice = async (req, res) => {
  try {
    const { device_name, hostname, ip_address, os_name, os_version } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required',
      });
    }

    if (!device_name || !hostname) {
      return res.status(400).json({
        success: false,
        error: 'device_name and hostname are required',
      });
    }

    const { device, setupScript } = await createDeviceWithSetupScript(
      {
        user_id: userId,
        device_name,
        hostname,
        ip_address: ip_address || null,
        os_name: os_name || 'Windows',
        os_version: os_version || '11',
        agent_status: 'online',
      },
      {
        telegrafVersion: process.env.TELEGRAF_VERSION,
        influxUrl: process.env.INFLUX_URL,
        influxOrg: process.env.INFLUX_ORG,
        influxBucket: process.env.INFLUX_BUCKET,
        influxToken: process.env.INFLUX_TOKEN,
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: device,
      setup_script: setupScript,
    });
  } catch (error) {
    console.error('Error in registerDevice:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/devices/script/:deviceId
export const getDeviceScript = async (req, res) => {
    try {
    const { deviceId } = req.params; // Using schema primary key 'id'

    if (!deviceId) {
      return res.status(400).send('# Error: Device ID is required');
    }

    const { data: device, error } = await supabase
        .from('devices')
        .select('id')
        .eq('id', deviceId)
        .eq('user_id', req.user.id)
        .single();

      if (error || !device) {
        return res.status(404).send('# Error: Device not found');
      }

    // Using the device UUID as the global tag in Telegraf
    const script = generateTelegrafSetupScript(
      deviceId,
      process.env.INFLUX_URL,
      process.env.INFLUX_TOKEN,
      process.env.INFLUX_ORG,
      process.env.INFLUX_BUCKET
    );

    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(script);
  } catch (error) {
    console.error('Error generating script:', error);
    return res.status(500).send('# Internal Server Error');
  }
};

// PATCH /api/devices/:deviceId - Aligned with schema
export const updateDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { device_name, agent_status } = req.body;

    const { data, error } = await supabase
      .from('devices')
      .update({ device_name, agent_status })
      .eq('id', deviceId)
      .eq('user_id', req.user.id)
      .select();

    if (error) throw new Error(error.message);

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Device updated successfully',
      data: data[0],
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/devices/:deviceId - Aligned with schema
export const deleteDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', deviceId)
      .eq('user_id', req.user.id);

    if (error) throw new Error(error.message);

    return res.status(200).json({
      success: true,
      message: `Device ${deviceId} deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getDevices = async (req, res) => {
  try {
    // Get devices belonging to the authenticated user
    const userId = req.user.id;

    if (!userId || userId === 'undefined') {
      return res.status(400).json({ error: 'Valid user_id is required' });
    }

    const result = await fetchDevicesByRole(userId);

    return res.status(200).json({
      role: result.role,
      count: result.devices.length,
      devices: result.devices,
    });
  } catch (err) {
    console.error('Error in getDevices:', err);
    return res
      .status(err.statusCode || 500)
      .json({ error: err.message || 'Internal server error' });
  }
};