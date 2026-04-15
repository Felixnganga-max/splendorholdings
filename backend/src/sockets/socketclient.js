/**
 * socket.client.js  —  Frontend Socket.IO client for the Slendor dashboard.
 *
 * COPY THIS FILE into your React project (e.g. src/lib/socket.js).
 * Install the client lib:  npm install socket.io-client
 *
 * ─── Usage ───────────────────────────────────────────────────────────────────
 *
 *  // After login — pass the JWT access token
 *  import { connectSocket } from '@/lib/socket';
 *  connectSocket(accessToken);
 *
 *  // In any React component or context
 *  import { onSocketEvent, emitSocketEvent } from '@/lib/socket';
 *
 *  useEffect(() => {
 *    const unsub = onSocketEvent('order:new', (data) => {
 *      setOrders(prev => [data.order, ...prev]);
 *    });
 *    return unsub; // cleans up the listener on unmount
 *  }, []);
 *
 *  // On logout
 *  import { disconnectSocket } from '@/lib/socket';
 *  disconnectSocket();
 *
 * ─── Events you can listen to ────────────────────────────────────────────────
 *
 *  system:connected       { socketId, userId, role, rooms }
 *  system:onlineCount     { count }            — admin only
 *  system:pong            { timestamp }        — reply to system:ping
 *
 *  order:new              { order }            — admin/manager
 *  order:statusUpdated    { orderId, orderNumber, propertyName,
 *                           previousStatus, newStatus }  — buyer
 *
 *  inquiry:new            { inquiry }          — admin/manager
 *  inquiry:replied        { inquiryId, propertyId, message } — sender
 *  inquiry:typing         { userId, name, isTyping }  — inquiry thread
 *
 * ─── Events you can emit ─────────────────────────────────────────────────────
 *
 *  property:watch         propertyId (string)  — admin/manager
 *  property:unwatch       propertyId (string)  — admin/manager
 *  inquiry:watch          inquiryId  (string)  — admin/manager
 *  inquiry:unwatch        inquiryId  (string)  — admin/manager
 *  inquiry:typing         { inquiryId, isTyping }
 *  system:ping            (no payload)
 */

import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Module-level socket reference — one connection shared across the whole app
let socket = null;

// ── Connection ────────────────────────────────────────────────────────────────

/**
 * Connect to the Socket.IO server.
 * Safe to call multiple times — returns the existing socket if already connected.
 *
 * @param {string} accessToken  JWT access token from your auth state
 * @returns {Socket}
 */
export const connectSocket = (accessToken) => {
  if (socket?.connected) return socket;

  // If there's a stale disconnected socket, clean it up first
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SERVER_URL, {
    // Send the JWT in the handshake auth payload (not in query string)
    auth: { token: accessToken },
    transports: ["websocket", "polling"],
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
    reconnectionAttempts: 6,
    timeout: 12000,
    autoConnect: true,
  });

  // ── Lifecycle logging (remove in production if noisy) ─────────────────────

  socket.on("connect", () => {
    console.info(`[Socket] Connected — id: ${socket.id}`);
  });

  socket.on("disconnect", (reason) => {
    console.warn(`[Socket] Disconnected — reason: ${reason}`);
    // If the server dropped the connection (not us), Socket.IO will
    // auto-reconnect. If WE called disconnect(), it won't.
  });

  socket.on("connect_error", (err) => {
    const code = err.data || err.message;
    console.error(`[Socket] Connection error: ${code}`);

    // Auth errors — don't keep retrying with a bad token
    if (
      [
        "AUTH_MISSING",
        "AUTH_INVALID",
        "AUTH_EXPIRED",
        "AUTH_INACTIVE",
      ].includes(code)
    ) {
      console.error("[Socket] Auth failed — stopping reconnection");
      socket.disconnect();
      // Dispatch a global event so your auth context can handle it
      // (e.g. trigger a token refresh or redirect to login)
      window.dispatchEvent(
        new CustomEvent("socket:authFailed", { detail: { code } }),
      );
    }
  });

  socket.on("reconnect", (attempt) => {
    console.info(`[Socket] Reconnected after ${attempt} attempt(s)`);
  });

  socket.on("reconnect_failed", () => {
    console.error("[Socket] Reconnection failed — all attempts exhausted");
    window.dispatchEvent(new CustomEvent("socket:reconnectFailed"));
  });

  socket.on("reconnect_attempt", (attempt) => {
    console.debug(`[Socket] Reconnect attempt ${attempt}…`);
  });

  return socket;
};

/**
 * Get the active socket instance.
 * Returns null if connectSocket() has not been called yet.
 */
export const getSocket = () => socket;

/**
 * Returns true if the socket is currently connected.
 */
export const isConnected = () => Boolean(socket?.connected);

/**
 * Gracefully disconnect and clear all listeners.
 * Call this on logout.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.info("[Socket] Disconnected cleanly");
  }
};

/**
 * Update the auth token without a full page reload.
 * Call this after a silent token refresh so the socket re-authenticates.
 *
 * @param {string} newAccessToken  The freshly issued access token
 */
export const updateSocketToken = (newAccessToken) => {
  disconnectSocket();
  connectSocket(newAccessToken);
};

// ── Event helpers ─────────────────────────────────────────────────────────────

/**
 * Subscribe to a server event.
 * Returns a cleanup function — use it as the return value of useEffect.
 *
 * @param {string}   event    Socket.IO event name
 * @param {Function} handler  Callback — receives the event payload
 * @returns {Function}        Unsubscribe function
 *
 * @example
 * useEffect(() => {
 *   return onSocketEvent('order:new', (data) => {
 *     toast.success(`New order: ${data.order.orderNumber}`);
 *   });
 * }, []);
 */
export const onSocketEvent = (event, handler) => {
  if (!socket) {
    console.warn(
      `[Socket] onSocketEvent('${event}') called before connectSocket()`,
    );
    return () => {};
  }
  socket.on(event, handler);
  return () => {
    if (socket) socket.off(event, handler);
  };
};

/**
 * Emit an event to the server.
 * Silently ignores calls when the socket is not connected.
 *
 * @param {string} event    Event name
 * @param {*}      payload  Any JSON-serialisable value
 */
export const emitSocketEvent = (event, payload) => {
  if (socket?.connected) {
    socket.emit(event, payload);
  } else {
    console.warn(`[Socket] Cannot emit '${event}' — socket not connected`);
  }
};

// ── Domain-specific helpers ───────────────────────────────────────────────────

/**
 * Subscribe to a specific property's activity feed.
 * Only meaningful for admin and manager roles.
 *
 * @param {string} propertyId
 */
export const watchProperty = (propertyId) =>
  emitSocketEvent("property:watch", propertyId);
export const unwatchProperty = (propertyId) =>
  emitSocketEvent("property:unwatch", propertyId);

/**
 * Subscribe to a specific inquiry thread (for typing indicators and
 * real-time reply updates).
 *
 * @param {string} inquiryId
 */
export const watchInquiry = (inquiryId) =>
  emitSocketEvent("inquiry:watch", inquiryId);
export const unwatchInquiry = (inquiryId) =>
  emitSocketEvent("inquiry:unwatch", inquiryId);

/**
 * Send a typing indicator for an inquiry reply.
 *
 * @param {string}  inquiryId
 * @param {boolean} isTyping
 */
export const sendTypingIndicator = (inquiryId, isTyping) => {
  emitSocketEvent("inquiry:typing", { inquiryId, isTyping });
};

/**
 * Send a keepalive ping. Useful if your token refresh logic needs
 * to confirm the socket connection is still alive.
 */
export const ping = () => emitSocketEvent("system:ping");

// ── React hooks (paste into your own hooks file) ──────────────────────────────
//
// Copy these into e.g. src/hooks/useSocket.js in your React project:
//
// import { useEffect, useCallback } from 'react';
// import { onSocketEvent, emitSocketEvent, connectSocket, disconnectSocket } from '@/lib/socket';
//
// /** Subscribe to a socket event with automatic cleanup. */
// export const useSocketEvent = (event, handler) => {
//   const stableHandler = useCallback(handler, []);
//   useEffect(() => {
//     return onSocketEvent(event, stableHandler);
//   }, [event, stableHandler]);
// };
//
// /** Connect on mount, disconnect on unmount (use at the app root). */
// export const useSocketConnection = (accessToken) => {
//   useEffect(() => {
//     if (!accessToken) return;
//     connectSocket(accessToken);
//     return () => disconnectSocket();
//   }, [accessToken]);
// };
