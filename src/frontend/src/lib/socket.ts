import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
      autoConnect: false,
      auth: { token: '' },
    });
  }
  return socket;
}

export function connectSocket(accessToken: string): Socket {
  const s = getSocket();
  s.auth = { token: accessToken };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function joinGroup(groupId: string): void {
  getSocket().emit('join:group', groupId);
}

export function leaveGroup(groupId: string): void {
  getSocket().emit('leave:group', groupId);
}
