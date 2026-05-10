import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket } from '../lib/socket';
import { useToast } from './ToastContext';

interface SocketContextType {
  isConnected: boolean;
  socket: typeof socket;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const { showToast } = useToast();

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      showToast('Neural Link Established', 'success');
    };

    const onDisconnect = (reason: string) => {
      setIsConnected(false);
      if (reason === 'io server disconnect' || reason === 'transport close') {
        showToast('Neural Link Weak – Attempting Reconnection', 'warning');
      }
    };

    const onConnectError = (error: Error) => {
      setIsConnected(false);
      console.error('Socket Connection Error:', error);
      // No toast here to avoid spamming on every retry
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Initial check
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, [showToast]);

  return (
    <SocketContext.Provider value={{ isConnected, socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
