import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import io, { Socket } from 'socket.io-client';
import Board from '@/components/Board';
import GameInfo from '@/components/GameInfo';
import Controls from '@/components/Controls';
import { GameState, Player } from '@/types/game';

const GameRoom: React.FC = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerColor, setPlayerColor] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomId || typeof roomId !== 'string') return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('room-created', ({ gameState }: { roomId: string; gameState: GameState }) => {
      setGameState(gameState);
      setPlayerColor(1); // Black
    });

    newSocket.on('game-start', (state: GameState) => {
      console.log('Game started');
      setGameState(state);
      setPlayerColor(2); // White (joiner)
    });

    newSocket.on('game-update', (state: GameState) => {
      setGameState(state);
    });

    newSocket.on('game-end', (state: GameState) => {
      setGameState(state);
    });

    newSocket.on('player-disconnected', () => {
      alert('Opponent disconnected');
      router.push('/');
    });

    newSocket.on('error', ({ message }: { message: string }) => {
      setError(message);
      setTimeout(() => router.push('/'), 3000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, router]);

  const handleMove = (x: number, y: number) => {
    if (!socket || !gameState) return;
    socket.emit('make-move', { roomId: gameState.roomId, x, y });
  };

  const handlePass = () => {
    if (!socket || !gameState) return;
    socket.emit('pass', gameState.roomId);
  };

  const handleResign = () => {
    if (!socket || !gameState) return;
    if (confirm('Are you sure you want to resign?')) {
      socket.emit('resign', gameState.roomId);
    }
  };

  const copyRoomCode = () => {
    if (gameState) {
      navigator.clipboard.writeText(gameState.roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to lobby...</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700">Joining game room...</p>
        </div>
      </div>
    );
  }

  const isWaiting = !gameState.players.black || !gameState.players.white;

  return (
    <>
      <Head>
        <title>Baduk Game - Room {gameState.roomId}</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">바둑 Online</h1>
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-600">Room Code:</span>
              <code className="bg-white px-4 py-2 rounded font-bold text-xl">{gameState.roomId}</code>
              <button
                onClick={copyRoomCode}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {isWaiting && (
            <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6 text-center">
              <p className="text-yellow-800 font-semibold">
                Waiting for opponent to join... Share the room code!
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Board
                board={gameState.board}
                lastMove={gameState.lastMove}
                currentPlayer={gameState.currentPlayer}
                onMove={handleMove}
                disabled={isWaiting || gameState.currentPlayer !== playerColor || !!gameState.winner}
              />
            </div>

            <div className="space-y-6">
              <GameInfo gameState={gameState} playerColor={playerColor} />
              <Controls
                onPass={handlePass}
                onResign={handleResign}
                disabled={isWaiting || gameState.currentPlayer !== playerColor || !!gameState.winner}
              />
            </div>
          </div>

          {gameState.winner && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-8 max-w-md text-center">
                <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
                <p className="text-xl mb-6">
                  {gameState.winner === playerColor ? 'You Win!' : 'You Lose!'}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Back to Lobby
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GameRoom;
