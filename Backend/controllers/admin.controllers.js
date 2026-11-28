
import supabase from '../config/supabase.js';

// Get all registered users
export const getAllUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({
            success: true,
            count: data.length,
            users: data
        });
    } catch (error) {
        console.error('Get users error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

// Get all registered devices
export const getAllDevices = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('devices')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({
            success: true,
            count: data.length,
            devices: data
        });
    } catch (error) {
        console.error('Get devices error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch devices'
        });
    }
};

// Delete a user
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};
