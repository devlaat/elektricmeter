/**
 * Ejemplos de Uso - Integración de Telemetría
 * 
 * Este archivo contiene ejemplos de cómo usar los componentes
 * y servicios de telemetría en otras partes del dashboard
 */

// ============================================
// 1. USAR DATOS DE TELEMETRÍA EN UN COMPONENTE
// ============================================

import React, { useEffect, useState } from 'react';
import useTelemetryStore from 'stores/telemetryStore';

export function MiComponente() {
  // Obtener datos del store
  const points = useTelemetryStore(s => s.points);
  const lastPoint = points[points.length - 1];

  return (
    <div>
      <h1>Últimas mediciones:</h1>
      {lastPoint && (
        <>
          <p>Voltaje: {lastPoint.voltage} V</p>
          <p>Corriente: {lastPoint.current} A</p>
          <p>Potencia: {lastPoint.power_kw} kW</p>
        </>
      )}
    </div>
  );
}

// ============================================
// 2. ESCUCHAR CAMBIOS DE TELEMETRÍA EN TIEMPO REAL
// ============================================

import socketService from 'services/socketService';

export function MiComponenteConSocket() {
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    // Suscribirse a eventos de telemetría
    const unsubscribe = socketService.subscribe('telemetry', (data) => {
      console.log('Nueva telemetría:', data);
      setTelemetry(data);
    });

    return unsubscribe; // Cleanup
  }, []);

  return <div>Última telemetría: {JSON.stringify(telemetry)}</div>;
}

// ============================================
// 3. CREAR UNA TARJETA PERSONALIZADA
// ============================================

import TelemetryCard from 'components/TelemetryCard';

export function MisCardas() {
  const points = useTelemetryStore(s => s.points);
  const lastPoint = points[points.length - 1];

  return (
    <Grid container spacing={2}>
      <TelemetryCard
        label="⚡ Voltaje"
        icon="electric_bolt"
        value={lastPoint?.voltage}
        unit="V"
        color="info"
      />
      <TelemetryCard
        label="🔌 Corriente"
        icon="current_dense"
        value={lastPoint?.current}
        unit="A"
        color="warning"
      />
      <TelemetryCard
        label="💡 Potencia"
        icon="flash_on"
        value={lastPoint?.power_kw}
        unit="kW"
        color="success"
      />
    </Grid>
  );
}

// ============================================
// 4. MOSTRAR ESTADÍSTICAS
// ============================================

export function Estadisticas() {
  const points = useTelemetryStore(s => s.points);

  const stats = {
    avgVoltage: points.length
      ? (points.reduce((a, b) => a + b.voltage, 0) / points.length).toFixed(2)
      : 0,
    maxPower: points.length
      ? Math.max(...points.map(p => p.power_kw)).toFixed(3)
      : 0,
    minPower: points.length
      ? Math.min(...points.map(p => p.power_kw)).toFixed(3)
      : 0,
  };

  return (
    <div>
      <p>Voltaje promedio: {stats.avgVoltage} V</p>
      <p>Potencia máxima: {stats.maxPower} kW</p>
      <p>Potencia mínima: {stats.minPower} kW</p>
    </div>
  );
}

// ============================================
// 5. EMITIR EVENTOS AL SERVIDOR
// ============================================

export function ControlPanel() {
  const handleReset = () => {
    socketService.emit('control', { action: 'reset' });
  };

  const handleStop = () => {
    socketService.emit('control', { action: 'stop' });
  };

  const handleStart = () => {
    socketService.emit('control', { action: 'start' });
  };

  return (
    <div>
      <button onClick={handleStart}>Iniciar</button>
      <button onClick={handleStop}>Detener</button>
      <button onClick={handleReset}>Reiniciar</button>
    </div>
  );
}

// ============================================
// 6. USAR FETCH DE API PARA DATOS HISTÓRICOS
// ============================================

import api from 'api/axios';

export function HistoricoConsumo() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistorico = async () => {
    setLoading(true);
    try {
      // Ejemplos de endpoints que podrías usar
      const response = await api.get('/telemetry/historico?days=7');
      // o
      // const response = await api.get('/estadisticas/diarias');
      // o
      // const response = await api.get('/datos/exportar');
      
      setHistorico(response.data);
    } catch (error) {
      console.error('Error al obtener histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  return (
    <div>
      {loading ? 'Cargando...' :
        historico.map((item, i) => (
          <div key={i}>
            {item.fecha}: {item.consumo} kWh
          </div>
        ))
      }
    </div>
  );
}

// ============================================
// 7. CREAR UN HOOK PERSONALIZADO
// ============================================

export function useTelemetry() {
  const points = useTelemetryStore(s => s.points);
  const addPoint = useTelemetryStore(s => s.addPoint);
  const clearPoints = useTelemetryStore(s => s.clearPoints);

  const lastPoint = points[points.length - 1];

  const stats = {
    count: points.length,
    lastVoltage: lastPoint?.voltage,
    lastCurrent: lastPoint?.current,
    lastPower: lastPoint?.power_kw,
    avgVoltage: points.length
      ? (points.reduce((a, b) => a + b.voltage, 0) / points.length).toFixed(2)
      : 0,
    maxVoltage: points.length ? Math.max(...points.map(p => p.voltage)) : 0,
    minVoltage: points.length ? Math.min(...points.map(p => p.voltage)) : 0,
  };

  return { points, addPoint, clearPoints, lastPoint, stats };
}

// Uso del hook
export function MiComponenteConHook() {
  const { lastPoint, stats } = useTelemetry();

  return (
    <div>
      <p>Punto actual: {JSON.stringify(lastPoint)}</p>
      <p>Estadísticas: {JSON.stringify(stats)}</p>
    </div>
  );
}

// ============================================
// 8. MANEJO DE ERRORES Y RECONEXIÓN
// ============================================

export function ConexionMonitor() {
  const [status, setStatus] = useState('conectando');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    const handleConnect = () => {
      setStatus('conectado');
      setReconnectAttempts(0);
    };

    const handleDisconnect = () => {
      setStatus('desconectado');
    };

    const handleError = () => {
      setStatus('error');
      setReconnectAttempts(prev => prev + 1);
    };

    socketService.subscribe('connect', handleConnect);
    socketService.subscribe('disconnect', handleDisconnect);
    socketService.subscribe('error', handleError);

    return () => {
      // Cleanup si es necesario
    };
  }, []);

  return (
    <div>
      <p>Estado: {status}</p>
      <p>Intentos de reconexión: {reconnectAttempts}</p>
      <p>Socket conectado: {socketService.isConnected() ? 'Sí' : 'No'}</p>
    </div>
  );
}

// ============================================
// 9. EXPORTAR DATOS A CSV
// ============================================

export function ExportarDatos() {
  const points = useTelemetryStore(s => s.points);

  const exportToCSV = () => {
    const csv = [
      ['Hora', 'Voltaje (V)', 'Corriente (A)', 'Potencia (kW)'],
      ...points.map(p => [
        p.timeLabel,
        p.voltage,
        p.current,
        p.power_kw
      ])
    ];

    const csvString = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetria_${new Date().toISOString()}.csv`;
    a.click();
  };

  return <button onClick={exportToCSV}>Descargar CSV</button>;
}

// ============================================
// 10. ALERTAS CUANDO EXCEDE LÍMITES
// ============================================

export function AlertasLimites() {
  const [alertas, setAlertas] = useState([]);
  const points = useTelemetryStore(s => s.points);

  useEffect(() => {
    const unsubscribe = socketService.subscribe('telemetry', (data) => {
      const nuevasAlertas = [];

      if (data.voltage > 240) {
        nuevasAlertas.push('⚠ Voltaje alto: ' + data.voltage + ' V');
      }
      if (data.current > 16) {
        nuevasAlertas.push('⚠ Corriente alta: ' + data.current + ' A');
      }
      if (data.power_kw > 3.5) {
        nuevasAlertas.push('⚠ Potencia alta: ' + data.power_kw + ' kW');
      }

      if (nuevasAlertas.length > 0) {
        setAlertas(prev => [...prev, ...nuevasAlertas]);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div>
      {alertas.map((alerta, i) => (
        <div key={i} style={{ color: 'red' }}>
          {alerta}
        </div>
      ))}
    </div>
  );
}
