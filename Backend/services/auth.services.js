
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import supabase from '../config/supabase.js';

dotenv.config();

// Use the publishable key for user authentication.
// Never expose the service-role key to the frontend.
const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY
);

// Register a new user
export const registerUser = async (fullName, email, password) => {
    const { data, error } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            }
        }
    });

    if (error) throw error;

    return data;
};

// Login an existing user
export const loginUser = async (email, password) => {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;

    return data;
};
// Logout the current user
export const logoutUser = async (accessToken) => {
    const { error } = await supabase.auth.admin.signOut(
        accessToken,
        'global'
    );

    if (error) throw error;
};