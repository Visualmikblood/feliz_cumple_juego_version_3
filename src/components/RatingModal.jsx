import React from 'react';
import { Star, MessageCircle, Volume2, VolumeX, X } from 'lucide-react';

const RatingModal = ({
  selectedFriend,
  showRatingModal,
  setShowRatingModal,
  currentRating,
  setCurrentRating,
  currentComment,
  setCurrentComment,
  handleRatingSubmit,
  toggleSpeech,
  isSpeaking,
  isMultiplayer = false
}) => {
  if (!showRatingModal || !selectedFriend) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            {selectedFriend.profile_photo ? (
              <img
                src={`http://localhost:8000/uploads/profile-photos/${selectedFriend.profile_photo}`}
                alt={selectedFriend.player_name || selectedFriend.name}
                className="w-16 h-16 object-cover rounded-full border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-16 h-16 ${selectedFriend.color || 'bg-gradient-to-br from-blue-400 to-purple-500'} rounded-full flex items-center justify-center border-4 border-white shadow-lg`} style={{ display: selectedFriend.profile_photo ? 'none' : 'flex' }}>
              {selectedFriend.icon && typeof selectedFriend.icon === 'function' ? React.createElement(selectedFriend.icon, { className: "w-8 h-8 text-white" }) : <span className="text-white text-lg font-bold">{(selectedFriend.player_name || selectedFriend.name) ? (selectedFriend.player_name || selectedFriend.name).charAt(0).toUpperCase() : '?'}</span>}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{selectedFriend.name}</h3>
              <p className="text-gray-600">Califica esta felicitación</p>
            </div>
          </div>
          <button
            onClick={() => setShowRatingModal(false)}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Felicitación */}
        <div className="bg-gray-100 rounded-xl p-4 mb-6">
          <p className="text-gray-800 leading-relaxed">{selectedFriend.message}</p>
          <button
            onClick={() => toggleSpeech(selectedFriend.message)}
            className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isSpeaking
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                Detener
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                Escuchar
              </>
            )}
          </button>
        </div>

        {/* Calificación */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-3">
            Calificación: {currentRating}/100
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={currentRating}
            onChange={(e) => setCurrentRating(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mb-3"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Terrible (1)</span>
            <span>Regular (50)</span>
            <span>Excelente (100)</span>
          </div>
          
          {/* Indicador visual de calificación */}
          <div className="flex justify-center mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 ${
                  currentRating >= star * 20
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Comentario (solo en multijugador) */}
        {isMultiplayer && (
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">
              <MessageCircle className="w-4 h-4 inline mr-1" />
              Comentario (opcional):
            </label>
            <textarea
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              placeholder="Escribe un comentario sobre esta felicitación..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none h-20 focus:border-blue-500 focus:outline-none"
              maxLength={200}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {currentComment.length}/200
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowRatingModal(false)}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleRatingSubmit}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Calificar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;