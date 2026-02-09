import { Server as SocketIOServer, Socket } from 'socket.io';
import { GameRoomManager } from './GameRoomManager';
import { makeMove, switchPlayer } from '../utils/gameLogic';
import { SOCKET_EVENTS, ERROR_MESSAGES } from '../constants';
import { logger } from './logger';
import { Player } from '../types/game';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  MakeMovePayload,
} from '../types/socket';

export class SocketEventHandler {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  private roomManager: GameRoomManager;

  constructor(
    io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>,
    roomManager: GameRoomManager
  ) {
    this.io = io;
    this.roomManager = roomManager;
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket: Socket): void {
    logger.info('Client connected', { socketId: socket.id });

    socket.on(SOCKET_EVENTS.CREATE_ROOM, () => this.handleCreateRoom(socket));
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (roomId) =>
      this.handleJoinRoom(socket, roomId)
    );
    socket.on(SOCKET_EVENTS.MAKE_MOVE, (data) =>
      this.handleMakeMove(socket, data)
    );
    socket.on(SOCKET_EVENTS.PASS, (roomId) => this.handlePass(socket, roomId));
    socket.on(SOCKET_EVENTS.RESIGN, (roomId) =>
      this.handleResign(socket, roomId)
    );
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  /**
   * Create a new room
   */
  private handleCreateRoom(socket: Socket): void {
    try {
      const { roomId, gameState } = this.roomManager.createRoom(socket.id);
      socket.join(roomId);

      socket.emit(SOCKET_EVENTS.ROOM_CREATED, { roomId, gameState });
    } catch (error) {
      logger.error('Error creating room', { socketId: socket.id, error });
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Failed to create room',
      });
    }
  }

  /**
   * Join an existing room
   */
  private handleJoinRoom(socket: Socket, roomId: string): void {
    try {
      const gameState = this.roomManager.joinRoom(roomId, socket.id);
      socket.join(roomId);

      this.io.to(roomId).emit(SOCKET_EVENTS.GAME_START, gameState);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to join room';
      logger.warn('Failed to join room', { socketId: socket.id, roomId, error });
      socket.emit(SOCKET_EVENTS.ERROR, { message });
    }
  }

  /**
   * Handle player move
   */
  private handleMakeMove(socket: Socket, data: MakeMovePayload): void {
    const { roomId, x, y } = data;

    try {
      const gameState = this.roomManager.getRoom(roomId);

      if (!gameState) {
        throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
      }

      // Verify player's turn
      const playerColor = this.getPlayerColor(socket.id, gameState);
      if (!playerColor) {
        throw new Error('Player not in this game');
      }

      if (gameState.currentPlayer !== playerColor) {
        throw new Error(ERROR_MESSAGES.NOT_YOUR_TURN);
      }

      // Attempt move
      const result = makeMove(gameState, x, y);

      if (!result.valid) {
        throw new Error(result.error || ERROR_MESSAGES.INVALID_MOVE);
      }

      // Update game state
      gameState.board = result.newBoard!;
      gameState.lastMove = { x, y };
      gameState.koPoint = result.koPoint || null;
      gameState.passed = false;

      // Update captured stones
      if (result.captured && result.captured > 0) {
        if (gameState.currentPlayer === 1) {
          gameState.capturedStones.black += result.captured;
        } else {
          gameState.capturedStones.white += result.captured;
        }
      }

      // Switch player
      gameState.currentPlayer = switchPlayer(gameState.currentPlayer);

      // Save and broadcast
      this.roomManager.updateRoom(roomId, gameState);
      this.io.to(roomId).emit(SOCKET_EVENTS.GAME_UPDATE, gameState);

      logger.debug('Move made', { roomId, x, y, playerColor });
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.INVALID_MOVE;
      logger.warn('Invalid move', { socketId: socket.id, roomId, x, y, error });
      socket.emit(SOCKET_EVENTS.ERROR, { message });
    }
  }

  /**
   * Handle pass
   */
  private handlePass(socket: Socket, roomId: string): void {
    try {
      const gameState = this.roomManager.getRoom(roomId);

      if (!gameState) {
        throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
      }

      const playerColor = this.getPlayerColor(socket.id, gameState);
      if (!playerColor) {
        throw new Error('Player not in this game');
      }

      if (gameState.currentPlayer !== playerColor) {
        throw new Error(ERROR_MESSAGES.NOT_YOUR_TURN);
      }

      // Check for consecutive pass (game end)
      if (gameState.passed) {
        gameState.winner = null; // Draw or counting needed
        this.io.to(roomId).emit(SOCKET_EVENTS.GAME_END, gameState);
        logger.info('Game ended by double pass', { roomId });
        return;
      }

      gameState.passed = true;
      gameState.currentPlayer = switchPlayer(gameState.currentPlayer);
      gameState.lastMove = null;

      this.roomManager.updateRoom(roomId, gameState);
      this.io.to(roomId).emit(SOCKET_EVENTS.GAME_UPDATE, gameState);

      logger.debug('Player passed', { roomId, playerColor });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to pass';
      logger.warn('Pass failed', { socketId: socket.id, roomId, error });
      socket.emit(SOCKET_EVENTS.ERROR, { message });
    }
  }

  /**
   * Handle resign
   */
  private handleResign(socket: Socket, roomId: string): void {
    try {
      const gameState = this.roomManager.getRoom(roomId);

      if (!gameState) {
        throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
      }

      const playerColor = this.getPlayerColor(socket.id, gameState);
      if (!playerColor) {
        throw new Error('Player not in this game');
      }

      // Set winner as opponent
      gameState.winner = switchPlayer(playerColor);

      this.io.to(roomId).emit(SOCKET_EVENTS.GAME_END, gameState);
      logger.info('Game ended by resignation', { roomId, resignedPlayer: playerColor });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resign';
      logger.warn('Resign failed', { socketId: socket.id, roomId, error });
      socket.emit(SOCKET_EVENTS.ERROR, { message });
    }
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(socket: Socket): void {
    logger.info('Client disconnected', { socketId: socket.id });

    const deletedRooms = this.roomManager.cleanupPlayerRooms(socket.id);

    deletedRooms.forEach((roomId) => {
      this.io.to(roomId).emit(SOCKET_EVENTS.PLAYER_DISCONNECTED);
    });
  }

  /**
   * Get player color by socket ID
   */
  private getPlayerColor(socketId: string, gameState: any): Player | null {
    if (gameState.players.black === socketId) return 1;
    if (gameState.players.white === socketId) return 2;
    return null;
  }
}
