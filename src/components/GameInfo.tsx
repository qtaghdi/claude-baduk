import React from 'react';
import { GameState, Player } from '../types/game';

interface GameInfoProps {
  gameState: GameState;
  playerColor: Player | null;
}

const GameInfo: React.FC<GameInfoProps> = ({ gameState, playerColor }) => {
  const isYourTurn = gameState.currentPlayer === playerColor;

  const getPlayerName = (player: Player) => {
    return player === 1 ? 'Black' : 'White';
  };

  const getCurrentPlayerName = () => {
    return getPlayerName(gameState.currentPlayer);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Info</h2>
        <div className="text-sm text-gray-600">
          Room: <span className="font-mono font-bold">{gameState.roomId}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-700 font-semibold">Current Turn:</span>
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full border-2 ${
                gameState.currentPlayer === 1
                  ? 'bg-black border-gray-600'
                  : 'bg-white border-gray-800'
              }`}
            />
            <span className="font-bold">{getCurrentPlayerName()}</span>
          </div>
        </div>

        {playerColor && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold">You are:</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full border-2 ${
                    playerColor === 1
                      ? 'bg-black border-gray-600'
                      : 'bg-white border-gray-800'
                  }`}
                />
                <span className="font-bold">{getPlayerName(playerColor)}</span>
              </div>
            </div>
          </div>
        )}

        {isYourTurn && (
          <div className="bg-green-100 border border-green-400 rounded-lg p-3 text-center">
            <span className="text-green-800 font-semibold">Your Turn!</span>
          </div>
        )}

        {!isYourTurn && playerColor && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center">
            <span className="text-gray-600">Opponent's Turn</span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Captured Stones</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-black rounded-full border-2 border-gray-600" />
              <span className="text-gray-700">Black</span>
            </div>
            <span className="font-bold text-lg">{gameState.capturedStones.black}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full border-2 border-gray-800" />
              <span className="text-gray-700">White</span>
            </div>
            <span className="font-bold text-lg">{gameState.capturedStones.white}</span>
          </div>
        </div>
      </div>

      {gameState.passed && (
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 text-center">
          <span className="text-yellow-800 font-semibold">Last player passed!</span>
        </div>
      )}

      {gameState.winner && (
        <div className="bg-blue-100 border border-blue-400 rounded-lg p-4 text-center">
          <span className="text-blue-800 font-bold text-lg">
            {getPlayerName(gameState.winner)} wins!
          </span>
        </div>
      )}
    </div>
  );
};

export default GameInfo;
