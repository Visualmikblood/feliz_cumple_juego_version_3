  import React, { useEffect, useRef, useState } from 'react';
import { Gift, Heart, Star, Sparkles, PartyPopper, Cake, Volume2, VolumeX, RotateCcw, Share, Trophy, Zap, ThumbsDown, GamepadIcon, Target, Award, Users, Clock } from 'lucide-react';
import RatingModal from './components/RatingModal';

const RatingGame = ({
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
  friendRatings,
  setFriendRatings,
  currentRating,
  setCurrentRating,
  currentComment,
  setCurrentComment,
  showRatingModal,
  setShowRatingModal,
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
  handleRatingSubmit,
  getBestRatedFriend,
  getWorstRatedFriend,
  // Multijugador props
  isMultiplayer = false,
  submitPlayerRatings,
  showResults,
  roomData = null,
  players = [],
  notifications = [],
  loading = false,
  birthdayPersonName,
  isHost = false,
  updateRoomDeadline,
  playerName
}) => {
      // Función local para manejar el submit si no se pasa como prop
  const localHandleRatingSubmit = handleRatingSubmit || (() => {
    setFriendRatings(prev => ({
      ...prev,
      [selectedFriend.id]: currentRating
    }));
    setShowRatingModal(false);
    setShowMessage(false);
    setCurrentRating(50);
    if (setCurrentComment) setCurrentComment('');
  });



  // Auto-submit ratings when deadline expires (regardless of completion status)
  const [deadlineExpired, setDeadlineExpired] = useState(false);

  useEffect(() => {
    if (isMultiplayer && roomData?.room?.expires_at) {
      const now = new Date();
      const expiresAt = new Date(roomData.room.expires_at);
      const isExpired = now > expiresAt;

      if (isExpired && !deadlineExpired) {
        setDeadlineExpired(true);
        console.log('⏰ Deadline expired - auto-submitting all completed ratings...');
        // Auto-submit ratings (even if not all are completed)
        if (submitPlayerRatings) {
          submitPlayerRatings();
        }
      }
    }
  }, [isMultiplayer, roomData, friendRatings, friends.length, showCelebration, submitPlayerRatings, deadlineExpired]);

  // Show celebration ONLY when the room status is 'finished' (game officially ended)
  useEffect(() => {
    if (isMultiplayer && !showCelebration && roomData?.room?.status === 'finished') {
      console.log('🎯 Room status changed to finished - triggering celebration!');
      console.log('Setting showCelebration to true...');
      setShowCelebration(true);
      console.log('Generating confetti...');
      generateConfetti(100);
      setMagicMode(true);
      setTimeout(() => setMagicMode(false), 5000);
      console.log('Celebration setup complete');
    }
  }, [isMultiplayer, roomData?.room?.status, showCelebration]);

  // Force re-render when showCelebration changes
  useEffect(() => {
    console.log('🎊 showCelebration changed to:', showCelebration);
  }, [showCelebration]);

  // Estado para el modal de confirmación de salida
  const [showExitModal, setShowExitModal] = useState(false);

  // Estado para la nueva fecha límite
  const [newDeadline, setNewDeadline] = useState('');

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
      <div className="max-w-6xl mx-auto mb-8 pt-16">
                 <div className="text-center">
           <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-bounce">
              ¡FELIZ CUMPLEAÑOS {birthdayPersonName}!
           </h1>
          {isMultiplayer ? (
            <>
              <p className="text-xl text-white/90 mb-2">
                <Users className="w-5 h-5 inline mr-2" />
                Modo Multijugador - Califica las felicitaciones
              </p>
              <p className="text-lg text-white/80 mb-2">
                Sala: {roomData?.room?.room_code} | {players.length} jugadores
              </p>
              <p className="text-lg text-yellow-300 mb-4">
                Jugando como: {playerName}
              </p>
              {roomData?.room?.expires_at && (
                <p className="text-sm text-white/70 mb-4">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Expira: {new Date(roomData.room.expires_at).toLocaleString()}
                </p>
              )}

              {/* Mostrar tiempo restante en la pantalla principal */}
              {isMultiplayer && roomData?.room?.expires_at && (() => {
                const now = new Date();
                const deadline = new Date(roomData.room.expires_at);
                const diff = deadline - now;

                if (diff <= 0) return <p className="text-sm text-red-400 mb-4">⏰ EXPIRADO</p>;

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                if (days > 0) {
                  return <p className="text-sm text-white mb-4">⏰ Tiempo restante: {days} día{days > 1 ? 's' : ''} {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</p>;
                }

                return <p className="text-sm text-white mb-4">⏰ Tiempo restante: {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</p>;
              })()}
            </>
          ) : (
            <>
              <p className="text-xl text-white/90 mb-2">
                Califica las felicitaciones
              </p>
              <p className="text-lg text-white/80 mb-6">
                Haz clic en las bolitas para descubrir los mensajes
              </p>
            </>
          )}
        </div>

                {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-blue-500/20 backdrop-blur-lg rounded-2xl p-4 shadow-lg mb-4">
            <div className="text-white text-center">
              <strong>Última notificación:</strong> {notifications[0]?.message}
            </div>
          </div>
        )}

        {/* Progress panel */}
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
          {/* Stats section */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <Award className="w-6 h-6 text-yellow-300" />
                <span className="font-bold text-lg">
                  {Object.keys(friendRatings).length > 0
                    ? `${(Object.values(friendRatings).reduce((a, b) => a + b, 0) / Object.values(friendRatings).length).toFixed(1)}/100 promedio`
                    : 'Sin calificaciones aún'
                  }
                </span>
              </div>
                            <div className="text-white font-semibold">
                {clickedBalls.size}/{friends.length} mensajes leídos
              </div>
              {isMultiplayer && (
                <div className="text-white font-semibold">
                  {players.filter(p => p.has_finished_rating).length}/{players.length} jugadores terminados
                </div>
              )}
            </div>
            
            {/* Player status in multiplayer */}
            {isMultiplayer && players.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {players.map(player => (
                  <div
                    key={player.id}
                    className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                      player.has_finished_rating
                        ? 'bg-green-500/70 text-white'
                        : 'bg-gray-500/70 text-white'
                    }`}
                  >
                    {player.profile_photo ? (
                      <img
                        src={`http://localhost:8000/uploads/profile-photos/${player.profile_photo}`}
                        alt={player.name}
                        className="w-4 h-4 object-cover rounded-full border border-white/50"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border border-white/50" style={{ display: player.profile_photo ? 'none' : 'flex' }}>
                      <span className="text-white text-xs font-bold">
                        {player.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <span>{player.name} {player.has_finished_rating ? '✓' : '⏳'}</span>
                  </div>
                ))}
              </div>
            )}
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
              onClick={() => setShowExitModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
              title="Salir de la Sala"
            >
              Salir de la Sala
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-700 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500"
                style={{ width: `${(clickedBalls.size / friends.length) * 100}%` }}
              >
                {clickedBalls.size > 0 && (
                  <span className="text-white text-xs font-bold">
                    {Math.round((clickedBalls.size / friends.length) * 100)}%
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
                  onClick={(e) => {
                    // Solo permitir calificar si el tiempo no ha expirado
                    if (isMultiplayer && roomData?.room?.expires_at) {
                      const now = new Date();
                      const expiresAt = new Date(roomData.room.expires_at);
                      if (now > expiresAt) {
                        // Si el tiempo expiró, no permitir calificar
                        return;
                      }
                    }
                    handleBallClick(friend, e);
                  }}
                  disabled={isMultiplayer && roomData?.room?.expires_at && new Date() > new Date(roomData.room.expires_at)}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-2xl flex items-center justify-center relative ${
                    isClicked ? `animate-bounce ${ballAnimations[friend.id] || ''} ring-4 ring-white/60` : 'hover:animate-pulse'
                  } ${magicMode ? 'animate-pulse ring-4 ring-yellow-300' : ''} ${
                    isMultiplayer && roomData?.room?.expires_at && new Date() > new Date(roomData.room.expires_at) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {friend.profile_photo ? (
                    <img
                      src={`http://localhost:8000/uploads/profile-photos/${friend.profile_photo}`}
                      alt={friend.player_name || friend.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center" style={{ display: friend.profile_photo ? 'none' : 'flex' }}>
                    <span className="text-white text-lg font-bold">
                      {(friend.player_name || friend.name) ? (friend.player_name || friend.name).charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>

                  {isClicked && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center animate-bounce z-20">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  )}
                </button>

                {isClicked && friendRatings[friend.id] && (
                  <div className="relative w-max max-w-full px-1 -mt-4 mx-auto" style={{ zIndex: 10 }}>
                    <div className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap shadow-lg border border-white/20 text-center">
                      {friendRatings[friend.id]}/100
                    </div>
                  </div>
                )}


                <div className="flex flex-col items-center mt-3">
                  <p className="text-white font-semibold text-sm text-center">
                    {friend.player_name || friend.name || 'Usuario'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

            {/* Multijugador: Estado de calificaciones */}
     {isMultiplayer && !showCelebration && (
       <div className="max-w-4xl mx-auto text-center mb-8">
         <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
           {(() => {
             const now = new Date();
             const expiresAt = roomData?.room?.expires_at;
             const deadlineExpired = expiresAt && now > new Date(expiresAt);
             const playerFinishedAllRatings = Object.keys(friendRatings).length === friends.length;
             const totalMessages = friends.length;
             const ratedMessages = Object.keys(friendRatings).length;

             // Si el tiempo no ha expirado
             if (!deadlineExpired) {
               // Si ha calificado todos los mensajes disponibles actualmente
               if (playerFinishedAllRatings && totalMessages > 0) {
                 return (
                   <>
                     <h3 className="text-2xl font-bold text-white mb-4">
                       ¡Has calificado todas las felicitaciones disponibles! 🎉
                     </h3>
                     <p className="text-white/80 mb-6">
                       Cuando termine el tiempo podrás ver los resultados finales.
                       <br />
                       <strong>Nota:</strong> Pueden llegar más mensajes de otros jugadores, así que mantente atento.
                     </p>
                     <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 mb-4">
                       <p className="text-blue-200 text-center font-semibold">
                         ⏰ Esperando que expire el tiempo o que lleguen más mensajes...
                       </p>
                     </div>
                   </>
                 );
               }
               // Si aún faltan calificaciones
               else {
                 return (
                   <>
                     <h3 className="text-2xl font-bold text-white mb-4">
                       Calificando mensajes...
                     </h3>
                     <p className="text-white/80 mb-6">
                       Has calificado {ratedMessages} de {totalMessages} mensajes disponibles.
                       <br />
                       Cuando termine el tiempo, podrás ver los resultados finales.
                     </p>
                   </>
                 );
               }
             }

             // Si el tiempo ha expirado
             if (deadlineExpired) {
               console.log('🎯 SHOWING RESULTS BUTTON - deadlineExpired:', deadlineExpired);
               return (
                 <>
                   <h3 className="text-2xl font-bold text-white mb-4">
                     ¡TIEMPO EXPIRADO!
                   </h3>
                   <p className="text-white/80 mb-6">
                     El tiempo límite para calificar ha expirado.
                     <br />
                     Haz clic en el botón para enviar tus calificaciones y ver los resultados finales.
                   </p>

                   <button
                     onClick={() => {
                       console.log('🎯 VIEW RESULTS BUTTON CLICKED!');
                       if (showResults) {
                         showResults();
                       }
                     }}
                     disabled={loading}
                     className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50 mb-6"
                   >
                     {loading ? 'Cargando...' : 'Ver Resultados Finales'}
                   </button>

                   {/* Celebración completa cuando expira el tiempo */}
                   <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-8 shadow-2xl animate-gentle-bounce">
                     <div className="flex justify-center gap-4 mb-6">
                       <Award className="w-16 h-16 text-white animate-spin" />
                       <Cake className="w-16 h-16 text-white animate-pulse" />
                       <Award className="w-16 h-16 text-white animate-spin" />
                     </div>

                     <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                       ¡CALIFICACIONES COMPLETAS! 🏆
                     </h2>
                     <p className="text-white text-xl mb-6">
                       El tiempo ha expirado y has completado todas tus calificaciones
                     </p>
                     <div className="bg-white/20 rounded-2xl p-6 mb-6">
                       <div className="mb-6">
                         <p className="text-yellow-200 text-4xl font-bold mb-2">
                           {(Object.values(friendRatings).reduce((a, b) => a + b, 0) / Object.values(friendRatings).length).toFixed(1)}/100
                         </p>
                         <p className="text-white text-lg">Promedio General</p>
                       </div>

                       {getBestRatedFriend() && (
                         <div className="grid md:grid-cols-2 gap-6">
                           <div className="bg-green-500/30 rounded-xl p-4">
                             <h4 className="text-white font-bold mb-2">🏆 Mejor Felicitación</h4>
                             <div className="flex items-center gap-3">
                               <img
                                 src={getBestRatedFriend().photo}
                                 alt={getBestRatedFriend().name}
                                 className="w-12 h-12 object-cover rounded-full"
                                 onError={(e) => {
                                   e.target.style.display = 'none';
                                   e.target.nextElementSibling.style.display = 'flex';
                                 }}
                               />
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg font-bold">
                                      {(getBestRatedFriend().player_name || getBestRatedFriend().name) ? (getBestRatedFriend().player_name || getBestRatedFriend().name).charAt(0).toUpperCase() : '?'}
                                    </span>
                                  </div>
                               <div>
                                 <p className="text-white font-bold">{getBestRatedFriend().player_name || getBestRatedFriend().name}</p>
                                 <p className="text-green-200">{Math.max(...Object.values(friendRatings))}/100 puntos</p>
                               </div>
                             </div>
                           </div>

                           {getWorstRatedFriend() && getBestRatedFriend().id !== getWorstRatedFriend().id && (
                             <div className="bg-red-500/30 rounded-xl p-4">
                               <h4 className="text-white font-bold mb-2">📉 Necesita Mejorar</h4>
                               <div className="flex items-center gap-3">
                                 <img
                                   src={getWorstRatedFriend().photo}
                                   alt={getWorstRatedFriend().name}
                                   className="w-12 h-12 object-cover rounded-full"
                                   onError={(e) => {
                                     e.target.style.display = 'none';
                                     e.target.nextElementSibling.style.display = 'flex';
                                   }}
                                 />
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-lg font-bold">
                                    {(getWorstRatedFriend().player_name || getWorstRatedFriend().name) ? (getWorstRatedFriend().player_name || getWorstRatedFriend().name).charAt(0).toUpperCase() : '?'}
                                  </span>
                                </div>
                                 <div>
                                   <p className="text-white font-bold">{getWorstRatedFriend().player_name || getWorstRatedFriend().name}</p>
                                   <p className="text-red-200">{Math.min(...Object.values(friendRatings))}/100 puntos</p>
                                 </div>
                               </div>
                             </div>
                           )}
                         </div>
                       )}
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
                 </>
               );
             } else {
               return (
                 <>
                   <h3 className="text-2xl font-bold text-white mb-4">
                     Calificando mensajes...
                   </h3>
                   <p className="text-white/80 mb-6">
                     El botón para enviar calificaciones aparecerá cuando todos los jugadores terminen de calificar, o cuando expire el tiempo y hayas completado todas tus calificaciones.
                   </p>
                 </>
               );
             }
           })()}
         </div>
       </div>
     )}

      {/* Final celebration */}
      {showCelebration && (
        <div className="max-w-4xl mx-auto text-center mb-8">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-8 shadow-2xl animate-gentle-bounce">
            <div className="flex justify-center gap-4 mb-6">
              <Award className="w-16 h-16 text-white animate-spin" />
              <Cake className="w-16 h-16 text-white animate-pulse" />
              <Award className="w-16 h-16 text-white animate-spin" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ¡CALIFICACIONES COMPLETAS! 🏆
            </h2>
            <p className="text-white text-xl mb-6">
              {isMultiplayer ? 'Todos los jugadores han terminado de calificar' : 'Has calificado todas las felicitaciones de tus amigos'}
            </p>
            <div className="bg-white/20 rounded-2xl p-6 mb-6">
              <div className="mb-6">
                <p className="text-yellow-200 text-4xl font-bold mb-2">
                  {(Object.values(friendRatings).reduce((a, b) => a + b, 0) / Object.values(friendRatings).length).toFixed(1)}/100
                </p>
                <p className="text-white text-lg">Promedio General</p>
              </div>

              {getBestRatedFriend() && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-500/30 rounded-xl p-4">
                    <h4 className="text-white font-bold mb-2">🏆 Mejor Felicitación</h4>
                    <div className="flex items-center gap-3">
                      <img
                        src={getBestRatedFriend().photo}
                        alt={getBestRatedFriend().name}
                        className="w-12 h-12 object-cover rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                         <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                           <span className="text-white text-lg font-bold">
                             {(getBestRatedFriend().player_name || getBestRatedFriend().name) ? (getBestRatedFriend().player_name || getBestRatedFriend().name).charAt(0).toUpperCase() : '?'}
                           </span>
                         </div>
                      <div>
                        <p className="text-white font-bold">{getBestRatedFriend().player_name || getBestRatedFriend().name}</p>
                        <p className="text-green-200">{Math.max(...Object.values(friendRatings))}/100 puntos</p>
                      </div>
                    </div>
                  </div>

                  {getWorstRatedFriend() && getBestRatedFriend().id !== getWorstRatedFriend().id && (
                    <div className="bg-red-500/30 rounded-xl p-4">
                      <h4 className="text-white font-bold mb-2">📉 Necesita Mejorar</h4>
                      <div className="flex items-center gap-3">
                        <img
                          src={getWorstRatedFriend().photo}
                          alt={getWorstRatedFriend().name}
                          className="w-12 h-12 object-cover rounded-full"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                       <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                         <span className="text-white text-lg font-bold">
                           {(getWorstRatedFriend().player_name || getWorstRatedFriend().name) ? (getWorstRatedFriend().player_name || getWorstRatedFriend().name).charAt(0).toUpperCase() : '?'}
                         </span>
                       </div>
                        <div>
                          <p className="text-white font-bold">{getWorstRatedFriend().player_name || getWorstRatedFriend().name}</p>
                          <p className="text-red-200">{Math.min(...Object.values(friendRatings))}/100 puntos</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                {selectedFriend.photo_url ? (
                  <img
                    src={selectedFriend.photo_url}
                    alt={selectedFriend.player_name || selectedFriend.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {(selectedFriend.player_name || selectedFriend.name) ? (selectedFriend.player_name || selectedFriend.name).charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                )}
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
                Mensaje de {selectedFriend.player_name || selectedFriend.name} 💌
              </h3>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                {selectedFriend.message}
              </p>
            </div>

                        <div className="text-center space-y-4">
              <button
                onClick={() => {
                  setShowMessage(false);
                  setShowRatingModal(true);
                }}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                ¡Calificar esta Felicitación! ⭐
              </button>
              
              {isMultiplayer && (
                <p className="text-gray-600 text-sm">
                  Podrás agregar un comentario opcional en el siguiente paso
                </p>
              )}
              
              <button
                onClick={() => setShowMessage(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Rating modal */}
            <RatingModal
              selectedFriend={selectedFriend}
              showRatingModal={showRatingModal}
              setShowRatingModal={setShowRatingModal}
              currentRating={currentRating}
              setCurrentRating={setCurrentRating}
              currentComment={currentComment}
              setCurrentComment={setCurrentComment}
              handleRatingSubmit={localHandleRatingSubmit}
              toggleSpeech={toggleSpeech}
              isSpeaking={isSpeaking}
              isMultiplayer={isMultiplayer}
            />
      
            {/* Exit confirmation modal */}
            {showExitModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-3xl p-8 max-w-md w-full shadow-2xl transform animate-gentle-bounce">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      ¿Salir de la Sala?
                    </h3>
                    <p className="text-white/80 mb-6">
                      Podrás volver a entrar usando el código de sala: <strong className="text-yellow-300">{roomData?.room?.room_code}</strong>
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setShowExitModal(false);
                        resetGame();
                      }}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300 transform hover:scale-105"
                    >
                      Sí, Salir de la Sala
                    </button>

                    <button
                      onClick={() => setShowExitModal(false)}
                      className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
      
            {/* Campo de fecha límite para el host */}
            {isHost && (
              <div className="mt-8 mb-4">
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 shadow-lg max-w-sm mx-auto">
                  <label className="block text-white text-sm font-medium mb-2 text-center">
                    Fecha límite para calificar:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={newDeadline || (roomData?.room?.expires_at ? new Date(roomData.room.expires_at).toISOString().slice(0, 16) : '')}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="flex-1 px-2 py-1 rounded text-gray-800 bg-white/90 border-2 border-transparent focus:border-yellow-400 focus:outline-none transition-colors text-xs"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <button
                      onClick={async () => {
                        if (!newDeadline.trim()) {
                          console.log('No hay nueva fecha para actualizar');
                          return;
                        }

                        try {
                          if (updateRoomDeadline) {
                            await updateRoomDeadline(newDeadline);
                            setNewDeadline(''); // Limpiar después de actualizar
                            // Actualizar la información de la sala para refrescar el tiempo restante
                            if (getRoomInfo) {
                              await getRoomInfo(roomData.room.id);
                            }
                          }
                        } catch (error) {
                          console.error('Error actualizando fecha límite:', error);
                        }
                      }}
                      disabled={loading || !newDeadline.trim()}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? '...' : 'Actualizar'}
                    </button>
                  </div>
                  {roomData?.room?.expires_at && (() => {
                    const now = new Date();
                    const deadline = new Date(roomData.room.expires_at);
                    const diff = deadline - now;
      
                    if (diff <= 0) return <div className="text-xs mt-2 font-bold text-red-400 text-center">⏰ EXPIRADO</div>;
      
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
                    if (days > 0) {
                      return <div className="text-xs mt-2 font-bold text-white text-center">⏰ {days}d {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</div>;
                    }
      
                    return <div className="text-xs mt-2 font-bold text-white text-center">⏰ {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</div>;
                  })()}
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
      
            <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 4px solid #eab308;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          transition: all 0.1s ease-out;
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 4px solid #eab308;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          transition: all 0.1s ease-out;
        }

        .smooth-slider {
          transition: background 0.15s ease-out;
        }

        .smooth-slider::-webkit-slider-thumb {
          transition: all 0.15s ease-out;
        }

        .smooth-slider::-moz-range-thumb {
          transition: all 0.15s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RatingGame;
