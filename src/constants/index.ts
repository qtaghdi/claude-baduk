// Game constants
export const BOARD_SIZE = 19;
export const CELL_SIZE = 30;
export const BOARD_PADDING = 20;
export const STONE_RADIUS_RATIO = 0.45;

// Star points for 19x19 board
export const STAR_POINTS: [number, number][] = [
  [3, 3], [3, 9], [3, 15],
  [9, 3], [9, 9], [9, 15],
  [15, 3], [15, 9], [15, 15],
];

// Colors
export const COLORS = {
  BOARD: '#deb887',
  LINE: '#8b4513',
  STAR_POINT: '#8b4513',
  BLACK_STONE: '#000000',
  WHITE_STONE: '#ffffff',
  LAST_MOVE: '#ff0000',
} as const;

// Socket events
export const SOCKET_EVENTS = {
  // Client -> Server
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  MAKE_MOVE: 'make-move',
  PASS: 'pass',
  RESIGN: 'resign',

  // Server -> Client
  ROOM_CREATED: 'room-created',
  GAME_START: 'game-start',
  GAME_UPDATE: 'game-update',
  GAME_END: 'game-end',
  PLAYER_DISCONNECTED: 'player-disconnected',
  ERROR: 'error',
} as const;

// Room ID configuration
export const ROOM_ID_LENGTH = 6;

// Error messages
export const ERROR_MESSAGES = {
  ROOM_NOT_FOUND: 'Room not found',
  ROOM_FULL: 'Room is full',
  NOT_YOUR_TURN: 'Not your turn',
  INVALID_MOVE: 'Invalid move',
  POSITION_OCCUPIED: 'Position already occupied',
  SUICIDE_MOVE: 'Suicide move not allowed',
  KO_VIOLATION: 'Ko rule violation',
  INVALID_POSITION: 'Invalid position',
} as const;

// Environment variables
export const CONFIG = {
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
