"use client";

import { useMemo, useState } from "react";
import { Vehicle, radarAxes, VehicleRadarScores } from "@/lib/catalog";

type RadarChartProps = {
  vehicles: Vehicle[];
  size?: number;
  showLegend?: boolean;
  showBreakdown?: boolean;
};

const CAR_COLORS = [
  {
    name: "Acento Lima",
    stroke: "#C8F36A",
    fill: "rgba(200, 243, 106, 0.24)",
    dot: "#C8F36A",
    text: "#1D1F1E",
    badgeBg: "rgba(200, 243, 106, 0.18)"
  },
  {
    name: "Cyan Eléctrico",
    stroke: "#00E5FF",
    fill: "rgba(0, 229, 255, 0.18)",
    dot: "#00E5FF",
    text: "#008394",
    badgeBg: "rgba(0, 229, 255, 0.14)"
  },
  {
    name: "Ámbar Cálido",
    stroke: "#FFB84D",
    fill: "rgba(255, 184, 77, 0.18)",
    dot: "#FFB84D",
    text: "#B26A00",
    badgeBg: "rgba(255, 184, 77, 0.14)"
  }
];

export function RadarChart({
  vehicles,
  size = 460,
  showLegend = true,
  showBreakdown = true
}: RadarChartProps) {
  const [activeAxis, setActiveAxis] = useState<string | null>(null);
  const [hoveredCarId, setHoveredCarId] = useState<string | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 65; // Margen para las etiquetas
  const numAxes = radarAxes.length; // 6 ejes

  // Calcular las coordenadas polares a cartesianas
  function getCoordinates(axisIndex: number, value: number) {
    // 0 es el eje superior (12 en punto)
    const angle = (axisIndex * 2 * Math.PI) / numAxes - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y, angle };
  }

  // Generar anillos concéntricos (niveles 20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100];
  const gridPolygons = useMemo(() => {
    return gridLevels.map((lvl) => {
      const points = radarAxes
        .map((_, i) => {
          const { x, y } = getCoordinates(i, lvl);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
      return { level: lvl, points };
    });
  }, [cx, cy, radius]);

  // Polígonos de cada vehículo
  const carSeries = useMemo(() => {
    return vehicles.map((car, carIdx) => {
      const color = CAR_COLORS[carIdx % CAR_COLORS.length];
      const points = radarAxes
        .map((axis, axisIdx) => {
          const val = car.radarScores[axis.key as keyof VehicleRadarScores];
          const { x, y } = getCoordinates(axisIdx, val);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");

      const vertexCoords = radarAxes.map((axis, axisIdx) => {
        const val = car.radarScores[axis.key as keyof VehicleRadarScores];
        const { x, y } = getCoordinates(axisIdx, val);
        return { axis: axis.key, val, x, y };
      });

      // Puntuación promedio global
      const avg = Math.round(
        Object.values(car.radarScores).reduce((a, b) => a + b, 0) / radarAxes.length
      );

      return { car, color, points, vertexCoords, avg };
    });
  }, [vehicles, cx, cy, radius]);

  if (!vehicles || vehicles.length === 0) {
    return null;
  }

  return (
    <div className="radar-comparator-wrapper">
      {/* Encabezado y Leyenda interactiva */}
      {showLegend && (
        <div className="radar-header">
          <div className="radar-title-box">
            <h4>Análisis Radial de Capacidades</h4>
            <p>Comparación multidimensional en 6 ejes clave para el mercado peruano.</p>
          </div>

          <div className="radar-legend-chips">
            {carSeries.map(({ car, color, avg }) => {
              const isHovered = hoveredCarId === car.id;
              return (
                <div
                  key={car.id}
                  className={`radar-legend-item ${isHovered ? "highlighted" : ""}`}
                  onMouseEnter={() => setHoveredCarId(car.id)}
                  onMouseLeave={() => setHoveredCarId(null)}
                >
                  <span
                    className="legend-color-dot"
                    style={{ background: color.stroke, boxShadow: `0 0 8px ${color.stroke}` }}
                  />
                  <div className="legend-info">
                    <strong>{car.brand} {car.model}</strong>
                    <small>Promedio global: <b>{avg}/100</b></small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gráfico Radial SVG */}
      <div className="radar-svg-container">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width="100%"
          height="100%"
          className="radar-svg"
        >
          <defs>
            {/* Sombras y filtros de brillo para los vértices */}
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Anillos concéntricos de referencia */}
          {gridPolygons.map(({ level, points }) => (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="#E0E2DA"
              strokeWidth={level === 100 ? "1.5" : "1"}
              strokeDasharray={level === 100 ? undefined : "3 3"}
              opacity={level === 100 ? 0.9 : 0.6}
            />
          ))}

          {/* Ejes radiales (rayos desde el centro) */}
          {radarAxes.map((axis, i) => {
            const { x, y } = getCoordinates(i, 100);
            const isAxisActive = activeAxis === axis.key;
            return (
              <line
                key={axis.key}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={isAxisActive ? "#1D1F1E" : "#D4D7CD"}
                strokeWidth={isAxisActive ? "2" : "1"}
              />
            );
          })}

          {/* Polígonos de cada auto */}
          {carSeries.map(({ car, color, points }) => {
            const isHovered = hoveredCarId === car.id;
            const opacity = hoveredCarId && !isHovered ? 0.25 : 1;
            return (
              <polygon
                key={car.id}
                points={points}
                fill={color.fill}
                stroke={color.stroke}
                strokeWidth={isHovered ? "3.5" : "2.5"}
                strokeLinejoin="round"
                opacity={opacity}
                className="radar-polygon-series"
                onMouseEnter={() => setHoveredCarId(car.id)}
                onMouseLeave={() => setHoveredCarId(null)}
              />
            );
          })}

          {/* Vértices con puntos indicadores */}
          {carSeries.map(({ car, color, vertexCoords }) => {
            const isHovered = hoveredCarId === car.id;
            const opacity = hoveredCarId && !isHovered ? 0.15 : 1;
            return (
              <g key={`dots-${car.id}`} opacity={opacity}>
                {vertexCoords.map((pt) => (
                  <circle
                    key={pt.axis}
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 4}
                    fill={color.dot}
                    stroke="#1D1F1E"
                    strokeWidth="1.5"
                    filter="url(#radarGlow)"
                  />
                ))}
              </g>
            );
          })}

          {/* Etiquetas exteriores de los 6 ejes */}
          {radarAxes.map((axis, i) => {
            const { x, y, angle } = getCoordinates(i, 118);
            const isAxisActive = activeAxis === axis.key;

            // Alineación de texto según el ángulo
            let textAnchor = "middle";
            if (x < cx - 15) textAnchor = "end";
            else if (x > cx + 15) textAnchor = "start";

            return (
              <g
                key={axis.key}
                transform={`translate(${x}, ${y})`}
                className={`radar-axis-label-group ${isAxisActive ? "active" : ""}`}
                onMouseEnter={() => setActiveAxis(axis.key)}
                onMouseLeave={() => setActiveAxis(null)}
                style={{ cursor: "pointer" }}
              >
                <text
                  x={0}
                  y={0}
                  textAnchor={textAnchor}
                  fill={isAxisActive ? "#1D1F1E" : "#555A55"}
                  fontSize="11.5"
                  fontWeight={isAxisActive ? "800" : "600"}
                  fontFamily="'Inter', sans-serif"
                >
                  {axis.icon} {axis.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Desglose comparativo por barras (Score Breakdown) */}
      {showBreakdown && (
        <div className="radar-breakdown-grid">
          {radarAxes.map((axis) => {
            return (
              <div
                key={axis.key}
                className={`breakdown-metric-row ${activeAxis === axis.key ? "hovered" : ""}`}
                onMouseEnter={() => setActiveAxis(axis.key)}
                onMouseLeave={() => setActiveAxis(null)}
              >
                <div className="metric-label">
                  <span className="metric-icon">{axis.icon}</span>
                  <span className="metric-name">{axis.label}</span>
                </div>

                <div className="metric-bars-stack">
                  {carSeries.map(({ car, color }) => {
                    const val = car.radarScores[axis.key as keyof VehicleRadarScores];
                    return (
                      <div key={car.id} className="car-bar-item">
                        <div className="car-bar-track">
                          <div
                            className="car-bar-fill"
                            style={{
                              width: `${val}%`,
                              background: color.stroke
                            }}
                          />
                        </div>
                        <span className="car-bar-val" style={{ color: color.text }}>
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
