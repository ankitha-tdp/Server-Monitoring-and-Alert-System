import supabase from '../config/supabase.js';

// Check whether a metric crosses its alert threshold
const checkThreshold = (value, operator, threshold) => {
    switch (operator) {
        case '>': return value > threshold;
        case '>=': return value >= threshold;
        case '<': return value < threshold;
        case '<=': return value <= threshold;
        case '=': return value === threshold;
        default: return false;
    }
};

// Evaluate a metric against enabled alert rules
export const evaluateAlertRules = async (deviceId, metrics) => {
    const { data: rules, error } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('device_id', deviceId)
        .eq('is_enabled', true);

    if (error) throw error;

    const metricMap = {
    cpu: metrics.cpu,
    ram: metrics.memory,
    memory: metrics.memory,
    disk: metrics.disk
};

    for (const rule of rules) {
        const readings = metricMap[rule.metric_type];
        const latest = readings?.[readings.length - 1];

        if (!latest || latest.value == null) continue;

        const breached = checkThreshold(
            Number(latest.value),
            rule.operator,
            Number(rule.threshold_value)
        );

        if (!breached) continue;

        // Check the most recent alert for this rule
        const { data: previousAlert, error: previousError } = await supabase
            .from('alerts')
            .select('triggered_at')
            .eq('rule_id', rule.id)
            .order('triggered_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (previousError) throw previousError;

        const cooldownMs = (rule.cooldown_minutes ?? 15) * 60 * 1000;

        if (
            previousAlert &&
            Date.now() - new Date(previousAlert.triggered_at).getTime() < cooldownMs
        ) {
            continue;
        }

        const { error: insertError } = await supabase
            .from('alerts')
            .insert({
                device_id: deviceId,
                rule_id: rule.id,
                metric_type: rule.metric_type,
                metric_value: latest.value,
                threshold_value: rule.threshold_value,
                severity: rule.severity,
                message: `${rule.metric_type} crossed its configured threshold`,
                status: 'active'
            });

        if (insertError) throw insertError;
    }
};