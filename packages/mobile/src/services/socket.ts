import { io, Socket } from 'socket.io-client';
import { SocketEvent } from '@showguessr/shared';

// Update this to your server URL - use your local IP for mobile development
const SERVER_URL = '192.168.1.11:3001';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on(SocketEvent.CONNECT, () => {
      console.log('Connected to server');
    });

    this.socket.on(SocketEvent.DISCONNECT, () => {
      console.log('Disconnected from server');
    });

    this.socket.on(SocketEvent.ERROR, (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
