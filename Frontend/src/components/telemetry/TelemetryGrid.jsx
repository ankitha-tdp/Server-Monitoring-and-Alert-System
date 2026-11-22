import React from 'react';
import { Cpu, HardDrive, Database } from 'lucide-react';
import MetricChartCard from './MetricChartCard';

export default function TelemetryGrid({ data = [], thresholds = {} }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <MetricChartCard
        title="CPU Utilization"
        subtitle="measurement: cpu • usage_user"
        metricKey="cpu"
        data={data}
        color="#34d399"
        threshold={thresholds.cpu ?? null}
        icon={<Cpu className="w-4 h-4 text-emerald-400" />}
      />

      <MetricChartCard
        title="Memory (RAM)"
        subtitle="measurement: mem • used_percent"
        metricKey="ram"
        data={data}
        color="#38bdf8"
        threshold={thresholds.ram ?? null}
        icon={<Database className="w-4 h-4 text-sky-400" />}
      />

      <MetricChartCard
        title="Disk I/O"
        subtitle="measurement: disk • used_percent"
        metricKey="disk"
        data={data}
        color="#fbbf24"
        threshold={thresholds.disk ?? null}
        icon={<HardDrive className="w-4 h-4 text-amber-400" />}
      />
    </div>
  );
}