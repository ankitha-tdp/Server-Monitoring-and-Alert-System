import React from 'react';

export default function MetricChartCard({
  title,
  subtitle,
  metricKey,
  data = [],
  color = '#34d399',
  unit = '%',
  threshold = null,
  icon = null
}) {
  const safeData = Array.isArray(data) ? data : [];
  const latestVal =
    safeData.length > 0 && typeof safeData[safeData.length - 1]?.[metricKey] === 'number'
      ? safeData[safeData.length - 1][metricKey].toFixed(1)
      : '0.0';

  const width = 420;
  const height = 140;
  const padLeft = 36;
  const padRight = 12;
  const padTop = 14;
  const padBottom = 24;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const points = safeData.map((pt, idx) => {
    const val = Math.min(100, Math.max(0, Number(pt?.[metricKey] ?? 0)));
    const x =
      safeData.length <= 1
        ? padLeft + plotW / 2
        : padLeft + (idx / (safeData.length - 1)) * plotW;
    const y = padTop + plotH - (val / 100) * plotH;
    return { x, y, val, time: pt?.time || '' };
  });

  const linePath =
    points.length > 0
      ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
      : '';

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : '';

  const thresholdY =
    typeof threshold === 'number'
      ? padTop + plotH - (Math.min(100, Math.max(0, threshold)) / 100) * plotH
      : null;

  const gradientId = `grad-${metricKey}-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          {icon && (
            <div className="mt-0.5 p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{title}</h3>
            {subtitle && (
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-xl font-bold leading-none" style={{ color }}>
            {latestVal}
            <span className="text-xs font-normal text-slate-400 ml-0.5">{unit}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {typeof threshold === 'number' ? `Limit: ${threshold}${unit}` : 'No alert threshold'}
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl bg-slate-950/70 border border-slate-800/70 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 block">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((tick) => {
            const y = padTop + plotH - (tick / 100) * plotH;
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 font-mono text-[9px]"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {thresholdY !== null && (
            <line
              x1={padLeft}
              y1={thresholdY}
              x2={width - padRight}
              y2={thresholdY}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeWidth="1.2"
            />
          )}

          {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.length > 0 && (
            <>
              <text
                x={padLeft}
                y={height - 6}
                textAnchor="start"
                className="fill-slate-500 font-mono text-[9px]"
              >
                {points[0].time}
              </text>
              <text
                x={points[Math.floor(points.length / 2)].x}
                y={height - 6}
                textAnchor="middle"
                className="fill-slate-500 font-mono text-[9px]"
              >
                {points[Math.floor(points.length / 2)].time}
              </text>
              <text
                x={width - padRight}
                y={height - 6}
                textAnchor="end"
                className="fill-slate-500 font-mono text-[9px]"
              >
                {points[points.length - 1].time}
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}