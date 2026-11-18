import { supabase } from '../config/supabase.js';
import { generateTelegrafSetupScript } from '../utils/generateTelegrafScript.js';
import crypto from 'crypto';

// POST /api/devices (Generates unique device_id automatically)
export const registerDevice = async (req, res) => {
  try {
    const { name, user_id, status } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Device name is required' 
      });
    }

    // Automatically generate Windows device ID (e.g., dev_win_a1b2c3d4)
    const device_id = `dev_win_${crypto.randomUUID().slice(0, 8)}`;

    const { data, error } = await supabase
      .from('devices')
      .insert([{
        device_id,
        name,
        user_id: user_id || null,
        status: status || 'online',
      }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: data[0],
    });
  } catch (error) {
    console.error('Error in registerDevice controller:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    });
  }
};


// GET /api/devices/script/:deviceId
export const getDeviceScript = (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).send('# Error: Device ID is required');
    }

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


// PATCH /api/devices/:deviceId (Update device name or status)
export const updateDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { name, status } = req.body;

    const { data, error } = await supabase
      .from('devices')
      .update({ name, status, updated_at: new Date() })
      .eq('device_id', deviceId)
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
    console.error('Error updating device:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


// DELETE /api/devices/:deviceId (Revoke/Delete device)
export const deleteDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('device_id', deviceId);

    if (error) throw new Error(error.message);

    return res.status(200).json({
      success: true,
      message: `Device ${deviceId} deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};