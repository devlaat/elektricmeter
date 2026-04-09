/**
=========================================================
* ELEKTRICmeter AC⚡DC React - v2.2.0
=========================================================

Enhanced Telemetry Chart Component
Industrial-grade real-time chart with voltage, current, and power data
*/

import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { formatSignificantFigures } from "utils/formatters";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: "rgba(20, 25, 50, 0.98)",
          border: "2px solid #4f46e5",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)",
          maxWidth: "280px",
        }}
      >
        <MDTypography
          variant="caption"
          fontWeight="bold"
          display="block"
          sx={{ mb: 1.5, color: "#fff", fontSize: "0.9rem" }}
        >
          {label}
        </MDTypography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "3px",
                  backgroundColor: entry.color,
                  flexShrink: 0,
                }}
              />
              <MDTypography
                variant="caption"
                sx={{
                  color: entry.color,
                  fontWeight: "600",
                  fontSize: "0.85rem",
                }}
              >
                {entry.name}:
              </MDTypography>
              <MDTypography
                variant="caption"
                sx={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  marginLeft: "auto",
                }}
              >
                {formatSignificantFigures(entry.value, 4)}
              </MDTypography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return null;
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
      color: PropTypes.string,
    })
  ),
  label: PropTypes.string,
};

function TelemetryChart({ title, data = [] }) {
  const theme = useTheme();

  // Ensure data is always an array, never undefined or null
  const safeData = Array.isArray(data) ? data : [];
  const hasData = safeData && safeData.length > 0;

  // Calculate real-time statistics
  const stats = hasData
    ? {
        voltage: {
          current: safeData[safeData.length - 1]?.voltage || 0,
          max: Math.max(...safeData.map((d) => d.voltage || 0)),
          min: Math.min(...safeData.map((d) => d.voltage || 0)),
        },
        current: {
          current: safeData[safeData.length - 1]?.current || 0,
          max: Math.max(...safeData.map((d) => d.current || 0)),
          min: Math.min(...safeData.map((d) => d.current || 0)),
        },
        power: {
          current: safeData[safeData.length - 1]?.power_kw || 0,
          max: Math.max(...safeData.map((d) => d.power_kw || 0)),
          min: Math.min(...safeData.map((d) => d.power_kw || 0)),
        },
      }
    : null;

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${
          theme.palette.mode === "dark" ? "#0f172a" : "#f8fafc"
        } 0%, ${theme.palette.background.paper} 100%)`,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 8px 32px rgba(0, 0, 0, 0.5)"
            : "0 4px 20px rgba(0, 0, 0, 0.08)",
      }}
    >
      <MDBox p={3}>
        {/* Header Section */}
        <MDBox mb={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
            <Box>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                sx={{
                  background: `linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {title}
              </MDTypography>
              <MDTypography variant="caption" color="secondary" sx={{ mt: 0.5, display: "block" }}>
                Monitoreo en tiempo real • {safeData?.length || 0} puntos de datos
              </MDTypography>
            </Box>
          </MDBox>

          {/* Real-time Stats Grid */}
          {stats && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 2,
                mt: 2,
              }}
            >
              {/* Voltage Stats */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  background: `linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)`,
                  border: "1px solid",
                  borderColor: "rgba(76, 175, 80, 0.3)",
                }}
              >
                <MDTypography
                  variant="caption"
                  color="secondary"
                  fontWeight="bold"
                  sx={{ fontSize: "0.75rem" }}
                >
                  VOLTAJE
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold" sx={{ mt: 0.5, color: "#4caf50" }}>
                  {formatSignificantFigures(stats.voltage.current, 3)} V
                </MDTypography>
                <Box sx={{ fontSize: "0.7rem", color: "text.secondary", mt: 0.5 }}>
                  <div>Max: {formatSignificantFigures(stats.voltage.max, 3)} V</div>
                  <div>Min: {formatSignificantFigures(stats.voltage.min, 3)} V</div>
                </Box>
              </Box>

              {/* Current Stats */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  background: `linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)`,
                  border: "1px solid",
                  borderColor: "rgba(255, 152, 0, 0.3)",
                }}
              >
                <MDTypography
                  variant="caption"
                  color="secondary"
                  fontWeight="bold"
                  sx={{ fontSize: "0.75rem" }}
                >
                  CORRIENTE
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold" sx={{ mt: 0.5, color: "#ff9800" }}>
                  {formatSignificantFigures(stats.current.current, 3)} A
                </MDTypography>
                <Box sx={{ fontSize: "0.7rem", color: "text.secondary", mt: 0.5 }}>
                  <div>Max: {formatSignificantFigures(stats.current.max, 3)} A</div>
                  <div>Min: {formatSignificantFigures(stats.current.min, 3)} A</div>
                </Box>
              </Box>

              {/* Power Stats */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  background: `linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)`,
                  border: "1px solid",
                  borderColor: "rgba(79, 70, 229, 0.3)",
                }}
              >
                <MDTypography
                  variant="caption"
                  color="secondary"
                  fontWeight="bold"
                  sx={{ fontSize: "0.75rem" }}
                >
                  POTENCIA
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold" sx={{ mt: 0.5, color: "#4f46e5" }}>
                  {formatSignificantFigures(stats.power.current, 3)} kW
                </MDTypography>
                <Box sx={{ fontSize: "0.7rem", color: "text.secondary", mt: 0.5 }}>
                  <div>Max: {formatSignificantFigures(stats.power.max, 3)} kW</div>
                  <div>Min: {formatSignificantFigures(stats.power.min, 3)} kW</div>
                </Box>
              </Box>
            </Box>
          )}
        </MDBox>

        {/* Chart Section */}
        {hasData ? (
          <MDBox
            sx={{
              width: "100%",
              height: 500,
              backgroundColor:
                theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)",
              borderRadius: 2,
              p: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={safeData} margin={{ top: 20, right: 40, left: 20, bottom: 80 }}>
                <defs>
                  {/* Premium Gradients */}
                  <linearGradient id="powerGradientPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="voltageGradientPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4caf50" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#4caf50" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#4caf50" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="currentGradientPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff9800" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#ff9800" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#ff9800" stopOpacity={0} />
                  </linearGradient>
                </defs>

                {/* Professional Grid */}
                <CartesianGrid strokeDasharray="4 4" stroke={theme.palette.divider} opacity={0.3} />

                {/* Axes with professional styling */}
                <XAxis
                  dataKey="timeLabel"
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  stroke={theme.palette.divider}
                  strokeWidth={1}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  stroke={theme.palette.divider}
                  strokeWidth={1}
                  label={{
                    value: "Valores (V, A, kW)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: theme.palette.text.secondary },
                  }}
                />

                {/* Professional Tooltip */}
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#4f46e5",
                    opacity: 0.3,
                    strokeWidth: 2,
                  }}
                />

                {/* Legend - Professional Styling */}
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "30px",
                  }}
                  iconType="line"
                  verticalAlign="top"
                  height={36}
                />

                {/* Premium Lines with advanced styling */}
                <Line
                  type="monotone"
                  dataKey="power_kw"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  name="Potencia (kW)"
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={600}
                  connectNulls={true}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Line
                  type="monotone"
                  dataKey="voltage"
                  stroke="#4caf50"
                  strokeWidth={2.5}
                  name="Voltaje (V)"
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={600}
                  connectNulls={true}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#ff9800"
                  strokeWidth={2.5}
                  name="Corriente (A)"
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={600}
                  connectNulls={true}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Optional Reference Lines for better context */}
                <ReferenceLine
                  y={0}
                  stroke={theme.palette.divider}
                  strokeDasharray="5 5"
                  opacity={0.5}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </MDBox>
        ) : (
          <MDBox
            sx={{
              width: "100%",
              height: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)",
              borderRadius: 2,
              border: `1px dashed ${theme.palette.divider}`,
            }}
          >
            <MDTypography variant="subtitle2" color="secondary">
              ⏳ Esperando datos de telemetría...
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

TelemetryChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.string,
      timeLabel: PropTypes.string,
      power_kw: PropTypes.number,
      voltage: PropTypes.number,
      current: PropTypes.number,
    })
  ).isRequired,
};

export default TelemetryChart;
