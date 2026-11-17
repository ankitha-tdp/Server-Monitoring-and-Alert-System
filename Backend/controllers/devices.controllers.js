import { supabase } from '../config/supabase.js';
import { generateTelegrafSetupScript } from '../utils/generateTelegrafScript.js';

export const registerDevice = async (req, res) => {
  try {
    const { device_id, name, user_id, status } = req.body;

    if (!device_id || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Both device_id and name are required' 
      });
    }

    // 1. Insert into Supabase (will work once your keys are added)
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

    const newDevice = data[0];

    // 2. Automatically generate the Telegraf setup script for this device
    const setupScript = generateTelegrafSetupScript(
      device_id,
      process.env.INFLUX_URL,
      process.env.INFLUX_TOKEN,
      process.env.INFLUX_ORG,
      process.env.INFLUX_BUCKET
    );

    // 3. Return the registered device record along with the ready-to-run script
    return res.status(201).json({
      success: true,
      message: 'Device registered successfully and setup script generated',
      data: {
        device: newDevice,
        setupScript: setupScript, // Frontend can display this or let the user copy/download it
      },
    });
  } catch (error) {
    console.error('Error in registerDevice controller:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    });
  }
};