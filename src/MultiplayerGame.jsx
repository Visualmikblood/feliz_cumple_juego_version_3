import React, { useState, useEffect } from 'react';
import { Gift, Heart, Star, Sparkles, PartyPopper, Cake, Volume2, VolumeX, RotateCcw, Share, Trophy, Zap, Target, Award, Users, GamepadIcon, Crown, TrendingDown } from 'lucide-react';
import { API_BASE_URL } from './utils/api';



const MultiplayerGame = ({
  friends,
  clickedBalls,
  setClickedBalls,
  showMessage,
  setShowMessage,
  selectedFriend,
  setSelectedFriend,
  musicEnabled,
  setMusicEnabled,
  confetti,
  setConfetti,
  specialEffects,
  setSpecialEffects,
  showCelebration,
  setShowCelebration,
  isSpeaking,
  setIsSpeaking,
  audioRef,
  utteranceRef,
  score,
  setScore,
  ballAnimations,
  setBallAnimations,
  magicMode,
  setMagicMode,
  generateConfetti,
  generateSpecialEffect,
  toggleSpeech,
  shareMessage,
  resetGame,
  handleBallClick,
  isMultiplayer,
  gameState,
  setGameState,
  gameRoomId,
  setGameRoomId,
  playerName,
  setPlayerName,
  players,
  setPlayers,
  isHost,
  setIsHost,
  currentPlayerId,
  setCurrentPlayerId,
  allPlayersRatings,
  setAllPlayersRatings,
  multiplayerResults,
  setMultiplayerResults,
  createRoom,
  joinRoom,
  startMultiplayerGame,
  submitPlayerRatings,
}) => {
  // Multiplayer setup screen
  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-2xl w-full">
          <div className="text-center mb-8">
            <Users className="w-20 h-20 mx-auto mb-4 text-white" />
            <h2 className="text-4xl font-bold text-white mb-4">Modo Multijugador</h2>
            <p className="text-xl text-white/80">Configura tu sala de juego</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white text-lg font-semibold mb-2">Tu nombre:</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="w-full px-4 py-3 rounded-xl text-gray-800 text-lg font-medium bg-white/90 border-2 border-transparent focus:border-yellow-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={createRoom}
                disabled={!playerName.trim()}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50"
              >
                <Crown className="w-6 h-6 inline mr-2" />
                Crear Sala
              </button>

              <div className="space-y-2">
                <input
                  type="text"
                  value={gameRoomId}
                  onChange={(e) => setGameRoomId(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO"
                  className="w-full px-4 py-3 rounded-xl text-gray-800 text-lg font-medium bg-white/90 border-2 border-transparent focus:border-yellow-400 focus:outline-none transition-colors text-center"
                />
                <button
                  onClick={joinRoom}
                  disabled={!playerName.trim() || !gameRoomId.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl text-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50 w-full"
                >
                  <Users className="w-5 h-5 inline mr-2" />
                  Unirse
                </button>
              </div>
            </div>

            <button
              onClick={resetGame}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors duration-300"
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer waiting room
  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
              <Users className="w-16 h-16 text-white" />
              <div className="text-left">
                <h2 className="text-3xl font-bold text-white">Sala: {gameRoomId}</h2>
                <p className="text-white/80">Esperando jugadores...</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold text-white text-center">Jugadores ({players.length}):</h3>
            {players.map((player) => (
              <div key={player.id} className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {player.isHost && <Crown className="w-5 h-5 text-yellow-400" />}
                  <div className="flex items-center gap-3">
                    {player.profile_photo ? (
                      <img
                        src={`${API_BASE_URL}/uploads/profile-photos/${player.profile_photo}?t=${Date.now()}`}
                        alt={player.name}
                        className="w-10 h-10 object-cover rounded-full border-2 border-white"
                        onError={(e) => {
                          console.log('Image failed to load for player:', player.name, 'src:', `${API_BASE_URL}/uploads/profile-photos/${player.profile_photo}?t=${Date.now()}`);
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-white" style={{ display: player.profile_photo ? 'none' : 'flex' }}>
                      <span className="text-white text-sm font-bold">
                        {player.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <span className="text-white font-semibold text-lg">{player.name}</span>
                      {player.id === currentPlayerId && <span className="text-yellow-300 text-sm block">(Tú)</span>}
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  player.isReady
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {player.isReady ? '✓ Listo' : '⏳ Esperando'}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            {isHost ? (
              <button
                onClick={startMultiplayerGame}
                disabled={players.length < 2}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50"
              >
                <GamepadIcon className="w-6 h-6 inline mr-2" />
                ¡Iniciar Juego!
              </button>
            ) : (
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white text-lg">Esperando que el host inicie el juego...</p>
              </div>
            )}

            <p className="text-white/70 text-sm">Mínimo 2 jugadores requeridos</p>

            <button
              onClick={resetGame}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors duration-300"
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Salir de la Sala
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer results screen
  if (gameState === 'results' && multiplayerResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
        {/* Confetti */}
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className={`absolute top-0 ${piece.color} text-2xl animate-bounce pointer-events-none z-30`}
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: '4s'
            }}
          >
            {piece.symbol}
          </div>
        ))}

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-4 mb-6">
              <Trophy className="w-20 h-20 text-yellow-300 animate-bounce" />
              <Crown className="w-20 h-20 text-yellow-300 animate-pulse" />
              <Trophy className="w-20 h-20 text-yellow-300 animate-bounce" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              ¡RESULTADOS MULTIJUGADOR! 🏆
            </h1>
            <p className="text-xl text-white/90 mb-2">
              {multiplayerResults.totalPlayers} jugadores han calificado todas las felicitaciones
            </p>
          </div>

          {/* Global Results */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Best and Worst Friends */}
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">🏆 Ranking de Felicitaciones</h2>
              
              {/* Best Friend */}
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 mb-6 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-4">
                  <Crown className="w-12 h-12 text-yellow-300 animate-bounce" />
                  <div className="flex items-center gap-4">
                    <img
                      src={multiplayerResults.bestFriend.photo}
                      alt={multiplayerResults.bestFriend.name}
                      className="w-16 h-16 object-cover rounded-full border-4 border-white"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className={`w-16 h-16 ${multiplayerResults.bestFriend.color} rounded-full flex items-center justify-center border-4 border-white`}>
                      {React.createElement(multiplayerResults.bestFriend.icon, { className: "w-8 h-8 text-white" })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">🥇 MEJOR FELICITACIÓN</h3>
                      <p className="text-xl font-semibold text-white">{multiplayerResults.bestFriend.name}</p>
                      <p className="text-lg text-green-100">
                        {multiplayerResults.friendAverages[multiplayerResults.bestFriend.id].toFixed(1)}/100 promedio
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Worst Friend */}
              <div className="bg-gradient-to-r from-red-400 to-rose-500 rounded-2xl p-6 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-4">
                  <TrendingDown className="w-12 h-12 text-white animate-pulse" />
                  <div className="flex items-center gap-4">
                    <img
                      src={multiplayerResults.worstFriend.photo}
                      alt={multiplayerResults.worstFriend.name}
                      className="w-16 h-16 object-cover rounded-full border-4 border-white"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className={`w-16 h-16 ${multiplayerResults.worstFriend.color} rounded-full flex items-center justify-center border-4 border-white`}>
                      {React.createElement(multiplayerResults.worstFriend.icon, { className: "w-8 h-8 text-white" })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">📉 NECESITA MEJORAR</h3>
                      <p className="text-xl font-semibold text-white">{multiplayerResults.worstFriend.name}</p>
                      <p className="text-lg text-red-100">
                        {multiplayerResults.friendAverages[multiplayerResults.worstFriend.id].toFixed(1)}/100 promedio
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Player Rankings */}
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">👥 Ranking de Jugadores</h2>
              <div className="space-y-4">
                {Object.entries(allPlayersRatings)
                  .sort(([,a], [,b]) => {
                    const avgA = Object.values(a.ratings).reduce((sum, val) => sum + val, 0) / Object.values(a.ratings).length;
                    const avgB = Object.values(b.ratings).reduce((sum, val) => sum + val, 0) / Object.values(b.ratings).length;
                    return avgB - avgA;
                  })
                  .map(([playerId, playerData], index) => {
                    const average = Object.values(playerData.ratings).reduce((sum, val) => sum + val, 0) / Object.values(playerData.ratings).length;
                    const isCurrentPlayer = playerId === currentPlayerId;
                    const medals = ['🥇', '🥈', '🥉'];
                    
                    return (
                      <div 
                        key={playerId}
                        className={`rounded-2xl p-4 transform transition-transform hover:scale-105 ${
                          isCurrentPlayer 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 ring-4 ring-white' 
                            : 'bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{medals[index] || `#${index + 1}`}</span>
                            <div>
                              <p className={`font-bold text-lg ${isCurrentPlayer ? 'text-white' : 'text-white'}`}>
                                {playerData.name} {isCurrentPlayer && '(Tú)'}
                              </p>
                              <p className={`text-sm ${isCurrentPlayer ? 'text-yellow-100' : 'text-white/80'}`}>
                                Promedio general: {average.toFixed(1)}/100
                              </p>
                            </div>
                          </div>
                          {isCurrentPlayer && <Crown className="w-8 h-8 text-yellow-200 animate-bounce" />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MultiplayerGame;
