import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import next from 'next';
import { GameRoomManager } from './src/lib/GameRoomManager';
import { SocketEventHandler } from './src/lib/SocketEventHandler';
import { logger } from './src/lib/logger';
import { CONFIG } from './src/constants';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from './src/types/socket';

const dev = CONFIG.NODE_ENV !== 'production';
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const port = CONFIG.PORT;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    }
  );

  // Initialize managers
  const roomManager = new GameRoomManager();
  const eventHandler = new SocketEventHandler(io, roomManager);

  // Handle connections
  io.on('connection', (socket) => {
    eventHandler.handleConnection(socket);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, closing server gracefully');
    httpServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  httpServer.listen(port, () => {
    logger.info(`Server ready on http://${hostname}:${port}`);
  });
});
