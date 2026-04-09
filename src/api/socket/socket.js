import { io } from "socket.io-client";

/**
 * WebSocket/Socket.io Configuration
 *
 * Configures the connection to the backend WebSocket server.
 * The backend runs on: http://localhost:4000
 *
 * Environment variables:
 * - REACT_APP_SOCKET_URL: Override socket URL (default: http://localhost:4000)
 */

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ["websocket", "polling"],
});

// Connection event handlers
socket.on("connect", () => {
  console.log('✓ Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.warn('✗ Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

export default socket;