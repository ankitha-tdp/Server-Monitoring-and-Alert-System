import supabase from '../config/supabase.js';
import { generateTelegrafSetupScript } from '../utils/generateTelegrafScript.js';

export const insertDevice = async (deviceData) => {
  const { data, error } = await supabase
    .from('devices')
    .insert([deviceData])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data[0];
};

export const createDeviceWithSetupScript = async (deviceData, scriptConfig = {}) => {
  const createdDevice = await insertDevice(deviceData);

  // Pass createdDevice (and any config your script helper needs)
  const setupScript = generateTelegrafSetupScript(createdDevice, scriptConfig);

  return {
    device: createdDevice,
    setupScript,
  };
};

export const fetchDevicesByRole = async (userId) => {
  // 1. Fetch the requester's role from profiles ('admin' | 'user')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    const err = new Error('Profile not found');
    err.statusCode = 404;
    throw err;
  }

  // 2. Build the devices query based on role
  let query = supabase
    .from('devices')
    .select('*')
    .order('created_at', { ascending: false });

  if (profile.role !== 'admin') {
    query = query.eq('user_id', profile.id);
  }

  const { data: devices, error: devicesError } = await query;

  if (devicesError) {
    const err = new Error(devicesError.message);
    err.statusCode = 400;
    throw err;
  }

  return {
    role: profile.role,
    devices,
  };
};