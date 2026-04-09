# 🚀 Referencia Rápida - Elektricmeter Dashboard

## ⚡ 30 Segundos para Empezar

```bash
# 1. Asegúrate que el backend corre en localhost:4000
cd backend && npm start

# 2. Inicia el frontend
cd frontend && npm start

# Dashboard automáticamente:
# ✓ Se conecta al backend
# ✓ Recibe datos en tiempo real
# ✓ Muestra gráficos actualizados
```

---

## 💻 Comandos Útiles

```bash
# Desarrollo
npm start              # Inicia con hot-reload

# Build para producción
npm run build          # Crea carpeta build/
npm run build && npm start  # Build + start

# Verificar errores
npm run lint           # Linter
```

---

## 🔗 URLs Importantes

| Elemento | URL |
|----------|-----|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:4000/api` |
| Socket.io | `ws://localhost:4000` |
| Endpoint datos | `GET /api/datos` |

---

## 📡 Estructura de Datos

### Socket: `telemetry` event
```
{ voltage, current, power_kw, timestamp }
```

### API: `GET /api/datos`
```
{ voltaje, corriente, potencia }
```

---

## 📚 Archivos de Documentación

| Archivo | Para |
|---------|------|
| `SETUP.md` | Resumen general |
| `DASHBOARD_INTEGRATION.md` | Integración completa |
| `EJEMPLOS_USO.md` | Ejemplos de código |
| `.env.example` | Variables de entorno |
| `QUICK_REFERENCE.md` | Este archivo |

---

## 🐛 Debugging Rápido

```javascript
// En DevTools Console
// 1. ¿Conectado?
import socketService from './src/services/socketService';
socketService.isConnected();  // true/false

// 2. ¿API funciona?
import api from './src/api/axios';
api.get('/datos').then(r => console.log(r.data));

// 3. ¿Datos en store?
import useTelemetryStore from './src/stores/telemetryStore';
useTelemetryStore.getState().points;
```

---

## 🎯 División de Responsabilidades

```
Backend (Node.js)
├── API REST: datos actuales
└── Socket.io: stream en tiempo real

Frontend (React)
├── socketService.js: maneja conexión
├── telemetryStore.js: gestiona estado
├── TelemetryCard: muestra métricas
└── TelemetryChart: dibuja gráficos
```

---

## 📋 Checklist de Funcionamiento

- [ ] Backend en puerto 4000
- [ ] API endpoint `/api/datos` funciona
- [ ] Socket.io emite `telemetry` events
- [ ] Frontend en puerto 3000
- [ ] Avatar verde en dashboard (conectado)
- [ ] Tarjetas muestran números
- [ ] Gráfico tiene líneas animadas
- [ ] Console sin errores rojos

---

## 🆘 Problemas Comunes

### "Cannot connect to localhost:4000"
→ Verifica que backend está corriendo: `netstat -an | findstr :4000`

### "No data in API"
→ Prueba en terminal: `curl http://localhost:4000/api/datos`

### "Socket disconnected"
→ Revisa CORS en backend, debe permitir origen del frontend

### "Graph is empty"
→ Espera a que lleguen datos, mínimo 1 punto para mostrar

---

## 🎨 Personalización Rápida

### Cambiar colores de tarjetas
En `Dashboard/index.js`:
```javascript
<TelemetryCard color="success" ... />  // success, info, warning, error
```

### Cambiar intervalo de actualización
En `socketService.js`:
```javascript
// Cambiar reconexión
reconnectionDelay: 1000,  // ms
```

### Cambiar límite de puntos en gráfico
En `telemetryStore.js`:
```javascript
if (updatedPoints.length > 50) {  // Cambiar 50
  updatedPoints.shift();
}
```

---

## 📊 Variables de Entorno

Crear `.env` en raíz:
```env
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_SOCKET_URL=http://localhost:4000
```

Valores por defecto ya están configurados, estos son opcionales.

---

## 🔐 Seguridad Básica

El archivo `axios.js` incluye:
- ✅ Interceptor de autenticación
- ✅ Manejo de 401 (redirección login)
- ✅ Headers CORS
- ✅ Timeout configurables

---

## 🎬 Próximos Pasos

1. **Guardar histórico**: Agregar base de datos
2. **Alertas**: Notificaciones cuando excede límites  
3. **Reportes**: PDF/CSV de datos
4. **Dashboard admin**: Gestionar usuarios/permisos
5. **Mobile app**: React Native o Flutter

---

## 📸 Estructura Visual

```
Dashboard
├─ Header con Status
├─ Alert (conectado/desconectado)
├─ 4 Tarjetas
│  ├─ Voltaje
│  ├─ Corriente
│  ├─ Potencia
│  └─ Estado
├─ Gráfico 📈
│  ├─ Línea Azul (Potencia)
│  ├─ Línea Verde (Voltaje)
│  └─ Línea Naranja (Corriente)
└─ Footer
```

---

## 🚀 Para Producción

```bash
# 1. Build
npm run build

# 2. Servir archivos estáticos
# Copiar carpeta build/ al servidor

# 3. Actualizar .env con URLs de producción
REACT_APP_API_URL=https://api.prodomain.com/api
REACT_APP_SOCKET_URL=wss://socket.prodomain.com
```

---

## 📞 Referencia de Hooks

```javascript
// Obtener datos
const points = useTelemetryStore(s => s.points);

// Agregar punto
const addPoint = useTelemetryStore(s => s.addPoint);

// Limpiar
const clearPoints = useTelemetryStore(s => s.clearPoints);
```

---

**Last Updated**: 2024
**Status**: ✅ Ready
**Version**: 1.0.0
