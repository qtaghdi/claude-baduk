import { GameState } from '../types/game';
import { createInitialGameState } from '../utils/gameLogic';
import { ROOM_ID_LENGTH, ERROR_MESSAGES } from '../constants';
import { logger } from './logger';

export class GameRoomManager {
  private rooms: Map<string, GameState>;
  private roomTimeouts: Map<string, NodeJS.Timeout>;

  constructor() {
    this.rooms = new Map();
    this.roomTimeouts = new Map();
  }

  /**
   * Generate a unique room ID
   */
  private generateRoomId(): string {
    let roomId: string;
    do {
      roomId = Math.random()
        .toString(36)
        .substring(2, 2 + ROOM_ID_LENGTH)
        .toUpperCase();
    } while (this.rooms.has(roomId));
    return roomId;
  }

  /**
   * Create a new room
   */
  createRoom(playerId: string): { roomId: string; gameState: GameState } {
    const roomId = this.generateRoomId();
    const gameState = createInitialGameState(roomId);
    gameState.players.black = playerId;

    this.rooms.set(roomId, gameState);
    logger.info(`Room created: ${roomId}`, { playerId });

    return { roomId, gameState };
  }

  /**
   * Add a player to an existing room
   */
  joinRoom(roomId: string, playerId: string): GameState {
    const gameState = this.rooms.get(roomId);

    if (!gameState) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    if (gameState.players.black && gameState.players.white) {
      throw new Error(ERROR_MESSAGES.ROOM_FULL);
    }

    gameState.players.white = playerId;
    logger.info(`Player joined room: ${roomId}`, { playerId });

    return gameState;
  }

  /**
   * Get room by ID
   */
  getRoom(roomId: string): GameState | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Update room state
   */
  updateRoom(roomId: string, gameState: GameState): void {
    this.rooms.set(roomId, gameState);
  }

  /**
   * Delete a room
   */
  deleteRoom(roomId: string): void {
    if (this.rooms.delete(roomId)) {
      logger.info(`Room deleted: ${roomId}`);
    }
  }

  /**
   * Find room by player ID
   */
  findRoomByPlayer(playerId: string): string | null {
    for (const [roomId, gameState] of this.rooms.entries()) {
      if (
        gameState.players.black === playerId ||
        gameState.players.white === playerId
      ) {
        return roomId;
      }
    }
    return null;
  }

  /**
   * Clean up rooms with disconnected players
   */
  cleanupPlayerRooms(playerId: string): string[] {
    const deletedRooms: string[] = [];

    for (const [roomId, gameState] of this.rooms.entries()) {
      if (
        gameState.players.black === playerId ||
        gameState.players.white === playerId
      ) {
        this.deleteRoom(roomId);
        deletedRooms.push(roomId);
      }
    }

    return deletedRooms;
  }

  /**
   * Get total number of active rooms
   */
  getRoomCount(): number {
    return this.rooms.size;
  }

  /**
   * Schedule room deletion with delay
   */
  scheduleRoomDeletion(roomId: string, delayMs: number = 30000): void {
    // Cancel existing timeout if any
    const existingTimeout = this.roomTimeouts.get(roomId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule deletion
    const timeout = setTimeout(() => {
      this.deleteRoom(roomId);
      this.roomTimeouts.delete(roomId);
      logger.info(`Room auto-deleted after timeout: ${roomId}`);
    }, delayMs);

    this.roomTimeouts.set(roomId, timeout);
    logger.debug(`Room deletion scheduled: ${roomId} (${delayMs}ms)`);
  }

  /**
   * Cancel scheduled room deletion
   */
  cancelRoomDeletion(roomId: string): void {
    const timeout = this.roomTimeouts.get(roomId);
    if (timeout) {
      clearTimeout(timeout);
      this.roomTimeouts.delete(roomId);
      logger.debug(`Room deletion cancelled: ${roomId}`);
    }
  }
}
