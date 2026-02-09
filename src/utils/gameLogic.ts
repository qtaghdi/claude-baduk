import {
  CellState,
  Player,
  Position,
  GameState,
  MoveResult,
} from '../types/game';
import { BOARD_SIZE, ERROR_MESSAGES } from '../constants';

/**
 * Create an empty board
 */
export const createEmptyBoard = (): CellState[][] => {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(0));
};

/**
 * Create initial game state
 */
export const createInitialGameState = (roomId: string): GameState => {
  return {
    board: createEmptyBoard(),
    currentPlayer: 1, // Black starts
    capturedStones: {
      black: 0,
      white: 0,
    },
    lastMove: null,
    koPoint: null,
    passed: false,
    winner: null,
    roomId,
    players: {
      black: null,
      white: null,
    },
  };
};

/**
 * Deep clone board
 */
const cloneBoard = (board: CellState[][]): CellState[][] => {
  return board.map((row) => [...row]);
};

/**
 * Check if position is within board bounds
 */
const isValidPosition = (x: number, y: number): boolean => {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
};

/**
 * Get adjacent neighbors of a position
 */
const getNeighbors = (x: number, y: number): Position[] => {
  const neighbors: Position[] = [];
  const directions: Position[] = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 }, // right
    { x: 0, y: 1 }, // down
    { x: -1, y: 0 }, // left
  ];

  for (const dir of directions) {
    const nx = x + dir.x;
    const ny = y + dir.y;
    if (isValidPosition(nx, ny)) {
      neighbors.push({ x: nx, y: ny });
    }
  }

  return neighbors;
};

/**
 * Find all stones in a connected group using flood fill
 */
const findGroup = (
  board: CellState[][],
  x: number,
  y: number,
  visited: boolean[][]
): Position[] => {
  const color = board[y][x];
  if (color === 0 || visited[y][x]) {
    return [];
  }

  const group: Position[] = [];
  const stack: Position[] = [{ x, y }];
  visited[y][x] = true;

  while (stack.length > 0) {
    const pos = stack.pop()!;
    group.push(pos);

    const neighbors = getNeighbors(pos.x, pos.y);
    for (const neighbor of neighbors) {
      if (
        !visited[neighbor.y][neighbor.x] &&
        board[neighbor.y][neighbor.x] === color
      ) {
        visited[neighbor.y][neighbor.x] = true;
        stack.push(neighbor);
      }
    }
  }

  return group;
};

/**
 * Count liberties (empty adjacent spaces) of a group
 */
const countLiberties = (board: CellState[][], group: Position[]): number => {
  const liberties = new Set<string>();

  for (const pos of group) {
    const neighbors = getNeighbors(pos.x, pos.y);
    for (const neighbor of neighbors) {
      if (board[neighbor.y][neighbor.x] === 0) {
        liberties.add(`${neighbor.x},${neighbor.y}`);
      }
    }
  }

  return liberties.size;
};

/**
 * Remove captured groups and return count of captured stones
 */
const removeCapturedStones = (
  board: CellState[][],
  opponent: Player
): number => {
  const visited: boolean[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(false));

  let capturedCount = 0;

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === opponent && !visited[y][x]) {
        const group = findGroup(board, x, y, visited);
        const liberties = countLiberties(board, group);

        if (liberties === 0) {
          // Remove the group
          for (const pos of group) {
            board[pos.y][pos.x] = 0;
            capturedCount++;
          }
        }
      }
    }
  }

  return capturedCount;
};

/**
 * Check if a move is suicide (would result in immediate capture)
 */
const isSuicideMove = (
  board: CellState[][],
  x: number,
  y: number,
  player: Player
): boolean => {
  const testBoard = cloneBoard(board);
  testBoard[y][x] = player;

  // Remove opponent's captured stones first
  const opponent = (player === 1 ? 2 : 1) as Player;
  removeCapturedStones(testBoard, opponent);

  // Now check if the placed stone's group has liberties
  const visited: boolean[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(false));

  const group = findGroup(testBoard, x, y, visited);
  const liberties = countLiberties(testBoard, group);

  return liberties === 0;
};

/**
 * Validate and execute a move
 */
export const makeMove = (
  gameState: GameState,
  x: number,
  y: number
): MoveResult => {
  try {
    const { board, currentPlayer, koPoint } = gameState;

    // Validate position
    if (!isValidPosition(x, y)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_POSITION,
      };
    }

    // Check if position is empty
    if (board[y][x] !== 0) {
      return {
        valid: false,
        error: ERROR_MESSAGES.POSITION_OCCUPIED,
      };
    }

    // Check ko rule
    if (koPoint && koPoint.x === x && koPoint.y === y) {
      return {
        valid: false,
        error: ERROR_MESSAGES.KO_VIOLATION,
      };
    }

    // Check suicide rule
    if (isSuicideMove(board, x, y, currentPlayer)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.SUICIDE_MOVE,
      };
    }

    // Make the move
    const newBoard = cloneBoard(board);
    newBoard[y][x] = currentPlayer;

    // Remove captured opponent stones
    const opponent = (currentPlayer === 1 ? 2 : 1) as Player;
    const capturedCount = removeCapturedStones(newBoard, opponent);

    // Determine new ko point (only if exactly one stone was captured)
    let newKoPoint: Position | null = null;
    if (capturedCount === 1) {
      // Find the captured stone position
      for (let cy = 0; cy < BOARD_SIZE; cy++) {
        for (let cx = 0; cx < BOARD_SIZE; cx++) {
          if (board[cy][cx] === opponent && newBoard[cy][cx] === 0) {
            newKoPoint = { x: cx, y: cy };
            break;
          }
        }
        if (newKoPoint) break;
      }
    }

    return {
      valid: true,
      newBoard,
      captured: capturedCount,
      koPoint: newKoPoint,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : ERROR_MESSAGES.INVALID_MOVE,
    };
  }
};

/**
 * Switch to the opposite player
 */
export const switchPlayer = (player: Player): Player => {
  return (player === 1 ? 2 : 1) as Player;
};

/**
 * Get player name
 */
export const getPlayerName = (player: Player): string => {
  return player === 1 ? 'Black' : 'White';
};

export { BOARD_SIZE };
