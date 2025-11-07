import React, { useState } from 'react';
import { Camera, User, Upload, Check } from 'lucide-react';

const ProfilePhotoSelector = ({ selectedPhoto, onPhotoSelect, playerName }) => {
  const [showSelector, setShowSelector] = useState(false);

  // Fotos predeterminadas disponibles
  const defaultPhotos = [
    { id: 'avatar1', url: '/photos/avatar1.png', name: 'Avatar 1' },
    { id: 'avatar2', url: '/photos/avatar2.png', name: 'Avatar 2' },
    { id: 'avatar3', url: '/photos/avatar3.png', name: 'Avatar 3' },
    { id: 'avatar4', url: '/photos/avatar4.png', name: 'Avatar 4' },
    { id: 'avatar5', url: '/photos/avatar5.png', name: 'Avatar 5' },
    { id: 'avatar6', url: '/photos/avatar6.png', name: 'Avatar 6' },
    { id: 'party', url: '/photos/party-hat.png', name: 'Fiesta' },
    { id: 'cake', url: '/photos/birthday-cake.png', name: 'Pastel' },
    { id: 'balloon', url: '/photos/balloon.png', name: 'Globo' },
    { id: 'gift', url: '/photos/gift-box.png', name: 'Regalo' },
  ];

  const handlePhotoSelect = (photo) => {
    onPhotoSelect(photo.url);
    setShowSelector(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen debe ser menor a 2MB');
        return;
      }

      // Crear URL temporal para preview
      const reader = new FileReader();
      reader.onload = (e) => {
        onPhotoSelect(e.target.result);
        setShowSelector(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateInitialsAvatar = (name) => {
    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    
    const colorIndex = name.length % colors.length;
    
    return (
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${colors[colorIndex]}`}>
        {initials}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Foto actual y botón para cambiar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          {selectedPhoto ? (
            <img
              src={selectedPhoto}
              alt="Foto de perfil"
              className="w-16 h-16 object-cover rounded-full border-4 border-white shadow-lg"
              onError={(e) => {
                // Si falla la imagen, mostrar avatar con iniciales
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          {!selectedPhoto && playerName && generateInitialsAvatar(playerName)}
          
          {!selectedPhoto && !playerName && (
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-600" />
            </div>
          )}

          <button
            onClick={() => setShowSelector(true)}
            className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
            title="Cambiar foto"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1">
          <p className="text-white font-semibold">Foto de perfil</p>
          <p className="text-white/70 text-sm">
            {selectedPhoto ? 'Haz clic en la cámara para cambiar' : 'Haz clic en la cámara para agregar'}
          </p>
        </div>
      </div>

      {/* Selector de fotos modal */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Selecciona tu foto de perfil
            </h3>

            {/* Opción de subir archivo */}
            <div className="mb-6">
              <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Subir mi propia foto</p>
                <p className="text-gray-500 text-sm">JPG, PNG (máx. 2MB)</p>
              </label>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-600 font-medium mb-4 text-center">O elige un avatar:</p>
              
              {/* Grid de fotos predeterminadas */}
              <div className="grid grid-cols-4 gap-3">
                {defaultPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => handlePhotoSelect(photo)}
                    className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors group"
                    title={photo.name}
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-16 h-16 object-cover rounded-full border-2 border-transparent group-hover:border-blue-500 transition-colors"
                      onError={(e) => {
                        // Si falla la imagen, mostrar ícono de usuario
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTMyIDEyQzM4LjYyNzQgMTIgNDQgMTcuMzcyNiA0NCAyNEM0NCAzMC42Mjc0IDM4LjYyNzQgMzYgMzIgMzZDMjUuMzcyNiAzNiAyMCAzMC42Mjc0IDIwIDI0QzIwIDE3LjM3MjYgMjUuMzcyNiAxMiAzMiAxMloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDUyQzEyIDQxLjUwNjYgMjAuNTA2NiAzMyAzMSAzM0gzM0M0My40OTM0IDMzIDUyIDQxLjUwNjYgNTIgNTJWNjRIMTJWNTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                    
                    {selectedPhoto === photo.url && (
                      <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Opción de usar iniciales */}
              {playerName && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handlePhotoSelect(null)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {generateInitialsAvatar(playerName)}
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Usar mis iniciales</p>
                      <p className="text-gray-600 text-sm">Avatar generado automáticamente</p>
                    </div>
                    
                    {selectedPhoto === null && (
                      <div className="ml-auto bg-green-500 rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSelector(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              
              {selectedPhoto && (
                <button
                  onClick={() => setShowSelector(false)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Usar esta foto
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoSelector;