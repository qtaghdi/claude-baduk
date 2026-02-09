export type Player = 1 | 2; // 1 = Black, 2 = White
export type CellState = 0 | Player; // 0 = Empty

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  board: CellState[][];
  currentPlayer: Player;
  capturedStones: {
    black: number;
    white: number;
  };
  lastMove: Position | null;
  koPoint: Position | null;
  passed: boolean;
  winner: Player | null;
  roomId: string;
  players: {
    black: string | null;
    white: string | null;
  };
}

export interface MoveResult {
  valid: boolean;
  newBoard?: CellState[][];
  captured?: number;
  koPoint?: Position | null;
  error?: string;
}

export interface Room {
  id: string;
  gameState: GameState;
  playerIds: string[];
}
