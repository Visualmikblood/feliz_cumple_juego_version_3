/**
 * Utilidades para conectar con la API del backend
 * Compatible con localhost y hosting InfinityFree
 */

// Configuración de la API
const API_CONFIG = {
    // Para localhost
    localhost: 'http://localhost:8000',
    // Para hosting (cambiar por tu dominio de InfinityFree)
    production: 'https://tu-sitio.infinityfreeapp.com/backend'
};

// Detectar el entorno actual
const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return API_CONFIG.localhost;
    }
    return API_CONFIG.production;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Función genérica para hacer peticiones HTTP
 */
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}/api/index.php?path=${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`Error en petición API a ${endpoint}:`, error);
        throw error;
    }
};

/**
 * API de salas de juego
 */
export const roomsAPI = {
    // Crear nueva sala
    create: async (playerName, profilePhoto = null, deadlineDateTime = null) => {
        return apiRequest('rooms/create', {
            method: 'POST',
            body: JSON.stringify({
                playerName,
                profilePhoto,
                deadlineDateTime
            })
        });
    },

    // Unirse a sala existente
    join: async (roomCode, playerName, profilePhoto = null) => {
        return apiRequest('rooms/join', {
            method: 'POST',
            body: JSON.stringify({
                roomCode,
                playerName,
                profilePhoto
            })
        });
    },

    // Iniciar juego (solo host)
    start: async (roomId, playerId) => {
        return apiRequest('rooms/start', {
            method: 'POST',
            body: JSON.stringify({
                roomId,
                playerId
            })
        });
    },

    // Obtener información de sala
    getInfo: async (roomId) => {
        return apiRequest(`rooms/info&roomId=${roomId}`);
    },

    // Obtener salas disponibles
    getAvailable: async () => {
        return apiRequest('rooms/available');
    },

    // Actualizar fecha límite de sala
    updateDeadline: async (roomId, playerId, newDeadline) => {
        return apiRequest('rooms/update-deadline', {
            method: 'POST',
            body: JSON.stringify({
                roomId,
                playerId,
                newDeadline
            })
        });
    }
};

/**
 * API de calificaciones
 */
export const ratingsAPI = {
    // Guardar calificación
    save: async (roomId, playerId, messageId, rating, comment = null) => {
        return apiRequest('ratings/save', {
            method: 'POST',
            body: JSON.stringify({
                roomId,
                playerId,
                messageId,
                rating,
                comment
            })
        });
    },

    // Marcar jugador como terminado
    finish: async (roomId, playerId) => {
        return apiRequest('ratings/finish', {
            method: 'POST',
            body: JSON.stringify({
                roomId,
                playerId
            })
        });
    },

    // Obtener resultados finales
    getResults: async (roomId) => {
        return apiRequest(`ratings/results&roomId=${roomId}`);
    }
};

/**
 * API de notificaciones
 */
export const notificationsAPI = {
    // Obtener notificaciones de sala
    getRoomNotifications: async (roomId, limit = 50) => {
        return apiRequest(`notifications/room?roomId=${roomId}&limit=${limit}`);
    },

    // Obtener notificaciones no leídas
    getUnread: async (roomId, since = null) => {
        // Endpoint no implementado, devolver vacío silenciosamente
        return { success: true, data: [] };
    }
};

/**
 * API de mensajes
 */
export const messagesAPI = {
    // Obtener todos los mensajes de felicitaciones
    getAll: async () => {
        return apiRequest('messages');
    }
};

/**
 * API de mensajes de jugadores
 */
export const playerMessagesAPI = {
    // Guardar mensaje de jugador
    save: async (roomId, playerId, message) => {
        return apiRequest('player-messages/save', {
            method: 'POST',
            body: JSON.stringify({
                roomId,
                playerId,
                message
            })
        });
    },

    // Obtener mensajes de jugadores en una sala
    getByRoom: async (roomId) => {
        return apiRequest(`player-messages/get&roomId=${roomId}`);
    }
};

/**
 * API de subida de archivos
 */
export const uploadAPI = {
    // Subir foto de perfil
    profilePhoto: async (photoFile) => {
        const formData = new FormData();
        formData.append('photo', photoFile);

        const url = `${API_BASE_URL}/api/index.php?path=upload/profile-photo`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Error en subida de foto:', error);
            throw error;
        }
    }
};

/**
 * Hook personalizado para polling de notificaciones
 */
export const useNotificationPolling = (roomId, callback, interval = 5000) => {
    let intervalId = null;
    let lastCheck = null;

    const startPolling = () => {
        if (intervalId) return;

        intervalId = setInterval(async () => {
            try {
                const response = await notificationsAPI.getUnread(roomId, lastCheck);
                if (response.success && response.data.length > 0) {
                    callback(response.data);
                    lastCheck = new Date().toISOString();
                }
            } catch (error) {
                console.error('Error en polling de notificaciones:', error);
            }
        }, interval);
    };

    const stopPolling = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };

    return { startPolling, stopPolling };
};

/**
 * Utilidad para almacenar datos de sesión
 */
export const sessionStorage = {
    // Guardar datos de sesión del jugador
    savePlayerSession: (roomId, playerId, sessionId, playerName, roomCode = null) => {
        const sessionData = {
            roomId,
            playerId,
            sessionId,
            playerName,
            roomCode,
            timestamp: Date.now()
        };
        localStorage.setItem('birthday_game_session', JSON.stringify(sessionData));
    },

    // Obtener datos de sesión del jugador
    getPlayerSession: () => {
        try {
            const sessionData = localStorage.getItem('birthday_game_session');
            if (sessionData) {
                const data = JSON.parse(sessionData);
                // Verificar que la sesión no sea muy antigua (24 horas)
                if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    return data;
                }
            }
        } catch (error) {
            console.error('Error al obtener sesión:', error);
        }
        return null;
    },

    // Limpiar datos de sesión
    clearPlayerSession: () => {
        localStorage.removeItem('birthday_game_session');
    }
};

/**
 * Utilidades de validación
 */
export const validators = {
    roomCode: (code) => {
        return /^[A-Z0-9]{6}$/.test(code);
    },

    playerName: (name) => {
        return name && name.trim().length >= 2 && name.trim().length <= 50;
    },

    rating: (rating) => {
        return Number.isInteger(rating) && rating >= 1 && rating <= 100;
    }
};

/**
 * Manejo de errores de la API
 */
export const handleApiError = (error, fallbackMessage = 'Ha ocurrido un error') => {
    if (error.message) {
        return error.message;
    }
    return fallbackMessage;
};