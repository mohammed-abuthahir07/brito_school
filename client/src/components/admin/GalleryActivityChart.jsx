import React, { useMemo, useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WIDTH = 720;
const HEIGHT = 248;
const PAD = { left: 40, right: 18, top: 22, bottom: 34 };

const niceMax = (value) => {
  if (value <= 1) return 2;
  if (value <= 4) return 4;
  if (value <= 8) return 8;
  return Math.ceil(value / 5) * 5;
};

export const GalleryActivityChart = ({ months, year }) => {
  const defaultMonth = useMemo(() => {
    const lastActive = [...months]
      .map((row, index) => ({ index, total: row.uploads + row.updates + row.deletes }))
      .reverse()
      .find((row) => row.total > 0);
    return lastActive ? lastActive.index : 0;
  }, [months]);

  const [selected, setSelected] = useState(defaultMonth);
  const stats = months[selected] || { uploads: 0, updates: 0, deletes: 0 };

  const yMax = useMemo(
    () => niceMax(Math.max(1, ...months.map((row) => row.uploads))),
    [months],
  );

  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const xFor = (index) => PAD.left + (index / 11) * innerWidth;
  const yFor = (value) => PAD.top + innerHeight - (value / yMax) * innerHeight;

  const points = months.map((row, index) => ({ x: xFor(index), y: yFor(row.uploads) }));
  const linePath = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const prev = points[index - 1];
      const next = points[index + 1] || point;
      const before = points[index - 2] || prev;
      const c1x = prev.x + (point.x - before.x) / 6;
      const c1y = prev.y + (point.y - before.y) / 6;
      const c2x = point.x - (next.x - prev.x) / 6;
      const c2y = point.y - (next.y - prev.y) / 6;
      return `C ${c1x} ${c1y}, ${c2x} ${c2y}, ${point.x} ${point.y}`;
    })
    .join(' ');
  const areaPath = `${linePath} L ${xFor(11)} ${yFor(0)} L ${xFor(0)} ${yFor(0)} Z`;
  const ticks = Array.from({ length: yMax + 1 }, (_, index) => index).filter(
    (tick) => yMax <= 4 || tick % Math.ceil(yMax / 4) === 0,
  );

  return (
    <div className="line-chart">
      <div className="line-chart-frame">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Gallery uploads line chart for ${year}`}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={yFor(tick)}
                y2={yFor(tick)}
                className="chart-grid-line"
              />
              <text x={PAD.left - 8} y={yFor(tick) + 4} className="chart-axis-label" textAnchor="end">
                {tick}
              </text>
            </g>
          ))}
          <path d={areaPath} className="chart-area" pathLength="1" />
          <path d={linePath} className="chart-line" pathLength="1" />
          {MONTHS.map((label, index) => (
            <g key={label}>
              <circle
                cx={xFor(index)}
                cy={yFor(months[index].uploads)}
                r={selected === index ? 6 : 4}
                className={`chart-dot ${selected === index ? 'is-active' : ''}`}
                style={{ animationDelay: `${0.9 + index * 0.05}s` }}
              />
              <text x={xFor(index)} y={HEIGHT - 10} className="chart-month-label" textAnchor="middle">
                {label}
              </text>
              <rect
                x={xFor(index) - innerWidth / 24}
                y={PAD.top}
                width={innerWidth / 12}
                height={innerHeight}
                className="chart-hit"
                role="button"
                tabIndex={0}
                aria-label={`${label} ${year}: ${months[index].uploads} uploaded, ${months[index].updates} updated, ${months[index].deletes} deleted`}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelected(index);
                  }
                }}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="chart-month-panel" role="status">
        <div className="chart-month-panel-title">
          {MONTHS[selected]} {year}
        </div>
        <div className="chart-month-metrics">
          <div className="chart-metric">
            <span>Uploaded</span>
            <strong>{stats.uploads}</strong>
          </div>
          <div className="chart-metric">
            <span>Updated</span>
            <strong>{stats.updates}</strong>
          </div>
          <div className="chart-metric">
            <span>Deleted</span>
            <strong>{stats.deletes}</strong>
          </div>
        </div>
        <p className="chart-month-hint">Click a month on the line to see that month’s gallery activity.</p>
      </div>
    </div>
  );
};
