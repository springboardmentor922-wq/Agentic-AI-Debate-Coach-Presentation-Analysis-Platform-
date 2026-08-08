import React, { useState } from 'react';

/**
 * RadarSkillChart Component
 * Pure SVG 5-point radar/spider chart for debate & speech skill metrics.
 * Zero external dependencies.
 */
export default function RadarSkillChart({ data, size = 260 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const chartData = data && data.length > 0 ? data : [
    { subject: 'Argument Quality', score: 82, fullMark: 100 },
    { subject: 'Evidence Usage', score: 78, fullMark: 100 },
    { subject: 'Logical Consistency', score: 88, fullMark: 100 },
    { subject: 'Rebuttal Speed', score: 75, fullMark: 100 },
    { subject: 'Communication', score: 80, fullMark: 100 }
  ];

  const centerX = 150;
  const centerY = 130;
  const radius = 80;
  const numPoints = chartData.length;
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Calculate polygon points for grid rings
  const getPolygonPoints = (level) => {
    return chartData.map((_, idx) => {
      const angle = (Math.PI * 2 * idx) / numPoints - Math.PI / 2;
      const r = level * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Calculate actual score points
  const points = chartData.map((item, idx) => {
    const angle = (Math.PI * 2 * idx) / numPoints - Math.PI / 2;
    const r = (Math.min(100, Math.max(0, item.score)) / 100) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y, score: item.score, subject: item.subject, angle };
  });

  const polygonPathString = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: `${size}px` }}>
      <svg width="100%" height={size} viewBox="0 0 300 260" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="radarFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.35" />
          </linearGradient>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric Grid Pentagons */}
        {gridLevels.map((lvl, i) => (
          <polygon
            key={i}
            points={getPolygonPoints(lvl)}
            fill="none"
            stroke="#334155"
            strokeDasharray={lvl === 1.0 ? 'none' : '3 3'}
            strokeWidth={lvl === 1.0 ? '1.5' : '1'}
          />
        ))}

        {/* Radial Axis Lines & Labels */}
        {chartData.map((item, idx) => {
          const angle = (Math.PI * 2 * idx) / numPoints - Math.PI / 2;
          const endX = centerX + radius * Math.cos(angle);
          const endY = centerY + radius * Math.sin(angle);

          // Label positions (pushed slightly outside radius)
          const labelDist = radius + 24;
          const labelX = centerX + labelDist * Math.cos(angle);
          const labelY = centerY + labelDist * Math.sin(angle);

          let textAnchor = 'middle';
          if (Math.cos(angle) > 0.3) textAnchor = 'start';
          if (Math.cos(angle) < -0.3) textAnchor = 'end';

          return (
            <g key={idx}>
              <line
                x1={centerX}
                y1={centerY}
                x2={endX}
                y2={endY}
                stroke="#475569"
                strokeWidth="1"
              />
              <text
                x={labelX}
                y={labelY + 4}
                textAnchor={textAnchor}
                fill="#cbd5e1"
                fontSize="10"
                fontWeight="700"
                fontFamily="sans-serif"
              >
                {item.subject}
              </text>
            </g>
          );
        })}

        {/* Filled Data Polygon */}
        <polygon
          points={polygonPathString}
          fill="url(#radarFillGrad)"
          stroke="#818cf8"
          strokeWidth="2.5"
          filter="url(#radarGlow)"
        />

        {/* Vertex Data Points */}
        {points.map((pt, idx) => (
          <g key={idx} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)} style={{ cursor: 'pointer' }}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.subject === pt.subject ? 7 : 4.5}
              fill="#818cf8"
              stroke="#ffffff"
              strokeWidth="2"
              style={{ transition: 'all 0.2s ease' }}
            />
            {/* Score label badge next to point */}
            <text
              x={pt.x}
              y={pt.y - 8}
              textAnchor="middle"
              fill="#a5b4fc"
              fontSize="9"
              fontWeight="800"
            >
              {pt.score}
            </text>
          </g>
        ))}
      </svg>

      {/* Hover Tooltip Overlay */}
      {hoveredPoint && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(129, 140, 248, 0.4)',
          borderRadius: '8px',
          padding: '6px 12px',
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: '700',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
          pointerEvents: 'none'
        }}>
          {hoveredPoint.subject}: <span style={{ color: '#34d399' }}>{hoveredPoint.score} / 100</span>
        </div>
      )}
    </div>
  );
}
