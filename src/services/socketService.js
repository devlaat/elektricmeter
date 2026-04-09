/**
 * Socket Service
 *
 * Wrapper around socket.io for telemetry data management.
 * Provides hooks and utilities for subscribing to telemetry events.
 */

import socket from "../api/socket/socket";

class SocketService {
  constructor() {
    this.listeners = {};
    this.connectionListeners = [];
    this.disconnectionListeners = [];
    this.errorListeners = [];
    this.setupSocketEvents();
  }

  /**
   * Setup core socket events
   */
  setupSocketEvents() {
    // Handle connection
    socket.on("connect", () => {
      console.log('✓ Socket connected:', socket.id);
      this.connectionListeners.forEach(listener => listener());
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log('✗ Socket disconnected:', reason);
      this.disconnectionListeners.forEach(listener => listener(reason));
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      this.errorListeners.forEach(listener => listener(error));
    });

    // Handle reconnection attempts
    socket.on('reconnecting', (attemptNumber) => {
      console.log(`🔄 Reconnecting... (attempt ${attemptNumber})`);
    });
  }

  /**
   * Initialize socket connection with telemetry listeners
   * @param {Function} onTelemetry - Callback when telemetry data is received
   */
  initTelemetry(onTelemetry) {
    if (!socket.connected) {
      socket.connect();
    }

    // Remove old listeners if they exist
    socket.off('telemetry');

    // Subscribe to telemetry events
    socket.on('telemetry', (data) => {
      // Ensure data has the right structure with proper types
      const telemetryData = {
        timestamp: data?.timestamp ? String(data.timestamp) : new Date().toISOString(),
        voltage: typeof data?.voltage === 'number' ? Number(data.voltage) : (typeof data?.V === 'number' ? Number(data.V) : 0),
        current: typeof data?.current === 'number' ? Number(data.current) : (typeof data?.I === 'number' ? Number(data.I) : 0),
        power_kw: typeof data?.power_kw === 'number' ? Number(data.power_kw) : (typeof data?.P === 'number' ? Number(data.P) : 0)
      };

      if (onTelemetry) {
        onTelemetry(telemetryData);
      }

      // Trigger custom event listeners
      if (this.listeners['telemetry']) {
        this.listeners['telemetry'].forEach(listener => listener(telemetryData));
      }
    });

    return socket;
  }

  /**
   * Subscribe to connection/disconnection/error events or custom events
   * @param {string} event - Event name ('connect', 'disconnect', 'error', or custom)
   * @param {Function} callback - Callback function
   */
  subscribe(event, callback) {
    if (event === 'connect') {
      this.connectionListeners.push(callback);
      // Call immediately if already connected
      if (socket.connected) {
        callback();
      }
      return () => {
        this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
      };
    }

    if (event === 'disconnect') {
      this.disconnectionListeners.push(callback);
      return () => {
        this.disconnectionListeners = this.disconnectionListeners.filter(cb => cb !== callback);
      };
    }

    if (event === 'error') {
      this.errorListeners.push(callback);
      return () => {
        this.errorListeners = this.errorListeners.filter(cb => cb !== callback);
      };
    }

    // Handle custom event listeners
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Unsubscribe from event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  unsubscribe(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event to server
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (socket.connected) {
      socket.emit(event, data);
    } else {
      console.warn(`Socket not connected. Cannot emit ${event}`);
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return socket.connected;
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    socket.disconnect();
  }

  /**
   * Connect socket
   */
  connect() {
    if (!socket.connected) {
      socket.connect();
    }
  }
}

// Export singleton instance
export default new SocketService();
