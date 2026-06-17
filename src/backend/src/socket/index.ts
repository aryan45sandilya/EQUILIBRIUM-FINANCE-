import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import logger from '../lib/logger';

let io: SocketServer;
const userSockets = new Map<string, Set<string>>();

function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch { return null; }
}

export function initSocket(server: HttpServer): SocketServer {
  io = new SocketServer(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('No token'));
    const decoded = decodeJwt(token);
    if (!decoded?.sub) return next(new Error('Invalid token'));
    (socket as any).clerkId = decoded.sub;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const clerkId = (socket as any).clerkId as string;
    if (!userSockets.has(clerkId)) userSockets.set(clerkId, new Set());
    userSockets.get(clerkId)!.add(socket.id);
    socket.on('join:group', (gid: string) => socket.join(`group:${gid}`));
    socket.on('leave:group', (gid: string) => socket.leave(`group:${gid}`));
    socket.on('disconnect', () => {
      userSockets.get(clerkId)?.delete(socket.id);
      if (!userSockets.get(clerkId)?.size) userSockets.delete(clerkId);
    });
  });

  return io;
}

export function emitToGroup(groupId: string, event: string, data: unknown): void {
  io?.to(`group:${groupId}`).emit(event, data);
}

export function emitToUser(clerkId: string, event: string, data: unknown): void {
  userSockets.get(clerkId)?.forEach((sid) => io?.to(sid).emit(event, data));
}

export { io };
