import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Home: React.FC = () => {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    router.push('/game/create');
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      setError('Please enter a room code');
      return;
    }
    router.push(`/game/${roomId.toUpperCase()}`);
  };

  return (
    <>
      <Head>
        <title>Baduk Online - Play Go Game</title>
        <meta name="description" content="Play Baduk (Go) online with friends" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-2">바둑</h1>
            <p className="text-xl text-gray-600">Baduk Online</p>
            <p className="text-sm text-gray-500 mt-2">Play Go game with your friends</p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
            <div>
              <button
                onClick={handleCreateRoom}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg shadow-md"
              >
                Create New Game
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Create a room and share the code with a friend
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Room Code
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setError('');
                }}
                placeholder="e.g., ABC123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center uppercase font-mono text-lg"
                maxLength={6}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <button
              onClick={handleJoinRoom}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg shadow-md"
            >
              Join Game
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Baduk (바둑) is a strategic board game also known as Go.</p>
            <p className="mt-2">Capture your opponent's stones to win!</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
