import React, { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, CheckCircle, Info, Clock, Users } from 'lucide-react';

const NotificationSystem = ({ notifications = [], onDismiss, roomData }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Mostrar solo las 3 notificaciones más recientes por defecto
    const recent = notifications.slice(0, showAll ? notifications.length : 3);
    setVisibleNotifications(recent);
  }, [notifications, showAll]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'room_created':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'player_joined':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'game_started':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'player_finished':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'one_day_left':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'room_closed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'room_created':
      case 'game_started':
      case 'player_finished':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'player_joined':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'one_day_left':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'room_closed':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Hace un momento';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
    return date.toLocaleDateString();
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {/* Indicador de notificaciones */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-white bg-black/50 backdrop-blur-lg rounded-full px-3 py-1">
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium">{notifications.length}</span>
        </div>
        
        {notifications.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-white bg-black/50 backdrop-blur-lg rounded-full px-3 py-1 text-xs hover:bg-black/60 transition-colors"
          >
            {showAll ? 'Mostrar menos' : 'Ver todas'}
          </button>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-2">
        {visibleNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-lg border-l-4 p-4 shadow-lg backdrop-blur-lg ${getNotificationColor(notification.type)} animate-slide-in`}
          >
            <div className="flex items-start gap-3">
              {getNotificationIcon(notification.type)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-75">
                    {formatTime(notification.created_at)}
                  </span>
                  
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(notification.id)}
                      className="p-1 rounded-full hover:bg-black/10 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Datos adicionales si existen */}
                {notification.data && (
                  <div className="mt-2 text-xs opacity-75">
                    {notification.data.player_name && (
                      <span>Jugador: {notification.data.player_name}</span>
                    )}
                    {notification.data.player_count && (
                      <span>Jugadores: {notification.data.player_count}</span>
                    )}
                    {notification.data.expires_at && (
                      <span>Expira: {new Date(notification.data.expires_at).toLocaleString()}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Información de la sala actual */}
      {roomData && (
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 text-white text-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">Sala: {roomData.room?.room_code}</span>
          </div>
          
          <div className="space-y-1 text-xs opacity-90">
            <div>Estado: {roomData.room?.status}</div>
            <div>Jugadores: {roomData.players?.length || 0}</div>
            {roomData.room?.expires_at && (
              <div>Expira: {new Date(roomData.room.expires_at).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Hook personalizado para manejar notificaciones
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now() + Math.random(),
      created_at: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-dismiss después de 10 segundos si no es crítica
    if (notification.type !== 'room_closed' && notification.type !== 'one_day_left') {
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, 10000);
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications
  };
};

export default NotificationSystem;