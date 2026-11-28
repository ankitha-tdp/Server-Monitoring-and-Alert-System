
import supabase from '../config/supabase.js';

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Access token is required'
            });
        }

        const token = authHeader.split(' ')[1];

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                message: 'Invalid or expired access token'
            });
        }

        req.user = data.user;
        next();

    } catch (error) {
        console.error('Authentication error:', error.message);

        return res.status(500).json({
            message: 'Authentication failed'
        });
    }
};

// Check whether the authenticated user is an admin
export const requireAdmin = async (req, res, next) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (error || !profile) {
            return res.status(403).json({
                message: 'User profile not found'
            });
        }

        if (profile.role !== 'admin') {
            return res.status(403).json({
                message: 'Admin access required'
            });
        }

        next();

    } catch (error) {
        console.error('Admin authorization error:', error.message);

        return res.status(500).json({
            message: 'Authorization failed'
        });
    }
};

export default authenticateUser;
