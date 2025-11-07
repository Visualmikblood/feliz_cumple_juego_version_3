import React, { useEffect, useRef } from 'react';
import { Gift, Heart, Star, Sparkles, PartyPopper, Cake, Volume2, VolumeX, RotateCcw, Share, Trophy, Zap, ThumbsDown, GamepadIcon, Target, Award } from 'lucide-react';

const PointsGame = ({
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
  collectedStars,
  setCollectedStars,
  collectedCurses,
  setCollectedCurses,
  ballPoints,
  setBallPoints,
  ballEffects,
  setBallEffects,
  ballAnimations,
  setBallAnimations,
  magicMode,
  setMagicMode,
  generateConfetti,
  generateSpecialEffect,
  toggleSpeech,
  shareMessage,
  resetGame,
  handleBallClick
}) => {
  // Generate random points when game starts
  const generateRandomPoints = () => {
    const points = {};
    friends.forEach(friend => {
      const randomPoints = Math.floor(Math.random() * 201) - 100; // -100 to 100
      points[friend.id] = randomPoints;
    });
    setBallPoints(points);
  };

  // Effect to generate points on mount
  useEffect(() => {
    generateRandomPoints();
  }, []);

  // Show celebration when all messages are read
  useEffect(() => {
    if (clickedBalls.size === friends.length && !showCelebration) {
      setShowCelebration(true);
      generateConfetti(100);
      setMagicMode(true);
      setTimeout(() => setMagicMode(false), 5000);
    }
  }, [clickedBalls.size, showCelebration, friends.length]);

  // Control audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (musicEnabled) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicEnabled]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 relative overflow-hidden titulo_segunda_pantalla ${magicMode ? 'animate-pulse' : ''}`}>
      {/* Special effects */}
      {specialEffects.map((effect) => (
        <div
          key={effect.id}
          className="fixed pointer-events-none z-40"
          style={{ left: effect.x, top: effect.y, transform: 'translate(-50%, -50%)' }}
        >
          {effect.type === 'celebration' && <div className="text-6xl animate-ping">🎉</div>}
          {effect.type === 'star' && <div className="text-4xl animate-spin text-yellow-400">⭐</div>}
          {effect.type === 'curse' && <div className="text-4xl animate-bounce text-red-500">⚡</div>}
        </div>
      ))}

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

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-bounce">
             ¡FELIZ CUMPLEAÑOS!
          </h1>
          <p className="text-xl text-white/90 mb-2">
            Descubre puntos ocultos
          </p>
          <p className="text-lg text-white/80 mb-6">
            Haz clic en las bolitas para descubrir los mensajes
          </p>
        </div>

        {/* Progress panel */}
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
          {/* Stats section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className={`flex items-center gap-2 text-white ${score >= 0 ? 'text-green-300' : 'text-red-300'} justify-center md:justify-start`}>
              <Trophy className="w-5 h-5 md:w-6 md:h-6" />
              <span className="font-bold text-sm md:text-lg">{score} puntos</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-300 justify-center md:justify-start">
              <Star className="w-5 h-5 md:w-6 md:h-6" />
              <span className="font-bold text-sm md:text-base">{collectedStars} bonus</span>
            </div>
            <div className="flex items-center gap-2 text-red-300 justify-center md:justify-start">
              <Zap className="w-5 h-5 md:w-6 md:h-6" />
              <span className="font-bold text-sm md:text-base">{collectedCurses} mald</span>
            </div>
            <div className="flex items-center gap-2 text-white justify-center md:justify-start">
              <span className="font-semibold text-sm md:text-base">
                {clickedBalls.size}/11 leídos
              </span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
            <button
              onClick={() => setMusicEnabled(!musicEnabled)}
              className="bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-colors duration-300"
            >
              {musicEnabled ? <Volume2 className="w-4 h-4 md:w-5 md:h-5" /> : <VolumeX className="w-4 h-4 md:w-5 md:h-5" />}
            </button>

            <button
              onClick={shareMessage}
              className="bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-colors duration-300"
            >
              <Share className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <button
              onClick={resetGame}
              className="bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-colors duration-300"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 flex items-center justify-center ${
                  score >= 0 ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gradient-to-r from-red-400 to-orange-500'
                }`}
                style={{ width: `${(clickedBalls.size / 11) * 100}%` }}
              >
                {clickedBalls.size > 0 && (
                  <span className="text-white text-xs font-bold">
                    {Math.round((clickedBalls.size / 11) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Friends grid */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {friends.map((friend) => {
            const IconComponent = friend.icon;
            const isClicked = clickedBalls.has(friend.id);

            return (
              <div key={friend.id} className="flex flex-col items-center">
                <button
                  onClick={(e) => handleBallClick(friend, e)}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-2xl flex items-center justify-center relative ${
                    isClicked ? `animate-bounce ${ballAnimations[friend.id] || ''} ring-4 ring-white/60` : 'hover:animate-pulse'
                  } ${magicMode ? 'animate-pulse ring-4 ring-yellow-300' : ''}`}
                >
                  <img
                    src={friend.photo}
                    alt={friend.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className={`w-full h-full ${friend.color} rounded-full flex items-center justify-center ${friend.photo ? 'hidden' : 'flex'}`}>
                    <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>

                  {isClicked && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center animate-bounce z-20">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  )}
                </button>

                {!isClicked && (
                  <div className="relative w-max max-w-full px-1 -mt-4 mx-auto" style={{ zIndex: 10 }}>
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap shadow-lg border border-white/20 text-center">
                      ???
                    </div>
                  </div>
                )}

                {isClicked && (
                  <div className="relative w-max max-w-full px-1 -mt-4 mx-auto" style={{ zIndex: 10 }}>
                    <div className={`${ballPoints[friend.id] >= 0 ? 'bg-green-600' : 'bg-red-600'} text-white text-xs px-2 py-1 rounded-full whitespace-nowrap shadow-lg border border-white/20 text-center`}>
                      {ballPoints[friend.id] >= 0 ? '+' : ''}{ballPoints[friend.id]}
                    </div>
                  </div>
                )}

                <p className="text-white font-semibold mt-3 text-sm text-center">
                  {friend.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final celebration */}
      {showCelebration && (
        <div className="max-w-4xl mx-auto text-center mb-8">
          <div className={`${score >= 0 ? 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-500' : 'bg-gradient-to-r from-red-400 via-orange-500 to-pink-500'} rounded-3xl p-8 shadow-2xl animate-gentle-bounce`}>
            <div className="flex justify-center gap-4 mb-6">
              {score >= 0 ? (
                <>
                  <Trophy className="w-16 h-16 text-white animate-spin" />
                  <Cake className="w-16 h-16 text-white animate-pulse" />
                  <Trophy className="w-16 h-16 text-white animate-spin" />
                </>
              ) : (
                <>
                  <ThumbsDown className="w-16 h-16 text-white animate-bounce" />
                  <Cake className="w-16 h-16 text-white animate-pulse" />
                  <ThumbsDown className="w-16 h-16 text-white animate-bounce" />
                </>
              )}
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {score >= 0 ? '¡GANASTE! 🎊' : '¡PERDISTE! 😅'}
            </h2>
            <p className="text-white text-xl mb-6">
              {score >= 0
                ? '¡Felicidades! Terminaste con puntos positivos'
                : '¡No te preocupes! La diversión fue lo importante'
              }
            </p>
            <div className="bg-white/20 rounded-2xl p-6 mb-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className={`text-3xl font-bold mb-2 ${score >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {score}
                  </p>
                  <p className="text-white text-sm">Puntos Finales</p>
                </div>
                <div>
                  <p className="text-yellow-200 text-3xl font-bold mb-2">
                    {collectedStars}
                  </p>
                  <p className="text-white text-sm">⭐ Bonus</p>
                </div>
                <div>
                  <p className="text-red-200 text-3xl font-bold mb-2">
                    {collectedCurses}
                  </p>
                  <p className="text-white text-sm">⚡ Maldiciones</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={shareMessage}
                className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
              >
                <Share className="w-5 h-5 inline mr-2" />
                ¡Compartir Resultado!
              </button>
              <button
                onClick={resetGame}
                className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Jugar de Nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message modal */}
      {showMessage && selectedFriend && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl transform animate-gentle-bounce max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6 flex flex-col items-center relative">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse overflow-hidden relative">
                <img
                  src={selectedFriend.photo}
                  alt={selectedFriend.name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className={`w-full h-full ${selectedFriend.color} rounded-full flex items-center justify-center ${selectedFriend.photo ? 'hidden' : 'flex'}`}>
                  {React.createElement(selectedFriend.icon, { className: "w-10 h-10 text-white" })}
                </div>
                {/* Speaker button */}
                <button
                  onClick={() => toggleSpeech(selectedFriend.message)}
                  className="absolute bottom-0 right-0 bg-white/80 hover:bg-white/100 rounded-full p-2 shadow-lg transition-colors duration-300"
                  aria-label={isSpeaking ? "Detener audio" : "Reproducir audio"}
                >
                  {isSpeaking ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.54 8.46a5 5 0 010 7.07" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.07 4.93a9 9 0 010 14.14" />
                    </svg>
                  )}
                </button>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                Mensaje de {selectedFriend.name} 💌
              </h3>
              <div className="mb-4">
                <p className={`font-bold text-lg ${ballPoints[selectedFriend.id] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ballPoints[selectedFriend.id] >= 0 ? '+' : ''}{ballPoints[selectedFriend.id]} puntos
                </p>
                {ballEffects[selectedFriend.id] === 'star' && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mt-3 flex items-center gap-3">
                    <Star className="w-8 h-8 text-yellow-500 animate-spin" />
                    <div>
                      <p className="font-bold text-yellow-800">¡Estrella Bonus! ⭐</p>
                      <p className="text-yellow-700 text-sm">+50 puntos extra por esta felicitación</p>
                    </div>
                  </div>
                )}
                {ballEffects[selectedFriend.id] === 'curse' && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3 mt-3 flex items-center gap-3">
                    <Zap className="w-8 h-8 text-red-500 animate-bounce" />
                    <div>
                      <p className="font-bold text-red-800">¡Maldición! ⚡</p>
                      <p className="text-red-700 text-sm">-30 puntos de penalización</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                {selectedFriend.message}
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowMessage(false)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                ¡Gracias por la felicitación! 💝
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/Parchís - Cumpleaños feliz (128kbit_AAC).mp4"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default PointsGame;
