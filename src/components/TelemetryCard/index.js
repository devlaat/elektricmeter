/**
=========================================================
* ELEKTRICmeter AC⚡DC React - v2.2.0
=========================================================

Enhanced Telemetry Card Component
Shows real-time telemetry values with trends, min/max stats, and animations
*/

import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import { useTheme } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function TelemetryCard({
  label,
  icon,
  value,
  unit,
  color,
  loading,
  percentage,
  min,
  max,
  avg,
  trend,
  trendAmount,
}) {
  const theme = useTheme();
  const displayValue = loading ? "⏳" : value != null ? `${value} ${unit}` : "—";

  const getTrendColor = () => {
    if (trend === "up") return theme.palette.error.main;
    if (trend === "down") return theme.palette.success.main;
    return theme.palette.warning.main;
  };

  const getTrendIcon = () => {
    if (trend === "up") return "trending_up";
    if (trend === "down") return "trending_down";
    return "trending_flat";
  };

  return (
    <Grid item xs={12} md={6} lg={3}>
      <MDBox mb={1.5}>
        <Card
          sx={{
            position: "relative",
            p: 3,
            background: `linear-gradient(135deg, ${
              theme.palette.mode === "dark" ? "#1e3a8a" : "#dbeafe"
            } 0%, ${theme.palette.background.paper} 100%)`,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            boxShadow: `0 4px 20px rgba(0, 0, 0, ${theme.palette.mode === "dark" ? 0.3 : 0.1})`,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: `0 8px 30px rgba(0, 0, 0, ${theme.palette.mode === "dark" ? 0.4 : 0.15})`,
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {/* Left Content */}
            <Box sx={{ flex: 1 }}>
              <MDTypography
                variant="button"
                color="secondary"
                fontWeight="bold"
                sx={{ fontSize: "0.875rem" }}
              >
                {label}
              </MDTypography>
              <Box sx={{ mt: 1.5, mb: 1 }}>
                <MDTypography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    fontSize: "1.75rem",
                    background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {displayValue}
                </MDTypography>
              </Box>
            </Box>

            {/* Icon Badge */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 60,
                height: 60,
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${theme.palette[color || "info"].light} 0%, ${
                  theme.palette[color || "info"].lighter
                } 100%)`,
                boxShadow: `0 4px 12px rgba(${
                  color === "success"
                    ? "76, 175, 80"
                    : color === "warning"
                    ? "255, 152, 0"
                    : color === "error"
                    ? "244, 67, 54"
                    : "33, 150, 243"
                }, 0.3)`,
              }}
            >
              <Icon
                sx={{
                  fontSize: "2rem",
                  color: theme.palette[color || "info"].main,
                  fontWeight: "bold",
                }}
              >
                {icon}
              </Icon>
            </Box>
          </Box>
        </Card>

        {/* Enhanced Stats Footer */}
        {(min !== undefined || max !== undefined || avg !== undefined || trend) && (
          <Card
            sx={{
              mt: 1.5,
              p: 2,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
            }}
          >
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5}>
              {/* Min/Max/Avg Stats */}
              {min !== undefined && (
                <Box>
                  <MDTypography variant="caption" color="secondary">
                    Mín
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="bold" sx={{ fontSize: "0.875rem" }}>
                    {min}
                  </MDTypography>
                </Box>
              )}
              {max !== undefined && (
                <Box>
                  <MDTypography variant="caption" color="secondary">
                    Máx
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="bold" sx={{ fontSize: "0.875rem" }}>
                    {max}
                  </MDTypography>
                </Box>
              )}
              {avg !== undefined && (
                <Box>
                  <MDTypography variant="caption" color="secondary">
                    Promedio
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="bold" sx={{ fontSize: "0.875rem" }}>
                    {avg}
                  </MDTypography>
                </Box>
              )}

              {/* Trend Indicator */}
              {trend && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Icon
                    sx={{
                      fontSize: "1.25rem",
                      color: getTrendColor(),
                    }}
                  >
                    {getTrendIcon()}
                  </Icon>
                  <MDTypography variant="caption" fontWeight="bold" sx={{ color: getTrendColor() }}>
                    {trendAmount}%
                  </MDTypography>
                </Box>
              )}
            </Box>
          </Card>
        )}
      </MDBox>
    </Grid>
  );
}

TelemetryCard.defaultProps = {
  value: null,
  unit: "",
  color: "dark",
  loading: false,
  percentage: null,
  min: undefined,
  max: undefined,
  avg: undefined,
  trend: null,
  trendAmount: 0,
};

TelemetryCard.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  unit: PropTypes.string,
  color: PropTypes.string,
  loading: PropTypes.bool,
  percentage: PropTypes.shape({
    color: PropTypes.string,
    amount: PropTypes.string,
    label: PropTypes.string,
  }),
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  avg: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  trend: PropTypes.oneOf(["up", "down", "stable", null]),
  trendAmount: PropTypes.number,
};

export default TelemetryCard;
