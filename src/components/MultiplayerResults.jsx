import React, { useState, useRef } from 'react';
import { Trophy, Crown, TrendingDown, Share, RotateCcw, MessageCircle, Star } from 'lucide-react';

const scrollbarStyles = `
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  .scrollbar-thumb-white\\/30 {
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  }
  .scrollbar-track-transparent {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const MultiplayerResults = ({
  multiplayerResults,
  allPlayersRatings,
  currentPlayerId,
  friends,
  confetti,
  shareMessage,
  resetGame,
  players,
  onBackToRating
}) => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  // Function to handle speech synthesis
  const toggleSpeech = (text) => {
    if (!window.speechSynthesis) {
      alert('Tu navegador no soporta síntesis de voz.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!multiplayerResults) return null;

  // Si los datos no están completos, mostrar pantalla de carga y esperar
  if (!multiplayerResults.bestFriend || !multiplayerResults.worstFriend) {
    console.log('Esperando datos completos de resultados...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-2xl w-full text-center">
          <div className="flex justify-center gap-4 mb-6">
            <Trophy className="w-16 h-16 text-yellow-300 animate-bounce" />
            <Crown className="w-16 h-16 text-yellow-300 animate-pulse" />
            <Trophy className="w-16 h-16 text-yellow-300 animate-bounce" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">¡CALIFICACIONES COMPLETAS!</h2>
          <p className="text-white/80 mb-6">Procesando resultados finales...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white/60 text-sm mt-4">Los resultados aparecerán automáticamente</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 overflow-x-hidden">
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

      <div className="max-w-6xl mx-auto px-2 md:px-4">
        {/* Header */}
        <div className="text-center mb-8 px-4">
          <div className="flex justify-center gap-2 md:gap-4 mb-6">
            <Trophy className="w-12 h-12 md:w-20 md:h-20 text-yellow-300 animate-bounce" />
            <Crown className="w-12 h-12 md:w-20 md:h-20 text-yellow-300 animate-pulse" />
            <Trophy className="w-12 h-12 md:w-20 md:h-20 text-yellow-300 animate-bounce" />
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 px-2">
            ¡RESULTADOS MULTIJUGADOR! 🏆
          </h1>
          <p className="text-base md:text-xl text-white/90 mb-2 px-2">
            {multiplayerResults.total_players} jugadores han calificado todas las felicitaciones
          </p>
        </div>

        {/* Global Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 px-4">
          {/* Best and Worst Messages */}
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-4 md:p-8 shadow-2xl">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-6 text-center">🏆 Ranking de Felicitaciones</h2>

            {/* Best Message */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 mb-6 transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-4">
                <Crown className="w-12 h-12 text-yellow-300 animate-bounce" />
                <div className="flex items-center gap-4">
                  {multiplayerResults.bestFriend.photo ? (
                    <img
                      src={`http://localhost:8000/uploads/profile-photos/${multiplayerResults.bestFriend.photo}`}
                      alt={multiplayerResults.bestFriend.name}
                      className="w-16 h-16 object-cover rounded-full border-4 border-white"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-4 border-white`} style={{ display: multiplayerResults.bestFriend.photo ? 'none' : 'flex' }}>
                    <span className="text-white text-lg font-bold">
                      {multiplayerResults.bestFriend.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">🥇 MEJOR FELICITACIÓN</h3>
                    <p className="text-xl font-semibold text-white">{multiplayerResults.bestFriend.name}</p>
                    <p className="text-lg text-green-100">
                      {multiplayerResults.friendAverages[multiplayerResults.bestFriend.id]?.toFixed(1) || 'N/A'}/100 promedio
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Worst Message */}
            <div className="bg-gradient-to-r from-red-400 to-rose-500 rounded-2xl p-6 transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-4">
                <TrendingDown className="w-12 h-12 text-white animate-pulse" />
                <div className="flex items-center gap-4">
                  {multiplayerResults.worstFriend.photo ? (
                    <img
                      src={`http://localhost:8000/uploads/profile-photos/${multiplayerResults.worstFriend.photo}`}
                      alt={multiplayerResults.worstFriend.name}
                      className="w-16 h-16 object-cover rounded-full border-4 border-white"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-4 border-white`} style={{ display: multiplayerResults.worstFriend.photo ? 'none' : 'flex' }}>
                    <span className="text-white text-lg font-bold">
                      {multiplayerResults.worstFriend.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">📉 NECESITA MEJORAR</h3>
                    <p className="text-xl font-semibold text-white">{multiplayerResults.worstFriend.name}</p>
                    <p className="text-lg text-red-100">
                      {multiplayerResults.friendAverages[multiplayerResults.worstFriend.id]?.toFixed(1) || 'N/A'}/100 promedio
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Rankings */}
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-4 md:p-8 shadow-2xl">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-6 text-center">💌 Ranking Completo de Felicitaciones</h2>
            <div className="max-h-96 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
              {Object.entries(multiplayerResults.message_ratings || {})
                .sort(([aId], [bId]) => (multiplayerResults.friendAverages[parseInt(bId)] || 0) - (multiplayerResults.friendAverages[parseInt(aId)] || 0))
                .map(([messageId, messageData], index) => {
                  const average = multiplayerResults.friendAverages[parseInt(messageId)] || 0;
                  const position = index + 1;
                  const medals = ['🥇', '🥈', '🥉'];

                  return (
                    <div
                      key={messageId}
                      className={`rounded-2xl p-4 transform transition-transform hover:scale-105 cursor-pointer ${
                        position <= 3
                          ? 'bg-gradient-to-r from-green-400 to-blue-500'
                          : 'bg-white/10'
                      }`}
                      onClick={() => setSelectedMessage(messageData)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {medals[index] || (position <= 10 ? `#${position}` : `${position}º`)}
                          </span>
                          <div className="flex items-center gap-3">
                            {messageData.photo_url ? (
                              <img
                                src={`http://localhost:8000/uploads/profile-photos/${messageData.photo_url}`}
                                alt={messageData.friend_name}
                                className="w-10 h-10 object-cover rounded-full border-2 border-white"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-white" style={{ display: messageData.photo_url ? 'none' : 'flex' }}>
                              <span className="text-white text-sm font-bold">
                                {messageData.friend_name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="max-w-xs">
                              <p className="font-bold text-lg text-white">
                                {messageData.friend_name}
                              </p>
                              <p className="text-sm text-white/80 line-clamp-2">
                                "{messageData.player_message}"
                              </p>
                              <p className="text-sm text-yellow-300 font-semibold mt-1">
                                Promedio: {average.toFixed(1)}/100
                                <span className="ml-2 text-xs">
                                  ({Object.values(messageData.ratings || {}).length} calificaciones)
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl mb-1">👆</div>
                          <div className="text-xs text-white/70">Ver detalles</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Player Rankings */}
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-4 md:p-8 shadow-2xl">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-6 text-center">👥 Ranking Completo de Jugadores</h2>
            <div className="max-h-96 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
              {Object.entries(allPlayersRatings)
                .sort(([,a], [,b]) => {
                  const avgA = Object.values(a.ratings).reduce((sum, val) => sum + val, 0) / Object.values(a.ratings).length;
                  const avgB = Object.values(b.ratings).reduce((sum, val) => sum + val, 0) / Object.values(b.ratings).length;
                  return avgB - avgA;
                })
                .map(([playerId, playerData], index) => {
                  const average = Object.values(playerData.ratings).reduce((sum, val) => sum + val, 0) / Object.values(playerData.ratings).length;
                  const isCurrentPlayer = playerId === currentPlayerId;
                  const position = index + 1;
                  const medals = ['🥇', '🥈', '🥉'];

                  return (
                    <div
                      key={playerId}
                      className={`rounded-2xl p-4 transform transition-transform hover:scale-105 ${
                        isCurrentPlayer
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 ring-4 ring-white'
                          : position <= 3
                          ? 'bg-gradient-to-r from-green-400 to-blue-500'
                          : 'bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {medals[index] || (position <= 10 ? `#${position}` : `${position}º`)}
                          </span>
                          <div className="flex items-center gap-3">
                            {playerData.profile_photo ? (
                              <img
                                src={`http://localhost:8000/uploads/profile-photos/${playerData.profile_photo}`}
                                alt={playerData.name}
                                className="w-10 h-10 object-cover rounded-full border-2 border-white"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-white" style={{ display: playerData.profile_photo ? 'none' : 'flex' }}>
                              <span className="text-white text-sm font-bold">
                                {playerData.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className={`font-bold text-lg ${isCurrentPlayer ? 'text-white' : 'text-white'}`}>
                                {playerData.name} {isCurrentPlayer && '(Tú)'}
                              </p>
                              <p className={`text-sm ${isCurrentPlayer ? 'text-yellow-100' : 'text-white/80'}`}>
                                Promedio general: {average.toFixed(1)}/100
                                <span className="ml-2 text-xs">
                                  ({Object.values(playerData.ratings).length} calificaciones)
                                </span>
                              </p>
                            </div>
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

        {/* Complete Rankings Table */}
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-4 md:p-8 shadow-2xl mb-8 mx-4 md:mx-0">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-6 text-center">📊 Tabla Completa de Calificaciones</h2>
          <div className="max-h-96 overflow-auto -mx-4 md:mx-0 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
            <div className="px-4 md:px-0">
              <table className="w-full text-white min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-white/30">
                  <th className="text-left p-3 font-bold">Mensaje</th>
                  {Object.values(allPlayersRatings).map((player, index) => (
                    <th key={index} className="text-center p-3 font-bold">{player.name}</th>
                  ))}
                  <th className="text-center p-3 font-bold bg-yellow-500/30 rounded-lg">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(multiplayerResults.message_ratings || {})
                  .sort(([,a], [,b]) => (multiplayerResults.friendAverages[b.friend_name] || 0) - (multiplayerResults.friendAverages[a.friend_name] || 0))
                  .map(([messageId, messageData], index) => (
                  <tr key={messageId} className="border-b border-white/20 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setSelectedMessage(messageData)}>
                    <td className="p-3 font-semibold">
                      <div className="max-w-xs">
                        <p className="font-bold text-sm text-yellow-200">{messageData.friend_name}</p>
                        <p className="text-sm text-white/80 line-clamp-2">"{messageData.player_message}"</p>
                        <p className="text-xs text-blue-300 mt-1">👆 Haz clic para ver detalles</p>
                      </div>
                    </td>
                    {Object.values(allPlayersRatings).map((player, playerIndex) => {
                      const playerId = Object.keys(allPlayersRatings)[playerIndex];
                      return (
                        <td key={playerIndex} className="text-center p-3">
                          {messageData.ratings[playerId] || '-'}
                        </td>
                      );
                    })}
                    <td className="text-center p-3 font-bold bg-yellow-500/30 rounded-lg">
                      {multiplayerResults.friendAverages[messageId]?.toFixed(1) || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {Object.values(multiplayerResults.message_ratings || {}).some(msg => Object.keys(msg.comments || {}).length > 0) && (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-4 md:p-8 shadow-2xl mb-8 mx-4 md:mx-0">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-6 text-center">💬 Comentarios de los Jugadores</h2>
            <div className="space-y-6">
              {Object.entries(multiplayerResults.message_ratings || {})
                .filter(([, messageData]) => messageData.comments && Object.keys(messageData.comments).length > 0)
                .map(([messageId, messageData]) => (
                <div key={messageId} className="bg-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {messageData.photo_url ? (
                      <img
                        src={`http://localhost:8000/uploads/profile-photos/${messageData.photo_url}`}
                        alt={messageData.friend_name}
                        className="w-12 h-12 object-cover rounded-full border-2 border-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-white" style={{ display: messageData.photo_url ? 'none' : 'flex' }}>
                      <span className="text-white text-lg font-bold">
                        {messageData.friend_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Mensaje de {messageData.friend_name}</h3>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-white/80">
                          {multiplayerResults.friendAverages[messageId]?.toFixed(1) || 'N/A'}/100 promedio
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mt-1 italic">"{messageData.player_message}"</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(messageData.comments || {}).map(([playerId, commentData]) => (
                      <div key={playerId} className="bg-white/10 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <MessageCircle className="w-5 h-5 text-blue-300 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-blue-200 font-semibold text-sm mb-1">
                              {commentData.player_name}
                            </p>
                            <p className="text-white">"{commentData.comment}"</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-3xl p-8 max-w-2xl w-full shadow-2xl transform animate-gentle-bounce max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6 flex flex-col items-center relative">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse overflow-hidden relative">
                  {selectedMessage.photo_url ? (
                    <img
                      src={`http://localhost:8000/uploads/profile-photos/${selectedMessage.photo_url}`}
                      alt={selectedMessage.friend_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">
                        {selectedMessage.friend_name ? selectedMessage.friend_name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                  )}
                  {/* Speaker button */}
                  <button
                    onClick={() => toggleSpeech(selectedMessage.player_message)}
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
                <h3 className="text-3xl font-bold text-white mb-2">
                  Mensaje de {selectedMessage.friend_name} 💌
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span className="text-white/90 font-semibold">
                    {multiplayerResults.friendAverages[selectedMessage.friend_name]?.toFixed(1) || 'N/A'}/100 promedio
                  </span>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-6">
                <p className="text-white text-lg leading-relaxed">
                  {selectedMessage.player_message}
                </p>
              </div>

              {/* Ratings breakdown */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
                <h4 className="text-xl font-bold text-white mb-4">Calificaciones individuales:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(selectedMessage.ratings || {}).map(([playerId, rating]) => {
                    // Convertir playerId a número para comparación correcta
                    const numericPlayerId = parseInt(playerId);

                    // Buscar el jugador por diferentes campos posibles
                    const player = Object.values(allPlayersRatings).find(p =>
                      parseInt(p.id) === numericPlayerId ||
                      parseInt(p.player_id) === numericPlayerId ||
                      parseInt(p.playerId) === numericPlayerId
                    );
                    // Si no encontramos el jugador en allPlayersRatings, buscar en players prop
                    const fallbackPlayer = !player ? players.find(p =>
                      parseInt(p.id) === numericPlayerId ||
                      parseInt(p.player_id) === numericPlayerId ||
                      parseInt(p.playerId) === numericPlayerId
                    ) : null;
                    const finalPlayer = player || fallbackPlayer;
                    const playerName = finalPlayer ? finalPlayer.name : `Jugador ${playerId}`;
                    return (
                      <div key={playerId} className="bg-white/20 rounded-lg p-3 shadow-sm">
                        <p className="text-sm font-semibold text-white">{playerName}</p>
                        <p className="text-lg font-bold text-yellow-300">{rating}/100</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comments if any */}
              {selectedMessage.comments && Object.keys(selectedMessage.comments).length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">Comentarios:</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedMessage.comments).map(([playerId, commentData]) => (
                      <div key={playerId} className="bg-white/20 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <MessageCircle className="w-5 h-5 text-blue-300 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-blue-200 font-semibold text-sm mb-1">
                              {commentData.player_name}
                            </p>
                            <p className="text-white">"{commentData.comment}"</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center space-y-4 px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={shareMessage}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 md:py-4 md:px-8 rounded-xl text-base md:text-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <Share className="w-5 h-5 md:w-6 md:h-6 inline mr-2" />
              Compartir Resultados
            </button>

            {onBackToRating && (
              <button
                onClick={() => {
                  console.log('Volver a Calificar clicked');
                  onBackToRating();
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 md:py-4 md:px-8 rounded-xl text-base md:text-lg shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6 inline mr-2" />
                Volver a Calificar
              </button>
            )}

            <button
              onClick={resetGame}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 md:py-4 md:px-8 rounded-xl text-base md:text-lg transition-colors duration-300"
            >
              <RotateCcw className="w-5 h-5 md:w-6 md:h-6 inline mr-2" />
              Jugar de Nuevo
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default MultiplayerResults;