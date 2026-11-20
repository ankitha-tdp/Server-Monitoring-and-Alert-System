import React from 'react';

export default function TelemetryLineChart({ data, metrics, height = 240 }) {
  const width = 760;
  const padLeft = 42;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getPath = (key) => {
    if (!data || data.length === 0) return '';
    return data
      .map((point, idx) => {
        const x = padLeft + (idx / Math.max(1, data.length - 1)) * plotW;
        const val = Math.min(100, Math.max(0, point[key] || 0));
        const y = padTop + plotH - (val / 100) * plotH;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const getAreaPath = (key) => {
    if (!data || data.length === 0) return '';
    const line = getPath(key);
    const lastX = padLeft + plotW;
    const firstX = padLeft;
    const bottomY = padTop + plotH;
    return `${line} L ${lastX.toFixed(1)} ${bottomY.toFixed(1)} L ${firstX.toFixed(1)} ${bottomY.toFixed(1)} Z`;
  };

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        preserveAspectRatio="none"
      >
        <defs>
          {metrics.map((m) => (
            <linearGradient key={m.key} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={m.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={m.color} stopOpacity="0.0" />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal Grid Lines & Y-axis Labels */}
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
                strokeDasharray={tick === 0 ? '0' : '4 4'}
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                fill="#64748b"
                fontSize="11"
                fontFamily="monospace"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* X-axis Time Labels */}
        {data.map((point, idx) => {
          if (idx % 4 !== 0 && idx !== data.length - 1) return null;
          const x = padLeft + (idx / Math.max(1, data.length - 1)) * plotW;
          return (
            <text
              key={idx}
              x={x}
              y={height - 6}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
              fontFamily="monospace"
            >
              {point.time}
            </text>
          );
        })}

        {/* Area Fills & Lines */}
        {metrics.map((m) => (
          <g key={m.key}>
            <path d={getAreaPath(m.key)} fill={`url(#grad-${m.key})`} />
            <path
              d={getPath(m.key)}
              fill="none"
              stroke={m.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {data.length > 0 && (() => {
              const last = data[data.length - 1];
              const cx = padLeft + plotW;
              const cy = padTop + plotH - (Math.min(100, Math.max(0, last[m.key])) / 100) * plotH;
              return (
                <circle cx={cx} cy={cy} r="4" fill={m.color} stroke="#0f172a" strokeWidth="2" />
              );
            })()}
          </g>
        ))}
      </svg>
    </div>
  );
}