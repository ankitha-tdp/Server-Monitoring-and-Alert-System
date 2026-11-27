
export const generateTelegrafConfig = (
  deviceId,
  deviceName,
  influxUrl,
  influxToken,
  influxOrg,
  influxBucket = 'hardware-metrics'
) => {
  if (!deviceId || !deviceName || !influxUrl || !influxToken || !influxOrg) {
    throw new Error('Missing required Telegraf configuration values');
  }

  // Escape values before inserting them into TOML strings.
  const escapeToml = (value) =>
    String(value)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');

  return `
[global_tags]
  device_id = "${escapeToml(deviceId)}"
  device_name = "${escapeToml(deviceName)}"

[agent]
  interval = "10s"
  round_interval = true
  metric_batch_size = 1000
  metric_buffer_limit = 10000
  collection_jitter = "0s"
  flush_interval = "10s"
  flush_jitter = "0s"
  precision = ""
  debug = false
  quiet = false
  hostname = ""
  omit_hostname = false

[[outputs.influxdb_v2]]
  urls = ["${escapeToml(influxUrl)}"]
  token = "${escapeToml(influxToken)}"
  organization = "${escapeToml(influxOrg)}"
  bucket = "${escapeToml(influxBucket)}"

[[inputs.cpu]]
  percpu = false
  totalcpu = true
  collect_cpu_time = false
  report_active = false

[[inputs.mem]]

[[inputs.disk]]
  ignore_fs = [
    "tmpfs",
    "devtmpfs",
    "overlay",
    "aufs",
    "squashfs"
  ]
`.trim();
};
