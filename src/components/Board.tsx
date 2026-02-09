import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { CellState, Position, Player } from '../types/game';
import {
  BOARD_SIZE,
  CELL_SIZE,
  BOARD_PADDING,
  STAR_POINTS,
  COLORS,
  STONE_RADIUS_RATIO,
} from '../constants';

interface BoardProps {
  board: CellState[][];
  lastMove: Position | null;
  currentPlayer: Player;
  onMove: (x: number, y: number) => void;
  disabled: boolean;
}

const Board: React.FC<BoardProps> = React.memo(
  ({ board, lastMove, currentPlayer, onMove, disabled }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hoverPos, setHoverPos] = useState<Position | null>(null);

    const CANVAS_SIZE = useMemo(
      () => CELL_SIZE * (BOARD_SIZE - 1) + BOARD_PADDING * 2,
      []
    );

    // Memoize drawing functions
    const drawBoard = useCallback(
      (ctx: CanvasRenderingContext2D) => {
        // Clear canvas
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw board background
        ctx.fillStyle = COLORS.BOARD;
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw grid lines
        ctx.strokeStyle = COLORS.LINE;
        ctx.lineWidth = 1;

        for (let i = 0; i < BOARD_SIZE; i++) {
          // Vertical lines
          ctx.beginPath();
          ctx.moveTo(BOARD_PADDING + i * CELL_SIZE, BOARD_PADDING);
          ctx.lineTo(
            BOARD_PADDING + i * CELL_SIZE,
            CANVAS_SIZE - BOARD_PADDING
          );
          ctx.stroke();

          // Horizontal lines
          ctx.beginPath();
          ctx.moveTo(BOARD_PADDING, BOARD_PADDING + i * CELL_SIZE);
          ctx.lineTo(
            CANVAS_SIZE - BOARD_PADDING,
            BOARD_PADDING + i * CELL_SIZE
          );
          ctx.stroke();
        }

        // Draw star points
        ctx.fillStyle = COLORS.STAR_POINT;
        STAR_POINTS.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(
            BOARD_PADDING + x * CELL_SIZE,
            BOARD_PADDING + y * CELL_SIZE,
            4,
            0,
            2 * Math.PI
          );
          ctx.fill();
        });
      },
      [CANVAS_SIZE]
    );

    const drawStone = useCallback(
      (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        player: Player,
        opacity: number
      ) => {
        const centerX = BOARD_PADDING + x * CELL_SIZE;
        const centerY = BOARD_PADDING + y * CELL_SIZE;
        const radius = CELL_SIZE * STONE_RADIUS_RATIO;

        ctx.save();
        ctx.globalAlpha = opacity;

        // Draw shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Draw stone
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle =
          player === 1 ? COLORS.BLACK_STONE : COLORS.WHITE_STONE;
        ctx.fill();

        // Draw stone outline for white stones
        if (player === 2) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      },
      []
    );

    // Main render effect
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw board
      drawBoard(ctx);

      // Draw stones
      for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
          const stone = board[y][x];
          if (stone !== 0) {
            drawStone(ctx, x, y, stone, 1);
          }
        }
      }

      // Draw last move marker
      if (lastMove) {
        ctx.fillStyle = COLORS.LAST_MOVE;
        ctx.beginPath();
        ctx.arc(
          BOARD_PADDING + lastMove.x * CELL_SIZE,
          BOARD_PADDING + lastMove.y * CELL_SIZE,
          4,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }

      // Draw hover preview
      if (hoverPos && !disabled) {
        drawStone(ctx, hoverPos.x, hoverPos.y, currentPlayer, 0.4);
      }
    }, [
      board,
      lastMove,
      hoverPos,
      currentPlayer,
      disabled,
      drawBoard,
      drawStone,
    ]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (disabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Convert to board coordinates
        const x = Math.round((clickX - BOARD_PADDING) / CELL_SIZE);
        const y = Math.round((clickY - BOARD_PADDING) / CELL_SIZE);

        if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
          onMove(x, y);
        }
      },
      [disabled, onMove]
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (disabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const x = Math.round((mouseX - BOARD_PADDING) / CELL_SIZE);
        const y = Math.round((mouseY - BOARD_PADDING) / CELL_SIZE);

        if (
          x >= 0 &&
          x < BOARD_SIZE &&
          y >= 0 &&
          y < BOARD_SIZE &&
          board[y][x] === 0
        ) {
          setHoverPos({ x, y });
        } else {
          setHoverPos(null);
        }
      },
      [disabled, board]
    );

    const handleMouseLeave = useCallback(() => {
      setHoverPos(null);
    }, []);

    return (
      <div className="flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="border-4 border-gray-800 rounded shadow-lg cursor-pointer"
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        />
      </div>
    );
  }
);

Board.displayName = 'Board';

export default Board;
