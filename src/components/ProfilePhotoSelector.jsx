import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

const ProfilePhotoSelector = ({ currentPhoto, onPhotoChange, playerName }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentPhoto);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setPreviewUrl(result);
        onPhotoChange(result);
        setIsSelecting(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setPreviewUrl(result);
        onPhotoChange(result);
        setIsSelecting(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange(null);
  };

  const getInitial = () => {
    return playerName ? playerName.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar display */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-3xl font-bold">
              {getInitial()}
            </span>
          )}
        </div>

        {/* Edit button */}
        <button
          onClick={() => setIsSelecting(!isSelecting)}
          className="absolute -bottom-2 -right-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2 shadow-lg transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Remove button (only if there's a photo) */}
        {previewUrl && (
          <button
            onClick={removePhoto}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Selection options */}
      {isSelecting && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Subir desde galería</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Tomar foto</span>
            </button>

            <button
              onClick={() => setIsSelecting(false)}
              className="bg-gray-500/50 hover:bg-gray-500/70 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Helper text */}
      <p className="text-white/70 text-sm text-center max-w-xs">
        {previewUrl ? 'Foto seleccionada' : 'Toca la cámara para elegir una foto de perfil'}
      </p>
    </div>
  );
};

export default ProfilePhotoSelector;