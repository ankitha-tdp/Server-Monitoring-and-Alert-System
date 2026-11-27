export const generateTelegrafSetupScript = (
  deviceId,
  influxUrl,
  influxToken,
  influxOrg,
  influxBucket = 'hardware-metrics'
) => {
  const safeDeviceId = String(deviceId ?? '');
  const safeInfluxUrl = String(influxUrl ?? '');
  const safeInfluxToken = String(influxToken ?? '');
  const safeInfluxOrg = String(influxOrg ?? '');
  const safeInfluxBucket = String(influxBucket ?? 'hardware-metrics');

  return `
# ==========================================
# Telegraf Automated Setup Script for Windows
# Device ID: ${safeDeviceId}
# ==========================================

$DeviceId     = "${safeDeviceId}"
$InfluxUrl    = "${safeInfluxUrl}"
$InfluxToken  = "${safeInfluxToken}"
$InfluxOrg    = "${safeInfluxOrg}"
$InfluxBucket = "${safeInfluxBucket}"

if ([string]::IsNullOrWhiteSpace($InfluxToken)) {
    throw "InfluxDB Write-Only Token is missing."
}

$ErrorActionPreference = "Stop"
$TelegrafDir = "C:\\Program Files\\Telegraf"
$TelegrafExe = Join-Path $TelegrafDir "telegraf.exe"

Write-Host "📂 Creating Telegraf directory..."
if (!(Test-Path -Path $TelegrafDir)) {
    New-Item -ItemType Directory -Force -Path $TelegrafDir | Out-Null
}

if (!(Test-Path -Path $TelegrafExe)) {
    if (Get-Command telegraf -ErrorAction SilentlyContinue) {
        Write-Host "📦 Found telegraf in PATH. Copying to $TelegrafDir..." -ForegroundColor Cyan
        Copy-Item -Path (Get-Command telegraf).Source -Destination $TelegrafExe -Force
    } elseif (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "⬇️ Installing Telegraf via winget..." -ForegroundColor Cyan
        winget install --id InfluxData.Telegraf -e --accept-source-agreements --accept-package-agreements
        $found = Get-ChildItem -Path "C:\\Program Files" -Filter "telegraf.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found -and $found.FullName -ne $TelegrafExe) {
            Copy-Item -Path $found.FullName -Destination $TelegrafExe -Force
        }
    }
}

if (!(Test-Path -Path $TelegrafExe)) {
    throw "telegraf.exe not found. Install Telegraf first, then re-run this block."
}

Write-Host "📝 Generating telegraf.conf..."
$ConfigContent = @"
[global_tags]
  device_id = "$DeviceId"

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
  urls = ["$InfluxUrl"]
  token = "$InfluxToken"
  organization = "$InfluxOrg"
  bucket = "$InfluxBucket"

[[inputs.cpu]]
  percpu = false
  totalcpu = true
  collect_cpu_time = false
  report_active = false

[[inputs.mem]]

[[inputs.disk]]
  mount_points = ["C:\\\\"]
  ignore_fs = ["tmpfs", "devtmpfs", "overlay", "aufs", "squashfs"]
"@

$ConfigPath = Join-Path $TelegrafDir "telegraf.conf"
Set-Content -Path $ConfigPath -Value $ConfigContent -Encoding UTF8
Write-Host "✅ Configuration saved to $ConfigPath"

Write-Host "🚀 Starting Telegraf..." -ForegroundColor Green
Set-Location -Path $TelegrafDir
& $TelegrafExe --config $ConfigPath
`;
};