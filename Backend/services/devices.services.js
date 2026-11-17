import { supabase } from '../config/supabase.js';

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