import { io, Socket } from 'socket.io-client';

const getSocketURL = () => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  
  const hostname = window.location.hostname;
  
  // If we are on localhost, return localhost:4000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:4000`;
  }
  
  // In production, try to connect to the same origin
  // Note: Standard Vercel Serverless won't support Socket.io, 
  // but this ensures the URL is at least valid.
  return window.location.origin;
};

const URL = getSocketURL();

export const socket: Socket = io(URL, {
  transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity, // Keep trying forever
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  timeout: 20000,
});

// Debug logs
socket.on('connect', () => {
  console.log('📡 [Socket] Connected to SAAF Neural Link');
});

socket.on('disconnect', () => {
  console.log('📡 [Socket] Disconnected from SAAF Neural Link');
});
