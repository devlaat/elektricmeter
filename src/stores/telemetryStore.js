import { create } from 'zustand';

const useTelemetryStore = create((set) => {
  return {
    // Points array for charts
    points: [],

    // Add a telemetry point
    addPoint: (point) =>
      set((state) => {
        // Validate and format timestamp
        const timestamp = point?.timestamp ? String(point.timestamp) : new Date().toISOString();
        const date = new Date(timestamp);
        const timeLabel = date.toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        // Ensure all numeric values are actually numbers
        const newPoint = {
          timestamp: timestamp,
          timeLabel: String(timeLabel),
          power_kw: Number(point.power_kw) || 0,
          voltage: Number(point.voltage) || 0,
          current: Number(point.current) || 0
        };

        // Keep only last 50 points for performance
        const updatedPoints = [...state.points, newPoint];
        if (updatedPoints.length > 50) {
          updatedPoints.shift();
        }

        return { points: updatedPoints };
      }),

    // Clear all points
    clearPoints: () => set({ points: [] }),

    // Get statistics from points
    getStats: () => {
      return (state) => {
        const points = state.points;
        if (points.length === 0) {
          return {
            avgVoltage: 0,
            maxVoltage: 0,
            minVoltage: 0,
            avgCurrent: 0,
            maxCurrent: 0,
            minCurrent: 0,
            avgPower: 0,
            maxPower: 0,
            minPower: 0
          };
        }

        const voltages = points.map(p => p.voltage).filter(v => v !== null && v !== undefined);
        const currents = points.map(p => p.current).filter(c => c !== null && c !== undefined);
        const powers = points.map(p => p.power_kw).filter(p => p !== null && p !== undefined);

        return {
          avgVoltage: voltages.length ? (voltages.reduce((a, b) => a + b, 0) / voltages.length) : 0,
          maxVoltage: voltages.length ? Math.max(...voltages) : 0,
          minVoltage: voltages.length ? Math.min(...voltages) : 0,
          avgCurrent: currents.length ? (currents.reduce((a, b) => a + b, 0) / currents.length) : 0,
          maxCurrent: currents.length ? Math.max(...currents) : 0,
          minCurrent: currents.length ? Math.min(...currents) : 0,
          avgPower: powers.length ? (powers.reduce((a, b) => a + b, 0) / powers.length) : 0,
          maxPower: powers.length ? Math.max(...powers) : 0,
          minPower: powers.length ? Math.min(...powers) : 0
        };
      };
    }
  };
});

export default useTelemetryStore;
