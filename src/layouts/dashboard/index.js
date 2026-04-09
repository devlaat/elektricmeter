/**
=========================================================
* ELEKTRICmeter AC⚡DC React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React, { useEffect, useState, useMemo } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import { useTheme } from "@mui/material/styles";

// ELEKTRICmeter AC⚡DC React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// ELEKTRICmeter AC⚡DC React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Telemetry components
import TelemetryCard from "components/TelemetryCard";
import TelemetryChart from "components/TelemetryChart";

// Services and stores
import socketService from "services/socketService";
import useTelemetryStore from "stores/telemetryStore";
import api from "api/axios";

// Utilities
import { formatSignificantFigures, getTrend, formatTime } from "utils/formatters";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

function Dashboard() {
  const theme = useTheme();
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("initializing"); // initializing, connecting, connected, disconnected, error
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [debug, setDebug] = useState("");
  const [lastMeasurement, setLastMeasurement] = useState(null);
  const [previousMeasurement, setPreviousMeasurement] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get store actions and state
  const addPoint = useTelemetryStore((s) => s.addPoint);
  const points = useTelemetryStore((s) => s.points);
  const clearPoints = useTelemetryStore((s) => s.clearPoints);

  const { sales, tasks } = reportsLineChartData;

  // Calculate statistics from points
  const stats = useMemo(() => {
    if (points.length === 0) {
      return {
        voltageAvg: 0,
        voltageMin: 0,
        voltageMax: 0,
        currentAvg: 0,
        currentMin: 0,
        currentMax: 0,
        powerAvg: 0,
        powerMin: 0,
        powerMax: 0,
        totalEnergy: 0,
      };
    }

    const voltages = points.map((p) => p.voltage).filter((v) => v != null && !isNaN(v));
    const currents = points.map((p) => p.current).filter((c) => c != null && !isNaN(c));
    const powers = points.map((p) => p.power_kw).filter((p) => p != null && !isNaN(p));

    // Calculate average power * time interval (rough energy estimate)
    let totalEnergy = 0;
    if (powers.length > 1) {
      const timeIntervalHours = (points.length - 1) * (5 / 3600); // Assuming ~5 second intervals
      const avgPower = powers.reduce((a, b) => a + b, 0) / powers.length;
      totalEnergy = avgPower * timeIntervalHours;
    }

    return {
      voltageAvg: voltages.length ? voltages.reduce((a, b) => a + b, 0) / voltages.length : 0,
      voltageMin: voltages.length ? Math.min(...voltages) : 0,
      voltageMax: voltages.length ? Math.max(...voltages) : 0,
      currentAvg: currents.length ? currents.reduce((a, b) => a + b, 0) / currents.length : 0,
      currentMin: currents.length ? Math.min(...currents) : 0,
      currentMax: currents.length ? Math.max(...currents) : 0,
      powerAvg: powers.length ? powers.reduce((a, b) => a + b, 0) / powers.length : 0,
      powerMin: powers.length ? Math.min(...powers) : 0,
      powerMax: powers.length ? Math.max(...powers) : 0,
      totalEnergy: totalEnergy,
    };
  }, [points]);

  // Calculate trends
  const trends = useMemo(() => {
    if (!lastMeasurement || !previousMeasurement) {
      return {
        voltage: { trend: "stable", percentage: 0 },
        current: { trend: "stable", percentage: 0 },
        power: { trend: "stable", percentage: 0 },
      };
    }

    return {
      voltage: getTrend(lastMeasurement.voltaje, previousMeasurement.voltaje),
      current: getTrend(lastMeasurement.corriente, previousMeasurement.corriente),
      power: getTrend(lastMeasurement.potencia, previousMeasurement.potencia),
    };
  }, [lastMeasurement, previousMeasurement]);

  // Initialize socket and fetch initial data
  useEffect(() => {
    // Fetch initial measurement
    const fetchInitialData = async () => {
      try {
        setDebug((prev) => prev + "\n⏳ Consultando /datos...");
        const response = await api.get("/datos");
        const data = response.data;

        if (data) {
          setLastMeasurement({
            potencia: data.potencia != null ? Number(data.potencia) : undefined,
            voltaje: data.voltaje || 0,
            corriente: data.corriente || 0,
            timestamp: new Date().toISOString(),
          });
          setDebug((prev) => prev + `\n✓ /datos: ${JSON.stringify(data).slice(0, 50)}...`);
        }
      } catch (error) {
        setDebug((prev) => prev + `\n❌ /datos error: ${error?.message || error.toString()}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Initialize socket connection
    setConnectionStatus("connecting");
    socketService.connect();

    // Listen to socket events
    const handleTelemetry = (data) => {
      // Store previous measurement before updating
      if (lastMeasurement) {
        setPreviousMeasurement(lastMeasurement);
      }

      // Add point to store
      addPoint({
        timestamp: data.timestamp,
        voltage: data.voltage,
        current: data.current,
        power_kw: data.power_kw,
      });

      // Update last measurement
      setLastMeasurement({
        potencia: typeof data.power_kw === "number" ? data.power_kw * 1000 : undefined,
        voltaje: data.voltage,
        corriente: data.current,
        timestamp: data.timestamp,
      });

      setDebug(
        (prev) => prev + `\n📊 Telemetría: V=${data.voltage}, I=${data.current}, P=${data.power_kw}`
      );
    };

    socketService.initTelemetry(handleTelemetry);

    // Subscribe to connection events
    const unsubscribeConnect = socketService.subscribe("connect", () => {
      setConnected(true);
      setConnectionStatus("connected");
      setReconnectAttempts(0);
      setDebug((prev) => prev + "\n✓ Socket conectado - Recibiendo datos en tiempo real 📡");
    });

    const unsubscribeDisconnect = socketService.subscribe("disconnect", (reason) => {
      setConnected(false);
      setConnectionStatus("disconnected");
      setDebug((prev) => prev + `\n✗ Socket desconectado (${reason}) - Intentando reconectar...`);
    });

    const unsubscribeError = socketService.subscribe("error", (error) => {
      setConnectionStatus("error");
      setReconnectAttempts((prev) => prev + 1);
      setDebug((prev) => prev + `\n❌ Error de conexión: ${error.message}`);
    });

    // Cleanup
    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
    };
  }, [addPoint]);

  // Health check for connection status
  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      const isConnected = socketService.isConnected();

      // Sync state with actual socket connection status
      if (isConnected && !connected) {
        setConnected(true);
        setConnectionStatus("connected");
        setDebug((prev) => prev + "\n✓ Reconectado automáticamente 📡");
      } else if (!isConnected && connected) {
        setConnected(false);
        setConnectionStatus("disconnected");
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(healthCheckInterval);
  }, [connected]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Connection Status Alert */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert
                severity={connected ? "success" : "warning"}
                sx={{
                  mb: 2,
                  borderRadius: 1,
                  animation: connected ? "none" : "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.7 },
                  },
                }}
              >
                {connected ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Icon sx={{ fontSize: "1.25rem" }}>check_circle</Icon>
                    <span>✓ Conexión establecida - Recibiendo datos en tiempo real</span>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Icon sx={{ fontSize: "1.25rem" }}>cloud_off</Icon>
                    <span>⚠ Desconectado - Intentando conectar...</span>
                  </Box>
                )}
              </Alert>
            </Grid>
          </Grid>
        </MDBox>

        {/* Debug Panel (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <MDBox mb={3}>
            <Card sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <MDTypography variant="button" fontWeight="bold">
                  🔧 Panel de Debug
                </MDTypography>
                <MDTypography variant="caption" color="secondary">
                  Modo desarrollo
                </MDTypography>
              </MDBox>
              <Box
                component="pre"
                sx={{
                  fontSize: "11px",
                  maxHeight: "180px",
                  overflowY: "auto",
                  backgroundColor: "#f5f5f5",
                  p: 1.5,
                  borderRadius: 1,
                  mt: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  fontFamily: "Courier New, monospace",
                }}
              >
                {debug}
              </Box>
            </Card>
          </MDBox>
        )}

        {/* Real-time Telemetry Cards with Stats */}
        <Grid container spacing={3} mb={4}>
          <TelemetryCard
            label="Voltaje"
            icon="electric_bolt"
            value={formatSignificantFigures(lastMeasurement?.voltaje, 4)}
            unit="V"
            color="info"
            loading={loading && !lastMeasurement}
            min={formatSignificantFigures(stats.voltageMin, 4)}
            max={formatSignificantFigures(stats.voltageMax, 4)}
            avg={formatSignificantFigures(stats.voltageAvg, 4)}
            trend={trends.voltage.trend}
            trendAmount={trends.voltage.percentage}
          />
          <TelemetryCard
            label="Corriente"
            icon="power_input"
            value={formatSignificantFigures(lastMeasurement?.corriente, 4)}
            unit="A"
            color="warning"
            loading={loading && !lastMeasurement}
            min={formatSignificantFigures(stats.currentMin, 4)}
            max={formatSignificantFigures(stats.currentMax, 4)}
            avg={formatSignificantFigures(stats.currentAvg, 4)}
            trend={trends.current.trend}
            trendAmount={trends.current.percentage}
          />
          <TelemetryCard
            label="Potencia"
            icon="flash_on"
            value={formatSignificantFigures(lastMeasurement?.potencia, 4)}
            unit="W"
            color="success"
            loading={loading && !lastMeasurement}
            min={formatSignificantFigures(stats.powerMin * 1000, 4)}
            max={formatSignificantFigures(stats.powerMax * 1000, 4)}
            avg={formatSignificantFigures(stats.powerAvg * 1000, 4)}
            trend={trends.power.trend}
            trendAmount={trends.power.percentage}
          />
          <TelemetryCard
            label="Estado"
            icon={connected ? "check_circle" : "cloud_off"}
            value={connected ? "Conectado" : "Desconectado"}
            color={connected ? "success" : "error"}
            loading={false}
          />
        </Grid>

        {/* Telemetry Chart */}
        <MDBox mb={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TelemetryChart title="Consumo en Tiempo Real (Últimas mediciones)" data={points} />
            </Grid>
          </Grid>
        </MDBox>

        {/* Advanced Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                p: 2,
                background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.lighter} 100%)`,
              }}
            >
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <MDTypography variant="caption" color="secondary" fontWeight="bold">
                    Promedio Voltaje
                  </MDTypography>
                  <MDTypography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                    {formatSignificantFigures(stats.voltageAvg, 4)}
                  </MDTypography>
                  <MDTypography variant="caption" color="secondary">
                    V
                  </MDTypography>
                </Box>
                <Icon sx={{ fontSize: "2.5rem", color: theme.palette.info.main, opacity: 0.3 }}>
                  trending_up
                </Icon>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                p: 2,
                background: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.lighter} 100%)`,
              }}
            >
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <MDTypography variant="caption" color="secondary" fontWeight="bold">
                    Promedio Corriente
                  </MDTypography>
                  <MDTypography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                    {formatSignificantFigures(stats.currentAvg, 4)}
                  </MDTypography>
                  <MDTypography variant="caption" color="secondary">
                    A
                  </MDTypography>
                </Box>
                <Icon sx={{ fontSize: "2.5rem", color: theme.palette.warning.main, opacity: 0.3 }}>
                  flash_on
                </Icon>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                p: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.lighter} 100%)`,
              }}
            >
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <MDTypography variant="caption" color="secondary" fontWeight="bold">
                    Promedio Potencia
                  </MDTypography>
                  <MDTypography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                    {formatSignificantFigures(stats.powerAvg * 1000, 4)}
                  </MDTypography>
                  <MDTypography variant="caption" color="secondary">
                    W
                  </MDTypography>
                </Box>
                <Icon sx={{ fontSize: "2.5rem", color: theme.palette.success.main, opacity: 0.3 }}>
                  bolt
                </Icon>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                p: 2,
                background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.lighter} 100%)`,
              }}
            >
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <MDTypography variant="caption" color="secondary" fontWeight="bold">
                    Energía Total (Est.)
                  </MDTypography>
                  <MDTypography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                    {formatSignificantFigures(stats.totalEnergy, 4)}
                  </MDTypography>
                  <MDTypography variant="caption" color="secondary">
                    kWh
                  </MDTypography>
                </Box>
                <Icon
                  sx={{
                    fontSize: "2.5rem",
                    color: theme.palette.secondary.main,
                    opacity: 0.3,
                  }}
                >
                  battery_charging_full
                </Icon>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Original Dashboard Content */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
