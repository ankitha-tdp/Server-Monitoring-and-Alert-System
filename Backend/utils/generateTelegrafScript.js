import fs from 'fs';
import path from 'path';

export const generateTelegrafSetupScript = (deviceId, influxUrl, influxToken, influxOrg, influxBucket) => {
  return `
# ==========================================
# Telegraf Automated Setup Script for Windows
# Device ID: ${deviceId}
# ==========================================

$ErrorActionPreference = "Stop"
$TelegrafDir = "C:\\Program Files\\Telegraf"

Write-Host "📂 Creating Telegraf directory..."
if (!(Test-Path $TelegrafDir)) {
    New-Item -ItemType Directory -Force -Path $TelegrafDir | Out-Null
}

Write-Host "📝 Generating telegraf.conf..."
$ConfigContent = @'
[global_tags]
  device_id = "${deviceId}"

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
  logfile = ""
  hostname = ""
  omit_hostname = false

[[outputs.influxdb_v2]]
  urls = ["${influxUrl}"]
  token = "${influxToken}"
  organization = "${influxOrg}"
  bucket = "${influxBucket}"

[[inputs.cpu]]
  percpu = false
  totalcpu = true
  collect_cpu_time = false
  report_active = false

[[inputs.mem]]

[[inputs.disk]]
  mount_points = ["C:\\"]
  ignore_fs = ["tmpfs", "devtmpfs", "overlay", "aufs", "squashfs"]
'@

$ConfigPath = Join-Path $TelegrafDir "telegraf.conf"
Set-Content -Path $ConfigPath -Value $ConfigContent
Write-Host "✅ Configuration saved to $ConfigPath"

Write-Host "🚀 To run Telegraf manually with this config, use:"
Write-Host "cd '$TelegrafDir'" -ForegroundColor Cyan
Write-Host "telegraf --config telegraf.conf" -ForegroundColor Cyan
`;
};