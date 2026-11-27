import supabase from '../config/supabase.js';
import { generateTelegrafConfig } from '../utils/generateTelegrafConfig.js';
import {
  fetchDevicesByRole,
  insertDevice
} from '../services/devices.services.js';


// POST /api/devices - Aligned with schema columns

export const registerDevice = async (req, res) => {
  try {
    const {
      device_name,
      hostname,
      ip_address,
      os_name,
      os_version
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!device_name?.trim() || !hostname?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'device_name and hostname are required'
      });
    }

    const device = await insertDevice({
      user_id: userId,
      device_name: device_name.trim(),
      hostname: hostname.trim(),
      ip_address: ip_address || null,
      os_name: os_name || 'Windows',
      os_version: os_version || '11',
      agent_status: 'offline'
    });

    return res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: device
    });

  } catch (error) {
    console.error('Error in registerDevice:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
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

//GET all devices of user
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


export const getDeviceConfig = async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required'
      });
    }

    // Verify device ownership.
    const { data: device, error } = await supabase
      .from('devices')
      .select('id, device_name, os_name')
      .eq('id', deviceId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }

    if (device.os_name?.toLowerCase() !== 'windows') {
      return res.status(400).json({
        success: false,
        error: 'Configuration currently supports Windows devices only'
      });
    }

    const config = generateTelegrafConfig(
      device.id,
      process.env.INFLUX_URL,
      process.env.INFLUX_TOKEN_WRITE,
      process.env.INFLUX_ORG,
      process.env.INFLUX_BUCKET || 'hardware-metrics'
    );

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="telegraf-${device.id}.conf"`
    );
    res.setHeader('Cache-Control', 'no-store');

    return res.status(200).send(config);

  } catch (error) {
    console.error('Error generating device config:', error);

    return res.status(500).json({
      success: false,
      error: 'Could not generate device configuration'
    });
  }
};
