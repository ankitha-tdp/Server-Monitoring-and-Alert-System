
import { registerUser, loginUser, logoutUser } from '../services/auth.services.js';
import supabase from '../config/supabase.js';

// Handle user registration
export const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: 'Full name, email and password are required'
            });
        }

        const data = await registerUser(fullName, email, password);

        return res.status(201).json({
            message: 'Registration successful. Check your email if confirmation is required.',
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error('Registration error:', error.message);

        return res.status(400).json({
            message: error.message
        });
    }
};

// Handle user login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const data = await loginUser(email, password);

        return res.status(200).json({
            message: 'Login successful',
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(401).json({
            message: 'Invalid email or password'
        });
    }
};

// Get authenticated user's profile
export const getMe = async (req, res) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (error || !profile) {
            return res.status(404).json({
                message: 'User profile not found'
            });
        }

        return res.status(200).json({
            message: 'User authenticated successfully',
            user: {
                ...req.user,
                role: profile.role
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error.message);
        return res.status(500).json({
            message: 'Failed to fetch user profile'
        });
    }
};

export const logout = async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];

        if (!accessToken) {
            return res.status(401).json({ message: 'Access token required' });
        }

        await logoutUser(accessToken);

        return res.status(200).json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error.message);
        return res.status(500).json({ message: 'Logout failed' });
    }
};