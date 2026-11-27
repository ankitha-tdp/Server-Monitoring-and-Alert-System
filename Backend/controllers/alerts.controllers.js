import supabase from '../config/supabase.js';

// Create a new alert rule
export const createAlertRule = async (req, res) => {
    try {
        const {
            device_id,
            metric_type,
            operator,
            threshold_value,
            severity,
            cooldown_minutes = 15
        } = req.body;

        if (!metric_type || !operator || threshold_value === undefined || !severity) {
            return res.status(400).json({
                error: 'Required alert rule fields are missing'
            });
        }
        
        if (!device_id) {
            return res.status(400).json({
                error: 'Device ID is required'
            });
        }

        const { data: device, error: deviceError } = await supabase
            .from('devices')
            .select('id')
            .eq('id', device_id)
            .eq('user_id', req.user.id)
            .maybeSingle();

        if (deviceError) throw deviceError;

        if (!device) {
            return res.status(404).json({
                error: 'Device not found'
            });
        }

        const { data, error } = await supabase
            .from('alert_rules')
            .insert({
                user_id: req.user.id,
                device_id: device_id || null,
                metric_type,
                operator,
                threshold_value,
                severity,
                cooldown_minutes
            })
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            message: 'Alert rule created successfully',
            rule: data
        });

    } catch (error) {
        console.error('Create alert rule error:', error.message);
        return res.status(500).json({
            error: 'Failed to create alert rule'
        });
    }
};

// Get all alert rules for the logged-in user
export const getAlertRules = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('alert_rules')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({ rules: data });
    } catch (error) {
        console.error('Get alert rules error:', error.message);
        return res.status(500).json({ error: 'Failed to fetch alert rules' });
    }
};

// Update an alert rule
export const updateAlertRule = async (req, res) => {
    try {
        const { ruleId } = req.params;
        const allowedFields = [
            'metric_type',
            'operator',
            'threshold_value',
            'severity',
            'is_enabled',
            'cooldown_minutes'
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                error: 'No valid fields provided for update'
            });
        }

        const { data, error } = await supabase
            .from('alert_rules')
            .update(updates)
            .eq('id', ruleId)
            .eq('user_id', req.user.id)
            .select()
            .maybeSingle();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Alert rule not found' });

        return res.status(200).json({ rule: data });
    } catch (error) {
        console.error('Update alert rule error:', error.message);
        return res.status(500).json({ error: 'Failed to update alert rule' });
    }
};

// Delete an alert rule
export const deleteAlertRule = async (req, res) => {
    try {
        const { ruleId } = req.params;

        const { data, error } = await supabase
            .from('alert_rules')
            .delete()
            .eq('id', ruleId)
            .eq('user_id', req.user.id)
            .select()
            .maybeSingle();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Alert rule not found' });

        return res.status(200).json({ message: 'Alert rule deleted successfully' });
    } catch (error) {
        console.error('Delete alert rule error:', error.message);
        return res.status(500).json({ error: 'Failed to delete alert rule' });
    }
};

// Get alert history for the logged-in user
export const getAlerts = async (req, res) => {
    try {
        // First get devices owned by this user
        const { data: devices, error: deviceError } = await supabase
            .from('devices')
            .select('id')
            .eq('user_id', req.user.id);

        if (deviceError) throw deviceError;

        const deviceIds = devices.map(device => device.id);

        if (deviceIds.length === 0) {
            return res.status(200).json({ alerts: [] });
        }

        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .in('device_id', deviceIds)
            .order('triggered_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({ alerts: data });

    } catch (error) {
        console.error('Get alerts error:', error.message);
        return res.status(500).json({
            error: 'Failed to fetch alerts'
        });
    }
};

// Acknowledge an alert
export const acknowledgeAlert = async (req, res) => {
    try {
        const { alertId } = req.params;

        const { data: devices, error: deviceError } = await supabase
            .from('devices')
            .select('id')
            .eq('user_id', req.user.id);

        if (deviceError) throw deviceError;

        const deviceIds = devices.map(device => device.id);

        const { data, error } = await supabase
            .from('alerts')
            .update({
                status: 'acknowledged',
                acknowledged_at: new Date().toISOString()
            })
            .eq('id', alertId)
            .in('device_id', deviceIds)
            .eq('status', 'active')
            .select()
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Active alert not found' });
        }

        return res.status(200).json({
            message: 'Alert acknowledged successfully',
            alert: data
        });

    } catch (error) {
        console.error('Acknowledge alert error:', error.message);
        return res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
};


// Resolve an alert
export const resolveAlert = async (req, res) => {
    try {
        const { alertId } = req.params;

        const { data: devices, error: deviceError } = await supabase
            .from('devices')
            .select('id')
            .eq('user_id', req.user.id);

        if (deviceError) throw deviceError;

        const deviceIds = devices.map(device => device.id);

        const { data, error } = await supabase
            .from('alerts')
            .update({
                status: 'resolved',
                resolved_at: new Date().toISOString()
            })
            .eq('id', alertId)
            .in('device_id', deviceIds)
            .in('status', ['active', 'acknowledged'])
            .select()
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({
                error: 'Unresolved alert not found'
            });
        }

        return res.status(200).json({
            message: 'Alert resolved successfully',
            alert: data
        });

    } catch (error) {
        console.error('Resolve alert error:', error.message);
        return res.status(500).json({ error: 'Failed to resolve alert' });
    }
};