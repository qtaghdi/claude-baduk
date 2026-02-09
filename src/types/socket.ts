import { GameState, Position } from './game';

// Client to Server events
export interface ClientToServerEvents {
  'create-room': () => void;
  'join-room': (roomId: string) => void;
  'make-move': (data: MakeMovePayload) => void;
  'pass': (roomId: string) => void;
  'resign': (roomId: string) => void;
}

// Server to Client events
export interface ServerToClientEvents {
  'room-created': (data: RoomCreatedPayload) => void;
  'game-start': (gameState: GameState) => void;
  'game-update': (gameState: GameState) => void;
  'game-end': (gameState: GameState) => void;
  'player-disconnected': () => void;
  'error': (error: ErrorPayload) => void;
}

// Payloads
export interface MakeMovePayload {
  roomId: string;
  x: number;
  y: number;
}

export interface RoomCreatedPayload {
  roomId: string;
  gameState: GameState;
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

// Socket types
export type TypedSocket = {
  on<K extends keyof ServerToClientEvents>(
    event: K,
    listener: ServerToClientEvents[K]
  ): void;
  emit<K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ): void;
  off<K extends keyof ServerToClientEvents>(
    event: K,
    listener?: ServerToClientEvents[K]
  ): void;
  close(): void;
};
