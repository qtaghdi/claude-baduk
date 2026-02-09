import React from 'react';

interface ControlsProps {
  onPass: () => void;
  onResign: () => void;
  disabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onPass, onResign, disabled }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Game Controls</h3>

      <button
        onClick={onPass}
        disabled={disabled}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
      >
        Pass
      </button>

      <button
        onClick={onResign}
        disabled={disabled}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
      >
        Resign
      </button>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">How to Play:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Click on intersections to place stones</li>
          <li>• Capture opponent's stones by surrounding them</li>
          <li>• Pass when you have no good moves</li>
          <li>• Two consecutive passes end the game</li>
        </ul>
      </div>
    </div>
  );
};

export default Controls;
