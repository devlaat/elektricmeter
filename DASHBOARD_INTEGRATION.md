# 🔌 Integración de Dashboard Elektricmeter - Documentación

## 📋 Resumen de la Integración

Se ha integrado exitosamente el sistema de telemetría en tiempo real en el Material Dashboard React. El dashboard ahora recibe datos de voltaje, corriente y potencia desde un backend ESP32/Node.js a través de WebSockets (Socket.io).

## 🏗️ Estructura del Proyecto

```
src/
├── api/
│   ├── axios.js                 # ✅ Configuración mejorada de Axios
│   └── socket/
│       └── socket.js            # ✅ Configuración mejorada de Socket.io
├── services/
│   └── socketService.js         # ✅ Wrapper de Socket.io para telemetría
├── stores/
│   └── telemetryStore.js        # ✅ Store de Zustand para datos de telemetría
├── components/
│   ├── TelemetryCard/
│   │   └── index.js             # ✅ Componente de tarjeta de mediciones
│   ├── TelemetryChart/
│   │   └── index.js             # ✅ Componente de gráfico en tiempo real
│   └── ...otros componentes
└── layouts/
    └── dashboard/
        └── index.js             # ✅ Dashboard actualizado con telemetría
```

## 🔗 Configuración de API y WebSocket

### Variables de Entorno (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_API_TIMEOUT=5000

# WebSocket Configuration
REACT_APP_SOCKET_URL=http://localhost:4000
```

### Configuración por Defecto

- **API Base URL**: `http://localhost:4000/api`
- **Socket.io URL**: `http://localhost:4000`
- **Timeout API**: 5000ms

## 📡 Flujo de Datos

```
ESP32 (mediciones)
    ↓
Backend Node.js (http://localhost:4000)
    ↓
Frontend React
    ├── Socket.io (eventos telemetría en tiempo real)
    ├── Axios API (datos históricos)
    └── Zustand Store (manejo de estado)
        ↓
    Components (TelemetryCard, TelemetryChart)
        ↓
    Dashboard UI
```

## 🎯 Componentes Principales

### 1. **TelemetryStore (Zustand)**

Maneja el estado de los datos de telemetría:

```javascript
import useTelemetryStore from 'stores/telemetryStore';

// Hook para obtener datos
const points = useTelemetryStore(s => s.points);
const addPoint = useTelemetryStore(s => s.addPoint);

// Agregar punto de telemetría
addPoint({
  timestamp: '2024-01-01T10:00:00Z',
  voltage: 220.5,
  current: 2.3,
  power_kw: 0.507
});
```

### 2. **SocketService**

Servicio para manejar conexión y eventos de Socket.io:

```javascript
import socketService from 'services/socketService';

// Inicializar escucha de telemetría
socketService.initTelemetry((data) => {
  console.log('Datos recibidos:', data);
  // { voltage, current, power_kw, timestamp }
});

// Suscribirse a eventos personalizados
const unsubscribe = socketService.subscribe('telemetry', (data) => {
  console.log('Telemetría:', data);
});

// Emitir eventos al servidor
socketService.emit('control', { action: 'reset' });

// Verificar conexión
if (socketService.isConnected()) {
  console.log('Conectado');
}
```

### 3. **TelemetryCard**

Componente para mostrar una medición:

```javascript
import TelemetryCard from 'components/TelemetryCard';

<TelemetryCard
  label="⚡ Voltaje (V)"
  icon="electric_bolt"
  value={220.5}
  unit="V"
  color="info"
  loading={false}
/>
```

### 4. **TelemetryChart**

Componente gráfico con Recharts:

```javascript
import TelemetryChart from 'components/TelemetryChart';

<TelemetryChart
  title="Consumo en Tiempo Real"
  data={points}  // Array de puntos
/>
```

## 📊 Estructura de Datos

### Punto de Telemetría

```javascript
{
  timestamp: "2024-01-01T10:00:00Z",  // ISO string
  timeLabel: "10:00:00",               // Formato local para gráfico
  voltage: 220.5,                      // Voltaje en V
  current: 2.3,                        // Corriente en A
  power_kw: 0.507                      // Potencia en kW
}
```

### Respuesta de API (/datos)

```javascript
{
  voltaje: 220.5,      // Voltaje actual
  corriente: 2.3,      // Corriente actual
  potencia: 507        // Potencia en W
}
```

## 🚀 Uso en el Dashboard

El dashboard (`src/layouts/dashboard/index.js`) ahora:

1. ✅ Se conecta automáticamente a Socket.io al cargar
2. ✅ Escucha eventos de telemetría en tiempo real
3. ✅ Almacena datos en Zustand Store
4. ✅ Muestra tarjetas con valores actualizados
5. ✅ Gráfica los últimos 50 puntos en Recharts
6. ✅ Muestra estado de conexión
7. ✅ Incluye panel de debug (en desarrollo)

## 🔧 Configuración del Backend

Tu backend debe:

1. **Escuchar en puerto 4000**
2. **Exponer API REST en `/api`**
   - Endpoint: `GET /api/datos` - Retorna últimas mediciones
3. **Usar Socket.io para eventos en tiempo real**
   - Evento: `telemetry` con datos `{ voltage, current, power_kw, timestamp }`

### Ejemplo de Backend (Node.js)

```javascript
const io = require('socket.io')(4000, {
  cors: { origin: "*" }
});

const express = require('express');
const app = express();

// API Endpoint
app.get('/api/datos', (req, res) => {
  res.json({
    voltaje: 220.5,
    corriente: 2.3,
    potencia: 507
  });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Simular telemetría cada segundo
  setInterval(() => {
    socket.emit('telemetry', {
      voltage: 220 + Math.random() * 10,
      current: 2 + Math.random() * 1,
      power_kw: (220 + Math.random() * 10) * (2 + Math.random() * 1) / 1000,
      timestamp: new Date().toISOString()
    });
  }, 1000);
});
```

## 🔍 Debugging

### Panel de Debug (Desarrollo)

Cuando estés en desarrollo (`NODE_ENV === 'development'`), verás un panel con:
- Eventos de conexión/desconexión
- Llamadas a API
- Datos de telemetría recibidos
- Errores

### Verificar Conexión en Consola

```javascript
// En la consola del navegador
import socketService from 'services/socketService';

// Ver estado
socketService.isConnected();

// Escuchar eventos
socketService.subscribe('telemetry', console.log);
```

## 📝 Notas Importantes

1. **Zustand**: El store guarda máximo 50 puntos (para rendimiento)
2. **Socket.io**: Se auto-reconecta si la conexión se pierde
3. **Axios**: Incluye interceptores para autenticación y manejo de errores
4. **Componentes**: Usan Material-UI y pueden ser customizados fácilmente

## 🛠️ Troubleshooting

### "No se conecta a Socket.io"
- Verifica que el backend está corriendo en `http://localhost:4000`
- Revisa la consola del navegador para errores CORS
- Asegúrate que Socket.io está habilitado en el backend

### "No llegan datos de API"
- Verifica que el endpoint `/api/datos` existe en el backend
- Prueba directamente: `curl http://localhost:4000/api/datos`
- Revisa la pestaña Network en DevTools

### "La gráfica está vacía"
- Espera a que lleguen puntos de telemetría (mínimo 1)
- Verifica que el evento `telemetry` se está emitiendo correctamente
- Revisa el panel de debug para ver errores

## 📦 Dependencias Instaladas

```json
{
  "recharts": "^2.x",
  "zustand": "^4.x",
  "socket.io-client": "^4.8.3",
  "axios": "^1.13.6"
}
```

## ✅ Checklist de Configuración

- [ ] Backend corriendo en `http://localhost:4000`
- [ ] API endpoint `/api/datos` disponible
- [ ] Socket.io configurado en backend
- [ ] Variables de entorno configuradas (opcional)
- [ ] Frontend corriendo con `npm start`
- [ ] Dashboard muestra estado de conexión correctamente
- [ ] Datos de telemetría llegando en tiempo real
- [ ] Gráfica actualizándose con nuevos datos

## 🎉 Listo para Usar

Tu dashboard está completamente integrado y listo para monitorear en tiempo real:
- ⚡ Voltaje
- 🔌 Corriente  
- 💡 Potencia
- 📈 Histórico de consumo

¡Disfruta del monitoreo! 🚀
