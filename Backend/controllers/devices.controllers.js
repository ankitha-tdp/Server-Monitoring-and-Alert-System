import  supabase  from '../config/supabase.js';
import { generateTelegrafSetupScript } from '../utils/generateTelegrafScript.js';
import { fetchDevicesByRole } from '../services/devices.services.js';

// POST /api/devices - Aligned with schema columns
export const registerDevice = async (req, res) => {
  try {
    const { device_name, hostname, ip_address, user_id, os_name, os_version } = req.body;

    if (!device_name || !hostname) {
      return res.status(400).json({ 
        success: false, 
        error: 'device_name and hostname are required' 
      });
    }

    const { data, error } = await supabase
      .from('devices')
      .insert([{
        user_id: user_id || null,
        device_name,
        hostname,
        ip_address: ip_address || null,
        os_name: os_name || 'Windows',
        os_version: os_version || '11',
        agent_status: 'online',
      }])
      .select();

    if (error) throw new Error(error.message );

    return res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: data[0],
    });
  } catch (error) {
    console.error('Error in registerDevice:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/devices/script/:deviceId
export const getDeviceScript = (req, res) => {
  try {
    const { deviceId } = req.params; // Using schema primary key 'id'

    if (!deviceId) {
      return res.status(400).send('# Error: Device ID is required');
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
      .eq('id', deviceId);

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
    // Supports ?user_id=... or x-user-id header for Hoppscotch testing (or req.user.id once auth middleware is added)
    const userId = req.user?.id || req.query.user_id || req.headers['x-user-id'];

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