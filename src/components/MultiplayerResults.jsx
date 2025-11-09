import React from 'react';
import { Trophy, Crown, TrendingDown, Share, RotateCcw, MessageCircle, Star } from 'lucide-react';

const MultiplayerResults = ({
  multiplayerResults,
  allPlayersRatings,
  currentPlayerId,
  friends,
  confetti,
  shareMessage,
  resetGame
}) => {
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
        {/* Header */}
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
            {multiplayerResults.total_players} jugadores han calificado todas las felicitaciones
          </p>
        </div>

        {/* Global Results */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Best and Worst Messages */}
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">🏆 Ranking de Felicitaciones</h2>

            {/* Best Message */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 mb-6 transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-4">
                <Crown className="w-12 h-12 text-yellow-300 animate-bounce" />
                <div className="flex items-center gap-4">
                  <img
                    src={multiplayerResults.bestFriend.photo || `/photos/${multiplayerResults.bestFriend.name?.toLowerCase()}.jpg`}
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
                  <img
                    src={multiplayerResults.worstFriend.photo || `/photos/${multiplayerResults.worstFriend.name?.toLowerCase()}.jpg`}
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
                      {multiplayerResults.friendAverages[multiplayerResults.worstFriend.id]?.toFixed(1) || 'N/A'}/100 promedio
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

        {/* Complete Rankings Table */}
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">📊 Tabla Completa de Calificaciones</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
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
                  <tr key={messageId} className="border-b border-white/20 hover:bg-white/10 transition-colors">
                    <td className="p-3 font-semibold">
                      <div className="max-w-xs">
                        <p className="font-bold text-sm text-yellow-200">{messageData.friend_name}</p>
                        <p className="text-sm text-white/80 line-clamp-2">"{messageData.player_message}"</p>
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

        {/* Comments Section */}
        {Object.values(multiplayerResults.message_ratings || {}).some(msg => Object.keys(msg.comments || {}).length > 0) && (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl mb-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">💬 Comentarios de los Jugadores</h2>
            <div className="space-y-6">
              {Object.entries(multiplayerResults.message_ratings || {})
                .filter(([, messageData]) => messageData.comments && Object.keys(messageData.comments).length > 0)
                .map(([messageId, messageData]) => (
                <div key={messageId} className="bg-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-white">
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

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <button
            onClick={shareMessage}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg transform hover:scale-105 transition-all duration-300 mr-4"
          >
            <Share className="w-6 h-6 inline mr-2" />
            Compartir Resultados
          </button>

          <button
            onClick={resetGame}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors duration-300"
          >
            <RotateCcw className="w-5 h-5 inline mr-2" />
            Jugar de Nuevo
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerResults;