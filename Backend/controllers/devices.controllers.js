import * as deviceService from '../services/deviceService.js';

export const registerDevice = async (req, res) => {
  try {
    const { device_id, name, user_id, status } = req.body;

    // Validate required fields
    if (!device_id || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Both device_id and name are required' 
      });
    }

    const newDevice = await deviceService.insertDevice({
      device_id,
      name,
      user_id: user_id || null,
      status: status || 'online',
    });

    return res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: newDevice,
    });
  } catch (error) {
    console.error('Error in registerDevice controller:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    });
  }
};