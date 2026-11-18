
import { registerUser, loginUser } from '../services/auth.services.js';

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
