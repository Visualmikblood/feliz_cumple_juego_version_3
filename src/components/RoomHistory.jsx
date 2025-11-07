import React, { useState, useEffect } from 'react';
import { History, Clock, Users, Trophy, Eye, X, Calendar, MessageCircle } from 'lucide-react';
import { roomsAPI, ratingsAPI } from '../utils/api';

const RoomHistory = ({ isOpen, onClose, currentPlayerId }) => {
  const [historyRooms, setHistoryRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomResults, setRoomResults] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadRoomHistory();
    }
  }, [isOpen]);

  const loadRoomHistory = async () => {
    setLoading(true);
    try {
      // En un caso real, tendríamos un endpoint para historial del usuario
      // Por ahora simulamos con salas disponibles que incluyan finalizadas
      const response = await roomsAPI.getAvailable();
      if (response.success) {
        // Filtrar solo salas donde el usuario participó (esto se implementaría en el backend)
        setHistoryRooms(response.data);
      }
    } catch (error) {
      console.error('Error loading room history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewRoomDetails = async (room) => {
    setSelectedRoom(room);
    try {
      const response = await ratingsAPI.getResults(room.room_id || room.id);
      if (response.success) {
        setRoomResults(response.data);
      }
    } catch (error) {
      console.error('Error loading room results:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'finished': return 'text-green-600 bg-green-100';
      case 'playing': return 'text-blue-600 bg-blue-100';  
      case 'waiting': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'finished': return '✅ Finalizada';
      case 'playing': return '🎮 En juego';
      case 'waiting': return '⏳ Esperando';
      case 'expired': return '⏰ Expirada';
      default: return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Historial de Salas</h2>
                <p className="text-purple-200">Revisa tus partidas anteriores y resultados</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Lista de salas */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Tus Salas
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600">Cargando historial...</p>
                </div>
              ) : historyRooms.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">No hay historial disponible</p>
                  <p className="text-gray-500 text-sm mt-1">Las salas aparecerán aquí después de participar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyRooms.map((room) => (
                    <div
                      key={room.room_code}
                      onClick={() => viewRoomDetails(room)}
                      className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">{room.room_code}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                          {getStatusText(room.status)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Host: {room.host_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(room.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          <span>{room.player_count} jugadores</span>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <div className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                          <span>Ver detalles</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detalles de sala seleccionada */}
          <div className="w-1/2 overflow-y-auto">
            <div className="p-6">
              {!selectedRoom ? (
                <div className="text-center py-16">
                  <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Selecciona una sala</h3>
                  <p className="text-gray-500">Haz clic en una sala de la izquierda para ver sus detalles y resultados</p>
                </div>
              ) : (
                <div>
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-xl font-bold mb-2">Sala {selectedRoom.room_code}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Host:</span>
                        <span className="ml-2 font-medium">{selectedRoom.host_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Estado:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedRoom.status)}`}>
                          {getStatusText(selectedRoom.status)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Creada:</span>
                        <span className="ml-2 font-medium">{formatDate(selectedRoom.created_at)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Jugadores:</span>
                        <span className="ml-2 font-medium">{selectedRoom.player_count}</span>
                      </div>
                    </div>
                  </div>

                  {roomResults ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-600" />
                          Resultados Finales
                        </h4>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                #{roomResults.best_message_id}
                              </div>
                              <div className="text-sm text-gray-600">Mejor Mensaje</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-blue-600">
                                {roomResults.total_players}
                              </div>
                              <div className="text-sm text-gray-600">Jugadores</div>
                            </div>
                          </div>
                        </div>

                        {roomResults.message_averages && (
                          <div>
                            <h5 className="font-medium mb-2">Promedios por Mensaje:</h5>
                            <div className="space-y-2">
                              {Object.entries(roomResults.message_averages)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 5)
                                .map(([messageId, average]) => (
                                <div key={messageId} className="flex justify-between items-center py-1">
                                  <span className="text-sm">Mensaje #{messageId}</span>
                                  <span className="font-medium text-blue-600">{Number(average).toFixed(1)}/100</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {roomResults.player_ratings && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                            Tus Calificaciones
                          </h4>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">
                              En esta sala calificaste los mensajes y dejaste comentarios
                            </p>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-blue-600">
                                Tu participación registrada ✅
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-600">Cargando resultados...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomHistory;