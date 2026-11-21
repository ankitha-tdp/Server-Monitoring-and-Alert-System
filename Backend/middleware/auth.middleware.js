
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

export default authenticateUser;
