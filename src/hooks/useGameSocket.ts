import { useEffect, useState, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { GameState, Player } from '../types/game';
import { CONFIG, SOCKET_EVENTS } from '../constants';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../types/socket';

interface UseGameSocketOptions {
  onRoomCreated?: (roomId: string, gameState: GameState) => void;
  onGameStart?: (gameState: GameState) => void;
  onGameUpdate?: (gameState: GameState) => void;
  onGameEnd?: (gameState: GameState) => void;
  onPlayerDisconnected?: () => void;
  onError?: (message: string) => void;
}

interface UseGameSocketReturn {
  socket: Socket | null;
  gameState: GameState | null;
  playerColor: Player | null;
  isConnected: boolean;
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  makeMove: (x: number, y: number) => void;
  pass: () => void;
  resign: () => void;
}

export const useGameSocket = (
  options: UseGameSocketOptions = {}
): UseGameSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerColor, setPlayerColor] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(CONFIG.SOCKET_URL, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Room created
    newSocket.on(
      SOCKET_EVENTS.ROOM_CREATED,
      ({ roomId, gameState: newGameState }) => {
        setGameState(newGameState);
        setPlayerColor(1); // Creator is black
        optionsRef.current.onRoomCreated?.(roomId, newGameState);
      }
    );

    // Game start
    newSocket.on(SOCKET_EVENTS.GAME_START, (newGameState) => {
      setGameState(newGameState);
      // If we don't have a color yet, we're white (joiner)
      if (!playerColor) {
        setPlayerColor(2);
      }
      optionsRef.current.onGameStart?.(newGameState);
    });

    // Game update
    newSocket.on(SOCKET_EVENTS.GAME_UPDATE, (newGameState) => {
      setGameState(newGameState);
      optionsRef.current.onGameUpdate?.(newGameState);
    });

    // Game end
    newSocket.on(SOCKET_EVENTS.GAME_END, (newGameState) => {
      setGameState(newGameState);
      optionsRef.current.onGameEnd?.(newGameState);
    });

    // Player disconnected
    newSocket.on(SOCKET_EVENTS.PLAYER_DISCONNECTED, () => {
      optionsRef.current.onPlayerDisconnected?.();
    });

    // Error
    newSocket.on(SOCKET_EVENTS.ERROR, ({ message }) => {
      optionsRef.current.onError?.(message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Create room
  const createRoom = useCallback(() => {
    if (!socket) return;
    socket.emit(SOCKET_EVENTS.CREATE_ROOM);
  }, [socket]);

  // Join room
  const joinRoom = useCallback(
    (roomId: string) => {
      if (!socket) return;
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId);
    },
    [socket]
  );

  // Make move
  const makeMove = useCallback(
    (x: number, y: number) => {
      if (!socket || !gameState) return;
      socket.emit(SOCKET_EVENTS.MAKE_MOVE, {
        roomId: gameState.roomId,
        x,
        y,
      });
    },
    [socket, gameState]
  );

  // Pass
  const pass = useCallback(() => {
    if (!socket || !gameState) return;
    socket.emit(SOCKET_EVENTS.PASS, gameState.roomId);
  }, [socket, gameState]);

  // Resign
  const resign = useCallback(() => {
    if (!socket || !gameState) return;
    socket.emit(SOCKET_EVENTS.RESIGN, gameState.roomId);
  }, [socket, gameState]);

  return {
    socket,
    gameState,
    playerColor,
    isConnected,
    createRoom,
    joinRoom,
    makeMove,
    pass,
    resign,
  };
};
