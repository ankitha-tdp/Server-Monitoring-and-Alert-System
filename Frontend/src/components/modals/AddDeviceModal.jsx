import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Monitor,
  Terminal,
  FileCode,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const TELEGRAF_VERSION = '1.40.4';

const TELEGRAF_DOWNLOAD_URL =
  `https://dl.influxdata.com/telegraf/releases/telegraf-${TELEGRAF_VERSION}_windows_amd64.zip`;

const INSTALL_DIR = '$env:ProgramFiles\Telegraf';

export default function AddDeviceModal({
  isOpen,
  onClose,
  newDeviceName,
  setNewDeviceName,
  newDeviceOs,
  setNewDeviceOs,
  generatedDevice,
  setGeneratedDevice,
  setupScript = '',
  copiedCmd,
  onSubmit,
  onDownloadConfig,
  submitting = false,
  error = ''
}) {
  const [step, setStep] = useState(0);
  const [copiedStep, setCopiedStep] = useState(null);
  const [configDownloading, setConfigDownloading] = useState(false);
  const [configDownloaded, setConfigDownloaded] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  useEffect(() => {
    if (generatedDevice) {
      setStep(1);
    } else {
      setStep(0);
    }
  }, [generatedDevice]);

  if (!isOpen) return null;

  const isRegistered = Boolean(generatedDevice);

  const deviceName =
    generatedDevice?.device_name ||
    generatedDevice?.name ||
    newDeviceName;

  const deviceId = generatedDevice?.id || '';

  const handleClose = () => {
    setStep(0);
    setCopiedStep(null);
    setConfigDownloaded(false);
    setDownloadError('');
    setGeneratedDevice?.(null);
    onClose?.();
  };

  const handleCopy = async (text, key) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedStep(key);
      setTimeout(() => setCopiedStep(null), 2000);
    } catch {
      setDownloadError('Could not copy command. Please copy it manually.');
    }
  };

  const handleDownloadConfig = async () => {
    if (!onDownloadConfig) {
      setDownloadError(
        'Configuration download is not connected yet. Please configure the backend endpoint.'
      );
      return;
    }

    try {
      setConfigDownloading(true);
      setDownloadError('');

      const result = await onDownloadConfig(deviceId);

      const configContent =
        typeof result === 'string'
          ? result
          : result?.config;

      if (!configContent) {
        throw new Error('The server returned an empty configuration.');
      }

      const blob = new Blob([configContent], {
        type: 'text/plain;charset=utf-8'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'telegraf.conf';

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setConfigDownloaded(true);
    } catch (err) {
      setDownloadError(
        err.message || 'Could not download device configuration.'
      );
    } finally {
      setConfigDownloading(false);
    }
  };

  const installCommands = [
    {
      title: 'Create installation folder',
      description: 'Create a dedicated folder for Telegraf.',
      command: `New-Item -ItemType Directory -Force -Path "$env:ProgramFiles\\Telegraf"`
    },
    {
      title: 'Move configuration and executable',
      description: 'After extracting the ZIP, place telegraf.exe and your downloaded telegraf.conf in this folder.',
      command: `# Expected folder contents:\n# C:\\Program Files\\Telegraf\\telegraf.exe\n# C:\\Program Files\\Telegraf\\telegraf.conf`
    },
    {
      title: 'Validate configuration',
      description: 'Check whether Telegraf can read your configuration.',
      command: `cd "$env:ProgramFiles\\Telegraf"\n.\\telegraf.exe --config .\\telegraf.conf --test`
    },
    {
      title: 'Install Windows service',
      description: 'Register Telegraf to run as a background service.',
      command: `cd "$env:ProgramFiles\\Telegraf"\n.\\telegraf.exe --service install --config "$PWD\\telegraf.conf"`
    },
    {
      title: 'Start monitoring',
      description: 'Start the service and configure automatic startup.',
      command: `Set-Service -Name telegraf -StartupType Automatic\nStart-Service -Name telegraf`
    },
    {
      title: 'Verify installation',
      description: 'Confirm that the service is running.',
      command: `Get-Service -Name telegraf`
    }
  ];

  const steps = [
    'Register',
    'Download',
    'Configure',
    'Connect'
  ];

  const currentStep = !isRegistered ? 0 : step;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100">

        {/* HEADER */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white">
              {isRegistered ? 'Set Up Device Monitoring' : 'Register New Device'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isRegistered
                ? `Installing monitoring agent for ${deviceName}`
                : 'Register a computer to monitor its hardware metrics.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP INDICATOR */}
        {isRegistered && (
          <div className="px-6 pt-5">
            <div className="flex items-center">
              {steps.map((label, index) => (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border ${
                        step > index
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : step === index
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-700 text-slate-500'
                      }`}
                    >
                      {step > index ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`text-[10px] ${
                        step === index ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {label}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-2 mb-5 ${
                      step > index ? 'bg-emerald-500' : 'bg-slate-700'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* STEP 1: REGISTER */}
          {!isRegistered && (
            <form onSubmit={onSubmit} className="space-y-5 text-xs">

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  Device Display Name
                </label>
                <input
                  type="text"
                  required
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="e.g. Home Lab Server"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  Target Operating System
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewDeviceOs('Windows 11 Pro (x64)')}
                    className={`py-3 px-3 rounded-xl border font-medium transition-all ${
                      newDeviceOs?.toLowerCase().includes('windows')
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="w-5 h-5 mx-auto mb-1.5" />
                    Windows 64-bit
                  </button>

                  <button
                    type="button"
                    disabled
                    className="py-3 px-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed"
                  >
                    <Terminal className="w-5 h-5 mx-auto mb-1.5" />
                    Linux
                    <span className="block text-[9px] mt-1">Coming soon</span>
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                  {error}
                </p>
              )}

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-400 leading-relaxed">
                <p className="font-semibold text-slate-300 mb-1">
                  What happens next?
                </p>
                Your device will be registered and assigned a unique ID.
                You will then receive instructions to install the Telegraf monitoring agent.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: DOWNLOAD TELEGRAF */}
          {isRegistered && step === 1 && (
            <div className="space-y-5 text-xs">

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    Download Telegraf
                  </h4>
                  <p className="text-slate-400 mt-1">
                    Install the monitoring agent on your Windows computer.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">
                    Telegraf for Windows (64-bit)
                  </span>
                  <span className="text-slate-500 font-mono">
                    v{TELEGRAF_VERSION}
                  </span>
                </div>

                <p className="text-slate-400 leading-relaxed">
                  Download the official ZIP distribution from InfluxData.
                  Extract it to access telegraf.exe.
                </p>

                <a
                  href={TELEGRAF_DOWNLOAD_URL}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Download Telegraf ZIP
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href="https://docs.influxdata.com/telegraf/v1/install/"
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-cyan-400 hover:text-cyan-300"
                >
                  View official installation documentation
                </a>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-200">
                  After downloading:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-400 leading-relaxed">
                  <li>Extract the downloaded ZIP file.</li>
                  <li>Locate the telegraf.exe executable.</li>
                  <li>Keep it ready for the next step.</li>
                </ol>
              </div>

            </div>
          )}

          {/* STEP 3: CONFIGURE */}
          {isRegistered && step === 2 && (
            <div className="space-y-5 text-xs">

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    Configure your device
                  </h4>
                  <p className="text-slate-400 mt-1">
                    Download the configuration generated specifically for this device.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-slate-500 mb-1">DEVICE ID</p>
                  <p className="font-mono text-cyan-300 break-all">
                    {deviceId}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <p className="text-slate-500 mb-1">CONFIGURATION FILE</p>
                  <p className="text-slate-200 font-mono">telegraf.conf</p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadConfig}
                  disabled={configDownloading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-semibold"
                >
                  {configDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : configDownloaded ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {configDownloading
                    ? 'Generating...'
                    : configDownloaded
                    ? 'Download Again'
                    : 'Download Configuration'}
                </button>

                {configDownloaded && (
                  <p className="text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Configuration downloaded successfully.
                  </p>
                )}

                {downloadError && (
                  <p className="text-rose-400">{downloadError}</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-200">
                  Place both files in:
                </p>
                <div className="flex items-center justify-between gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <code className="text-cyan-300 break-all">
                    C:\Program Files\Telegraf\
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy('C:\\Program Files\\Telegraf\\', 'folder')}
                    className="text-slate-400 hover:text-white shrink-0"
                  >
                    {copiedStep === 'folder' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-slate-400 leading-relaxed">
                  The folder should contain both telegraf.exe and telegraf.conf.
                </p>
              </div>

            </div>
          )}

          {/* STEP 4: CONNECT */}
          {isRegistered && step === 3 && (
            <div className="space-y-5 text-xs">

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    Start device monitoring
                  </h4>
                  <p className="text-slate-400 mt-1">
                    Run these commands in PowerShell as Administrator.
                  </p>
                </div>
              </div>

              {installCommands.map((item, index) => (
                <div
                  key={item.title}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-200">
                      {index + 1}. {item.title}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.command, index)}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300"
                    >
                      {copiedStep === index ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiedStep === index ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <p className="text-slate-500">{item.description}</p>

                  <pre className="p-2.5 rounded-lg bg-slate-900 text-cyan-300 font-mono whitespace-pre-wrap break-words overflow-x-auto leading-relaxed">
                    {item.command}
                  </pre>
                </div>
              ))}

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 leading-relaxed">
                Keep the PowerShell window open while executing the commands.
                The service will continue running in the background after installation.
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-300 font-semibold mb-1">
                  What happens next?
                </p>
                Your dashboard will wait for telemetry from this device.
                It may take a short while for the first metrics to appear.
                Closing this modal does not stop the monitoring service.
              </div>

            </div>
          )}

        </div>

        {/* FOOTER */}
        {isRegistered && (
          <div className="p-5 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              disabled={step === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.min(3, prev + 1))}
                disabled={step === 2 && !configDownloaded}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-semibold"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
              >
                Finish
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
