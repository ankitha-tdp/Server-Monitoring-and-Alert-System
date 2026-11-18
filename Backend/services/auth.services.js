
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
