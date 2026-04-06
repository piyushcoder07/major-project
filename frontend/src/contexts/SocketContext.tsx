import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { Message } from '../types/message';

const DEFAULT_RENDER_BACKEND_URL = 'https://mentor-connect-backend-piyushcoder07-20260406.onrender.com';

const resolveSocketUrl = (): string => {
  const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim();
  if (configuredSocketUrl) {
    return configuredSocketUrl.replace(/\/+$/, '');
  }

  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredApiUrl && /^https?:\/\//i.test(configuredApiUrl)) {
    return configuredApiUrl.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
  }

  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalHost) {
    return window.location.origin;
  }

  return DEFAULT_RENDER_BACKEND_URL;
};

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onNewMessage: (callback: (message: Message) => void) => void;
  offNewMessage: (callback: (message: Message) => void) => void;
  joinAppointmentRoom: (appointmentId: string) => void;
  leaveAppointmentRoom: (appointmentId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      
      // Validate token before attempting socket connection
      if (!token) {
        console.warn('No token available for socket connection');
        return;
      }

      // Basic token format validation
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Invalid token format for socket connection');
        return;
      }

      // Additional validation: check if token payload can be decoded
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Date.now() / 1000;
        
        // Don't connect if token is expired
        if (payload.exp && payload.exp < currentTime) {
          console.warn('Token expired, not connecting socket');
          return;
        }
      } catch (decodeError) {
        console.warn('Failed to decode token payload for socket connection:', decodeError);
        return;
      }

      const socketInstance = io(resolveSocketUrl(), {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        
        // If it's an authentication error, clear the token
        if (error.message?.includes('authentication') || error.message?.includes('token')) {
          console.warn('Socket authentication failed, clearing token');
          localStorage.removeItem('token');
        }
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // If no user, clean up socket connection
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user]);

  const onNewMessage = (callback: (message: Message) => void) => {
    if (socket) {
      socket.on('new-message', callback);
    }
  };

  const offNewMessage = (callback: (message: Message) => void) => {
    if (socket) {
      socket.off('new-message', callback);
    }
  };

  const joinAppointmentRoom = (appointmentId: string) => {
    if (socket) {
      socket.emit('join-appointment', appointmentId);
    }
  };

  const leaveAppointmentRoom = (appointmentId: string) => {
    if (socket) {
      socket.emit('leave-appointment', appointmentId);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    onNewMessage,
    offNewMessage,
    joinAppointmentRoom,
    leaveAppointmentRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};