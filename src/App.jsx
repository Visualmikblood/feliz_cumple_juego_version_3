import React, { useState, useEffect, useRef } from 'react';
import { Gift, Heart, Star, Sparkles, PartyPopper, Cake, Volume2, VolumeX, RotateCcw, Share, Trophy, Zap, ThumbsDown, GamepadIcon, Target, Award, Users, Crown, TrendingDown, CheckCircle } from 'lucide-react';
import PointsGame from './PointsGame';
import RatingGame from './RatingGame';
import MultiplayerResults from './components/MultiplayerResults';
import NotificationSystem, { useNotifications } from './components/NotificationSystem';
import { roomsAPI, ratingsAPI, notificationsAPI, sessionStorage, validators, handleApiError, useNotificationPolling, playerMessagesAPI } from './utils/api';

const BirthdayGame = () => {
  const [gameMode, setGameMode] = useState(null); // 'points', 'rating', or 'multiplayer'
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [clickedBalls, setClickedBalls] = useState(new Set());
  const [gameStarted, setGameStarted] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [score, setScore] = useState(0);
  const [ballAnimations, setBallAnimations] = useState({});
  const [magicMode, setMagicMode] = useState(false);
  const [collectedStars, setCollectedStars] = useState(0);
  const [collectedCurses, setCollectedCurses] = useState(0);
  const [specialEffects, setSpecialEffects] = useState([]);
  const [ballEffects, setBallEffects] = useState({}); // Track persistent effects per ball
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ballPoints, setBallPoints] = useState({});
  const [friendRatings, setFriendRatings] = useState({});
  const [currentRating, setCurrentRating] = useState(50);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);

  // Multiplayer specific states
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [gameState, setGameState] = useState('setup'); // 'setup', 'waiting', 'writing', 'playing', 'results'
  const [gameRoomId, setGameRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [allPlayersRatings, setAllPlayersRatings] = useState({});
  const [multiplayerResults, setMultiplayerResults] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [timeLimitHours, setTimeLimitHours] = useState(72);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [showAvailableRooms, setShowAvailableRooms] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para mensajes personalizados
  const [playerMessage, setPlayerMessage] = useState('');
  const [playerMessages, setPlayerMessages] = useState([]);
  const [hasSubmittedMessage, setHasSubmittedMessage] = useState(false);
  
  // Sistema de notificaciones
  const { notifications: localNotifications, addNotification, dismissNotification, clearAllNotifications } = useNotifications();
  
  // Notification polling
  const notificationPolling = useNotificationPolling(
    roomData?.room?.id,
    (newNotifications) => {
      setNotifications(prev => [...newNotifications, ...prev]);
      // Agregar a notificaciones locales
      newNotifications.forEach(notification => {
        addNotification(notification);
        if (notification.type === 'player_finished' || notification.type === 'one_day_left' || notification.type === 'room_closed') {
          showNotification(notification.message);
        }
      });
      // Actualizar información de la sala cuando hay nuevas notificaciones
      if (roomData?.room?.id) {
        getRoomInfo(roomData.room.id);
      }
    }
  );

  // Polling para actualizar estado del juego cuando está en writing o playing
  const [gameStateInterval, setGameStateInterval] = useState(null);

  useEffect(() => {
    if (isMultiplayer && (gameState === 'writing' || gameState === 'playing') && roomData?.room?.id) {
      console.log('Iniciando polling de estado del juego cada 2 segundos');
      // Actualizar cada 2 segundos para verificar cambios de estado
      const interval = setInterval(() => {
        console.log('Verificando estado del juego...');
        getRoomInfo(roomData.room.id);
        if (gameState === 'writing') {
          // Solo llamar checkAllMessagesSubmitted si no hay errores previos
          checkAllMessagesSubmitted().catch(error => {
            console.error('Error silencioso en checkAllMessagesSubmitted:', error);
            // No mostrar error al usuario
          });
        } else if (gameState === 'playing' && playerMessages.length === 0) {
          // Si estamos en playing pero no hay mensajes, intentar obtenerlos
          getPlayerMessages().catch(error => {
            console.error('Error obteniendo mensajes en playing:', error);
          });
        } else if (gameState === 'playing' && playerMessages.length > 0) {
          // Si estamos en playing con mensajes, usar los mensajes como friends
          console.log('Actualizando friends con playerMessages:', playerMessages);
          setFriends(playerMessages);
        }
      }, 2000);

      setGameStateInterval(interval);

      return () => {
        console.log('Deteniendo polling de estado del juego');
        if (interval) clearInterval(interval);
      };
    } else {
      if (gameStateInterval) {
        console.log('Limpiando polling de estado del juego');
        clearInterval(gameStateInterval);
        setGameStateInterval(null);
      }
    }
  }, [isMultiplayer, gameState, roomData?.room?.id]);

  // Polling para actualizar lista de jugadores
  const [roomUpdateInterval, setRoomUpdateInterval] = useState(null);

  useEffect(() => {
    if (isMultiplayer && gameState === 'waiting' && roomData?.room?.id) {
      console.log('Iniciando polling de sala cada 3 segundos');
      // Actualizar cada 3 segundos
      const interval = setInterval(() => {
        console.log('Actualizando lista de jugadores...');
        getRoomInfo(roomData.room.id);
      }, 3000);

      setRoomUpdateInterval(interval);

      return () => {
        console.log('Deteniendo polling de sala');
        if (interval) clearInterval(interval);
      };
    } else {
      if (roomUpdateInterval) {
        console.log('Limpiando polling de sala');
        clearInterval(roomUpdateInterval);
        setRoomUpdateInterval(null);
      }
    }
  }, [isMultiplayer, gameState, roomData?.room?.id]);

  // Function to handle speech synthesis
  const toggleSpeech = (text) => {
    if (!window.speechSynthesis) {
      alert('Tu navegador no soporta síntesis de voz.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (audioRef.current) audioRef.current.volume = 1;
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => {
        setIsSpeaking(true);
        if (audioRef.current) audioRef.current.volume = 0.1;
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        if (audioRef.current) audioRef.current.volume = 1;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        if (audioRef.current) audioRef.current.volume = 1;
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop speech and restore volume when modal closes
  useEffect(() => {
    if (!showMessage && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (audioRef.current) audioRef.current.volume = 1;
    }
  }, [showMessage]);

  const friends = [
    {
      id: 1,
      name: "María",
      color: "bg-pink-400",
      message: "¡Feliz cumpleaños! Eres una persona increíble y estoy muy agradecida de tenerte en mi vida. Que este nuevo año te traiga muchas aventuras y momentos felices. ¡Te quiero mucho! 🎉💕",
      icon: Heart,
      photo: "/photos/maria.jpg"
    },
    {
      id: 2,
      name: "Carlos",
      color: "bg-blue-400",
      message: "¡Hey cumpleañero/a! Espero que tengas un día fantástico lleno de risas y buena comida. Gracias por ser un amigo tan genial y por todos los buenos momentos que hemos compartido. ¡A celebrar! 🎂🎈",
      icon: Gift,
      photo: "/photos/carlos.jpg"
    },
    {
      id: 3,
      name: "Ana",
      color: "bg-green-400",
      message: "¡Felicidades en tu día especial! Eres una de las personas más divertidas que conozco. Que cumplas muchos más años llenos de salud, amor y éxito. ¡Disfruta tu día al máximo! ✨🌟",
      icon: Star,
      photo: "/photos/ana.jpg"
    },
    {
      id: 4,
      name: "Pedro",
      color: "bg-yellow-400",
      message: "¡Cumpleaños feliz! Me alegra mucho poder celebrar contigo otro año de vida. Eres una persona especial que siempre sabe cómo hacer sonreír a los demás. ¡Que tengas un día maravilloso! 🎊🎁",
      icon: PartyPopper,
      photo: "/photos/pedro.jpg"
    },
    {
      id: 5,
      name: "Laura",
      color: "bg-purple-400",
      message: "¡Feliz cumple! Gracias por ser tan buena persona y por todos los momentos increíbles que hemos vivido juntos. Espero que este nuevo año de vida esté lleno de nuevas oportunidades y mucha felicidad. 💜🎯",
      icon: Sparkles,
      photo: "/photos/laura.jpg"
    },
    {
      id: 6,
      name: "Diego",
      color: "bg-red-400",
      message: "¡Qué tengas un cumpleaños espectacular! Eres una persona única y especial. Que este año te traiga todo lo que deseas y más. ¡Vamos a celebrar como se debe! 🔥🎸",
      icon: Cake,
      photo: "/photos/diego.jpg"
    },
    {
      id: 7,
      name: "Sofia",
      color: "bg-indigo-400",
      message: "¡Feliz cumpleaños querido/a! Tu amistad significa mucho para mí. Eres alguien en quien siempre puedo confiar. Que tengas un año lleno de bendiciones y momentos hermosos. 💙🦋",
      icon: Heart,
      photo: "/photos/sofia.jpg"
    },
    {
      id: 8,
      name: "Miguel",
      color: "bg-orange-400",
      message: "¡Cumpleaños feliz! Espero que tu día esté lleno de sorpresas maravillosas. Gracias por ser un amigo tan leal y divertido. ¡Que celebres muchos cumpleaños más! 🧡🎭",
      icon: Gift,
      photo: "/photos/miguel.jpg"
    },
    {
      id: 9,
      name: "Carmen",
      color: "bg-teal-400",
      message: "¡Feliz cumple! Eres una persona extraordinaria con un corazón enorme. Me siento afortunada de conocerte. Que este nuevo año de vida esté lleno de amor, risas y aventuras. 💚🌺",
      icon: Star,
      photo: "/photos/carmen.jpg"
    },
    {
      id: 10,
      name: "Javier",
      color: "bg-cyan-400",
      message: "¡Felicidades! Otro año más de vida para celebrar todo lo increíble que eres. Gracias por ser un amigo tan genial y por todos los buenos ratos. ¡A disfrutar este día especial! 🎨🎪",
      icon: PartyPopper,
      photo: "/photos/javier.jpg"
    },
    {
      id: 11,
      name: "Isabel",
      color: "bg-rose-400",
      message: "¡Feliz cumpleaños! Eres una persona muy especial que siempre ilumina el día de los demás. Que este nuevo año te traiga mucha paz, amor y todas las cosas buenas que mereces. 🌸✨",
      icon: Sparkles,
      photo: "/photos/isabel.jpg"
    }
  ];

  // Generate random points when game starts
  const generateRandomPoints = () => {
    const points = {};
    friends.forEach(friend => {
      const randomPoints = Math.floor(Math.random() * 201) - 100; // -100 to 100
      points[friend.id] = randomPoints;
    });
    setBallPoints(points);
  };

  const generateConfetti = (amount = 40) => {
    const newConfetti = [];
    for (let i = 0; i < amount; i++) {
      newConfetti.push({
        id: Math.random(),
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: ['text-pink-400', 'text-blue-400', 'text-yellow-400', 'text-green-400', 'text-purple-400'][Math.floor(Math.random() * 5)],
        symbol: ['✨', '🎉', '🎊', '⭐', '💖', '🎈'][Math.floor(Math.random() * 6)]
      });
    }
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 4000);
  };

  const generateSpecialEffect = (type, x, y) => {
    const effect = {
      id: Math.random(),
      type,
      x,
      y,
      timestamp: Date.now()
    };
    setSpecialEffects(prev => [...prev, effect]);
    setTimeout(() => {
      setSpecialEffects(prev => prev.filter(e => e.id !== effect.id));
    }, 2000);
  };

  const handleBallClick = (friend, event) => {
    if (!gameStarted) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    setSelectedFriend(friend);
    setClickedBalls(prev => new Set([...prev, friend.id]));

    if (gameMode === 'points') {
      const points = ballPoints[friend.id];
      setScore(prev => prev + points);

      // Check if this ball already has an effect assigned
      if (!ballEffects[friend.id]) {
        const random = Math.random();
        let effect = null;

        if (random < 0.3) { // 30% chance for star bonus
          effect = 'star';
          setCollectedStars(prev => prev + 1);
          setScore(prev => prev + 50); // Bonus points
        } else if (random < 0.5) { // 20% chance for curse penalty (30% - 50% range)
          effect = 'curse';
          setCollectedCurses(prev => prev + 1);
          setScore(prev => prev - 30); // Penalty points
        }

        // Store the effect for this ball (persistent)
        setBallEffects(prev => ({
          ...prev,
          [friend.id]: effect
        }));

        // Generate visual effect if there was one
        if (effect) {
          generateSpecialEffect(effect, x, y);
        }
      } else {
        // If ball already has an effect, just show the visual effect again
        if (ballEffects[friend.id]) {
          generateSpecialEffect(ballEffects[friend.id], x, y);
        }
      }
    }

    // Ball animation
    setBallAnimations(prev => ({
      ...prev,
      [friend.id]: 'animate-spin'
    }));

    // Show message after animation
    setTimeout(() => {
      setShowMessage(true);
      setBallAnimations(prev => ({
        ...prev,
        [friend.id]: ''
      }));
    }, 1000);

    generateConfetti(50);
    generateSpecialEffect('celebration', x, y);

    if (Math.random() < 0.3) {
      setMagicMode(true);
      setTimeout(() => setMagicMode(false), 3000);
    }
  };

  const handleRatingSubmit = async () => {
    if (isMultiplayer && gameState === 'playing') {
      // Guardar en base de datos para multijugador
      const success = await saveMultiplayerRating(
        selectedFriend.id, 
        currentRating, 
        currentComment.trim() || null
      );
      
      if (success) {
        setFriendRatings(prev => ({
          ...prev,
          [selectedFriend.id]: currentRating
        }));
      }
    } else {
      // Modo solo jugador
      setFriendRatings(prev => ({
        ...prev,
        [selectedFriend.id]: currentRating
      }));
    }
    
    setShowRatingModal(false);
    setShowMessage(false);
    setCurrentRating(50);
    setCurrentComment('');
  };

  const getBestRatedFriend = () => {
    if (Object.keys(friendRatings).length === 0) return null;
    const bestId = Object.keys(friendRatings).reduce((a, b) =>
      friendRatings[a] > friendRatings[b] ? a : b
    );
    return friends.find(f => f.id === parseInt(bestId));
  };

  const getWorstRatedFriend = () => {
    if (Object.keys(friendRatings).length === 0) return null;
    const worstId = Object.keys(friendRatings).reduce((a, b) =>
      friendRatings[a] < friendRatings[b] ? a : b
    );
    return friends.find(f => f.id === parseInt(worstId));
  };

  const startGame = (mode, multiplayer = false) => {
    console.log('startGame called with mode:', mode, 'multiplayer:', multiplayer);
    setGameMode(mode);
    setIsMultiplayer(multiplayer);
    if (multiplayer || mode === 'multiplayer') {
      setGameState('setup');
      setGameStarted(false);
      console.log('Multiplayer mode: set gameState to setup and gameStarted to false');
    } else {
      setGameStarted(true);
      if (mode === 'points') {
        generateRandomPoints();
      }
      generateConfetti(80);
    }
    if (musicEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetGame = () => {
    // Detener polling de notificaciones
    notificationPolling.stopPolling();

    // Limpiar sesión
    sessionStorage.clearPlayerSession();

    setGameMode(null);
    setIsMultiplayer(false);
    setGameState('setup');
    setGameRoomId('');
    setPlayerName('');
    setPlayers([]);
    setIsHost(false);
    setCurrentPlayerId('');
    setSessionId('');
    setRoomData(null);
    setClickedBalls(new Set());
    setGameStarted(false);
    setShowMessage(false);
    setSelectedFriend(null);
    setScore(0);
    setCollectedStars(0);
    setCollectedCurses(0);
    setMagicMode(false);
    setBallAnimations({});
    setSpecialEffects([]);
    setShowCelebration(false);
    setBallPoints({});
    setBallEffects({});
    setFriendRatings({});
    setAllPlayersRatings({});
    setShowRatingModal(false);
    setCurrentRating(50);
    setCurrentComment('');
    setMultiplayerResults(null);
    setNotifications([]);
    setTimeLimitHours(72);
    setAvailableRooms([]);
    setShowAvailableRooms(false);
    setLoading(false);
    setError(null);

    // Limpiar estados de mensajes personalizados
    setPlayerMessage('');
    setPlayerMessages([]);
    setHasSubmittedMessage(false);
  };

  const shareMessage = () => {
    let message = '';
    if (gameMode === 'points') {
      const result = score >= 0 ? 'gané' : 'perdí';
      message = `¡Acabo de ${result} en el juego de cumpleaños! 🎉 Obtuve ${score} puntos, ${collectedStars} estrellas bonus y ${collectedCurses} maldiciones. #FelizCumpleanos`;
    } else if (gameMode === 'rating') {
      const avgRating = Object.values(friendRatings).reduce((a, b) => a + b, 0) / Object.values(friendRatings).length;
      message = `¡Califiqué todas las felicitaciones de cumpleaños! 🎉 Promedio: ${avgRating.toFixed(1)}/100. #FelizCumpleanos`;
    } else if (gameMode === 'multiplayer' && multiplayerResults) {
      message = `¡Jugamos el modo multijugador de calificaciones! 🏆 ${multiplayerResults.bestFriend.name} tuvo la mejor felicitación (${multiplayerResults.friendAverages[multiplayerResults.bestFriend.id].toFixed(1)}/100) y ${multiplayerResults.worstFriend.name} necesita mejorar (${multiplayerResults.friendAverages[multiplayerResults.worstFriend.id].toFixed(1)}/100). #FelizCumpleanos`;
    }

    if (navigator.share) {
      navigator.share({ text: message });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      alert('¡Mensaje copiado al portapapeles!');
    } else {
      alert(message);
    }
  };

  // Función para mostrar notificaciones visuales
  const showNotification = (message) => {
    // Crear elemento de notificación temporal
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm animate-bounce';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  };

  // Función para crear sala
  const createRoom = async () => {
    if (!validators.playerName(playerName)) {
      setError('Por favor ingresa un nombre válido (2-50 caracteres)');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await roomsAPI.create(playerName, null, timeLimitHours);
      
      if (response.success) {
        const { room_id, room_code, player_id, session_id } = response.data;
        
        setGameRoomId(room_code);
        setCurrentPlayerId(player_id);
        setSessionId(session_id);
        setIsHost(true);
        setGameState('waiting');
        
        // Guardar sesión
        sessionStorage.savePlayerSession(room_id, player_id, session_id, playerName);
        
        // Obtener información de la sala
        await getRoomInfo(room_id);
        
        generateConfetti(50);
      } else {
        setError(handleApiError(response));
      }
    } catch (error) {
      setError(handleApiError(error, 'Error al crear la sala'));
    } finally {
      setLoading(false);
    }
  };

  // Función para unirse a sala
  const joinRoom = async () => {
    if (!validators.playerName(playerName)) {
      setError('Por favor ingresa un nombre válido (2-50 caracteres)');
      return;
    }
    
    if (!validators.roomCode(gameRoomId)) {
      setError('Por favor ingresa un código de sala válido (6 caracteres)');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await roomsAPI.join(gameRoomId, playerName);
      
      if (response.success) {
        const { room_id, player_id, session_id, status } = response.data;
        
        setCurrentPlayerId(player_id);
        setSessionId(session_id);
        setIsHost(false);
        setGameState(status === 'playing' ? 'playing' : 'waiting');
        
        // Guardar sesión
        sessionStorage.savePlayerSession(room_id, player_id, session_id, playerName);
        
        // Obtener información de la sala
        await getRoomInfo(room_id);
        
        generateConfetti(30);
      } else {
        setError(handleApiError(response));
      }
    } catch (error) {
      setError(handleApiError(error, 'Error al unirse a la sala'));
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar juego multijugador
  const startMultiplayerGame = async () => {
    if (!isHost) {
      setError('Solo el host puede iniciar el juego');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await roomsAPI.start(roomData.room.id, currentPlayerId);

      if (response.success) {
        setGameState('writing');
        setGameStarted(true);
        generateConfetti(80);

        // Iniciar polling de notificaciones
        // notificationPolling.startPolling(); // Desactivado temporalmente por errores
      } else {
        setError(handleApiError(response));
      }
    } catch (error) {
      setError(handleApiError(error, 'Error al iniciar el juego'));
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener información de la sala
  const getRoomInfo = async (roomId) => {
    try {
      console.log('Obteniendo información de la sala:', roomId);
      const response = await roomsAPI.getInfo(roomId);
      console.log('Respuesta de getRoomInfo:', response);

      if (response.success) {
        const newRoomData = response.data;
        console.log('Datos de la sala actualizados:', newRoomData.players.length, 'jugadores, estado:', newRoomData.room.status);
        setRoomData(newRoomData);
        setPlayers(newRoomData.players);

        // Si el estado de la sala cambió, actualizar el estado del juego
        if (newRoomData.room.status === 'playing' && gameState !== 'playing' && gameState !== 'writing') {
          console.log('Cambiando estado a writing');
          setGameState('writing');
          setGameStarted(true);
          notificationPolling.startPolling();
        } else if (newRoomData.room.status === 'finished' && gameState !== 'results') {
          console.log('Cambiando estado a results');
          setGameState('results');
          // Obtener resultados finales
          await getMultiplayerResults();
        }

        // Si estamos esperando y hay suficientes jugadores, mostrar mensaje
        if (gameState === 'waiting' && newRoomData.players.length >= 2 && isHost) {
          console.log('Suficientes jugadores para iniciar el juego');
        }
      } else {
        console.error('Error en respuesta de getRoomInfo:', response);
      }
    } catch (error) {
      console.error('Error al obtener información de la sala:', error);
    }
  };

  // Función para obtener salas disponibles
  const getAvailableRooms = async () => {
    try {
      const response = await roomsAPI.getAvailable();
      if (response.success) {
        setAvailableRooms(response.data);
      }
    } catch (error) {
      console.error('Error al obtener salas disponibles:', error);
    }
  };

  // Función para guardar mensaje personalizado
  const savePlayerMessage = async () => {
    if (!playerMessage.trim()) {
      setError('Por favor escribe un mensaje');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await playerMessagesAPI.save(roomData.room.id, currentPlayerId, playerMessage.trim());

      if (response.success) {
        setHasSubmittedMessage(true);
        generateConfetti(30);

        // Verificar si todos han enviado sus mensajes
        await checkAllMessagesSubmitted();
        return true;
      } else {
        setError(handleApiError(response));
        return false;
      }
    } catch (error) {
      setError(handleApiError(error, 'Error al guardar mensaje'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si todos han enviado mensajes
  const checkAllMessagesSubmitted = async () => {
    try {
      const messagesResponse = await playerMessagesAPI.getByRoom(roomData.room.id);
      if (messagesResponse.success) {
        const submittedCount = messagesResponse.data.length;
        const totalPlayers = players.length;

        console.log(`${submittedCount}/${totalPlayers} mensajes enviados`);

        if (submittedCount >= totalPlayers && isHost) {
          // Todos han enviado mensajes, pasar a calificación
          setGameState('playing');
          await getPlayerMessages();
        }
      } else {
        console.error('Error en respuesta de API:', messagesResponse.error);
        // No mostrar error al usuario si es por tabla faltante
        const isDatabaseError = messagesResponse.error?.includes('player_messages') ||
                               messagesResponse.error?.includes('Base table or view not found') ||
                               messagesResponse.error?.includes('Table') ||
                               messagesResponse.error?.includes('SQLSTATE') ||
                               messagesResponse.error?.includes('1146') ||
                               messagesResponse.error?.includes('birthday_game') ||
                               messagesResponse.error?.includes('does not exist');

        if (!isDatabaseError) {
          setError('Error al verificar mensajes enviados');
        }
      }
    } catch (error) {
      console.error('Error al verificar mensajes:', error);
      // No mostrar error al usuario si es por tabla faltante
      const isDatabaseError = error.message?.includes('player_messages') ||
                             error.message?.includes('Base table or view not found') ||
                             error.message?.includes('Table') ||
                             error.message?.includes('SQLSTATE') ||
                             error.message?.includes('1146') ||
                             error.message?.includes('birthday_game') ||
                             error.message?.includes('does not exist');

      if (!isDatabaseError) {
        setError('Error al verificar mensajes enviados');
      }
    }
  };

  // Función para obtener mensajes de jugadores
  const getPlayerMessages = async () => {
    try {
      const response = await playerMessagesAPI.getByRoom(roomData.room.id);
      if (response.success) {
        setPlayerMessages(response.data);
        console.log('Mensajes de jugadores obtenidos:', response.data.length);
      }
    } catch (error) {
      console.error('Error al obtener mensajes de jugadores:', error);
    }
  };

  // Función para guardar calificación multijugador
  const saveMultiplayerRating = async (messageId, rating, comment) => {
    try {
      const response = await ratingsAPI.save(
        roomData.room.id,
        currentPlayerId,
        messageId,
        rating,
        comment
      );

      if (!response.success) {
        setError(handleApiError(response));
        return false;
      }
      return true;
    } catch (error) {
      setError(handleApiError(error, 'Error al guardar calificación'));
      return false;
    }
  };

  // Función para finalizar calificaciones del jugador
  const submitPlayerRatings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ratingsAPI.finish(roomData.room.id, currentPlayerId);
      
      if (response.success) {
        // Verificar si todos han terminado
        await getRoomInfo(roomData.room.id);
        
        // Si la sala está terminada, obtener resultados
        if (roomData.room.status === 'finished') {
          await getMultiplayerResults();
        }
        
        generateConfetti(100);
        setShowCelebration(true);
      } else {
        setError(handleApiError(response));
      }
    } catch (error) {
      setError(handleApiError(error, 'Error al finalizar calificaciones'));
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener resultados multijugador
  const getMultiplayerResults = async () => {
    try {
      const response = await ratingsAPI.getResults(roomData.room.id);

      if (response.success) {
        const results = response.data;

        // Transformar datos para el formato esperado por el frontend
        const friendAverages = results.message_averages;

        // Encontrar mejor y peor mensaje usando los mensajes personalizados
        const bestMessage = playerMessages.find(m => m.id === results.best_message_id);
        const worstMessage = playerMessages.find(m => m.id === results.worst_message_id);

        setMultiplayerResults({
          ...results,
          friendAverages,
          bestFriend: bestMessage ? {
            id: bestMessage.id,
            name: bestMessage.player_name,
            message: bestMessage.message
          } : null,
          worstFriend: worstMessage ? {
            id: worstMessage.id,
            name: worstMessage.player_name,
            message: worstMessage.message
          } : null
        });

        setAllPlayersRatings(results.player_ratings);
        setGameState('results');

        // Detener polling
        notificationPolling.stopPolling();
      }
    } catch (error) {
      console.error('Error al obtener resultados:', error);
    }
  };

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
      if (musicEnabled && (gameStarted || gameState === 'playing')) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicEnabled, gameStarted, gameState]);

  // Game mode selection screen
  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-4xl w-full">
          <div className="text-center mb-12">
            <Cake className="w-24 h-24 mx-auto mb-6 text-yellow-300 animate-bounce" />
            <h1 className="text-5xl font-bold text-white mb-4 titulo_feliz_cumple">
              ¡FELIZ CUMPLEAÑOS Miguel! 🎂
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Elige tu tipo de juego favorito para descubrir las felicitaciones
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Points Game */}
            <div className="bg-white/10 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-green-300" />
                <h3 className="text-2xl font-bold text-white mb-4">🎯 Juego de Puntos</h3>
                <div className="bg-white/10 rounded-xl p-4 mb-6">
                  <ul className="text-white/90 space-y-2 text-left">
                    <li>• Descubre puntos aleatorios ocultos</li>
                    <li>• Pueden ser positivos o negativos</li>
                    <li>• Estrellas ⭐ suman puntos bonus</li>
                    <li>• Rayos ⚡ restan puntos</li>
                    <li>• ¡Gana si terminas con puntos positivos!</li>
                  </ul>
                </div>
                <button
                  onClick={() => startGame('points', false)}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 w-full"
                >
                  <GamepadIcon className="w-5 h-5 inline mr-2" />
                  ¡Jugar Solo!
                </button>
              </div>
            </div>

            {/* Rating Game */}
            <div className="bg-white/10 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-2xl font-bold text-white mb-4">⭐ Juego de Calificaciones</h3>
                <div className="bg-white/10 rounded-xl p-4 mb-6">
                  <ul className="text-white/90 space-y-2 text-left">
                    <li>• Califica cada felicitación del 1-100</li>
                    <li>• Usa el deslizador para puntuar</li>
                    <li>• Descubre quién te felicitó mejor</li>
                    <li>• Ve el ranking final de amigos</li>
                    <li>• ¡Comparte tu promedio de calificaciones!</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => startGame('rating', false)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 w-full"
                  >
                    <Star className="w-5 h-5 inline mr-2" />
                    ¡Jugar Solo!
                  </button>
                  <button
                    onClick={() => startGame('multiplayer', true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 w-full"
                  >
                    <Users className="w-5 h-5 inline mr-2" />
                    ¡Jugar Multijugador!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted && !isMultiplayer) return null;

  // Render the appropriate game component based on gameMode
  if (gameMode === 'points') {
    return (
      <PointsGame
        friends={friends}
        clickedBalls={clickedBalls}
        setClickedBalls={setClickedBalls}
        showMessage={showMessage}
        setShowMessage={setShowMessage}
        selectedFriend={selectedFriend}
        setSelectedFriend={setSelectedFriend}
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        confetti={confetti}
        setConfetti={setConfetti}
        specialEffects={specialEffects}
        setSpecialEffects={setSpecialEffects}
        showCelebration={showCelebration}
        setShowCelebration={setShowCelebration}
        isSpeaking={isSpeaking}
        setIsSpeaking={setIsSpeaking}
        audioRef={audioRef}
        utteranceRef={utteranceRef}
        score={score}
        setScore={setScore}
        collectedStars={collectedStars}
        setCollectedStars={setCollectedStars}
        collectedCurses={collectedCurses}
        setCollectedCurses={setCollectedCurses}
        ballPoints={ballPoints}
        setBallPoints={setBallPoints}
        ballEffects={ballEffects}
        setBallEffects={setBallEffects}
        ballAnimations={ballAnimations}
        setBallAnimations={setBallAnimations}
        magicMode={magicMode}
        setMagicMode={setMagicMode}
        generateConfetti={generateConfetti}
        generateSpecialEffect={generateSpecialEffect}
        toggleSpeech={toggleSpeech}
        shareMessage={shareMessage}
        resetGame={resetGame}
        handleBallClick={handleBallClick}
      />
    );
  }

  if (gameMode === 'rating') {
    return (
      <RatingGame
        friends={friends}
        clickedBalls={clickedBalls}
        setClickedBalls={setClickedBalls}
        showMessage={showMessage}
        setShowMessage={setShowMessage}
        selectedFriend={selectedFriend}
        setSelectedFriend={setSelectedFriend}
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        confetti={confetti}
        setConfetti={setConfetti}
        specialEffects={specialEffects}
        setSpecialEffects={setSpecialEffects}
        showCelebration={showCelebration}
        setShowCelebration={setShowCelebration}
        isSpeaking={isSpeaking}
        setIsSpeaking={setIsSpeaking}
        audioRef={audioRef}
        utteranceRef={utteranceRef}
        friendRatings={friendRatings}
        setFriendRatings={setFriendRatings}
        currentRating={currentRating}
        setCurrentRating={setCurrentRating}
        showRatingModal={showRatingModal}
        setShowRatingModal={setShowRatingModal}
        ballAnimations={ballAnimations}
        setBallAnimations={setBallAnimations}
        magicMode={magicMode}
        setMagicMode={setMagicMode}
        generateConfetti={generateConfetti}
        generateSpecialEffect={generateSpecialEffect}
        toggleSpeech={toggleSpeech}
        shareMessage={shareMessage}
        resetGame={resetGame}
        handleBallClick={handleBallClick}
        handleRatingSubmit={handleRatingSubmit}
        getBestRatedFriend={getBestRatedFriend}
        getWorstRatedFriend={getWorstRatedFriend}
      />
    );
  }

  // Multiplayer setup screen
  if (isMultiplayer && gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-2xl w-full">
          <div className="text-center mb-8">
            <Users className="w-20 h-20 mx-auto mb-4 text-white" />
            <h2 className="text-4xl font-bold text-white mb-4">Modo Multijugador</h2>
            <p className="text-xl text-white/80">Configura tu sala de juego</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4">
              <p className="text-red-200 text-center font-semibold">{error}</p>
            </div>
          )}

          {loading && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 mb-4">
              <p className="text-blue-200 text-center">Procesando...</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-white text-lg font-semibold mb-2">Tu nombre:</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="w-full px-4 py-3 rounded-xl text-gray-800 text-lg font-medium bg-white/90 border-2 border-transparent focus:border-yellow-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-white text-lg font-semibold mb-2">Foto de perfil (opcional - haz clic para seleccionar):</label>
              <div className="grid grid-cols-3 gap-2">
                {friends.slice(0, 6).map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => {
                      setPlayerName(friend.name);
                      console.log('Seleccionado:', friend.name);
                    }}
                    className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors border-2 border-transparent hover:border-yellow-400"
                  >
                    <img
                      src={friend.photo}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full mx-auto mb-1"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=random&color=fff&size=48`;
                      }}
                    />
                    <span className="text-white text-xs block text-center">{friend.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    console.log('Creando sala con nombre:', playerName);
                    createRoom();
                  }}
                  disabled={!playerName.trim() || loading}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50 w-full"
                >
                  <Crown className="w-6 h-6 inline mr-2" />
                  {loading ? 'Creando...' : 'Crear Sala'}
                </button>
                <p className="text-white/70 text-sm text-center">El sistema generará un código automáticamente</p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={gameRoomId}
                  onChange={(e) => setGameRoomId(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO DE SALA"
                  className="w-full px-4 py-3 rounded-xl text-gray-800 text-lg font-medium bg-white/90 border-2 border-transparent focus:border-yellow-400 focus:outline-none transition-colors text-center"
                />
                <button
                  onClick={() => {
                    console.log('Uniéndose a sala:', gameRoomId, 'con nombre:', playerName);
                    joinRoom();
                  }}
                  disabled={!playerName.trim() || !gameRoomId.trim() || loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl text-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50 w-full"
                >
                  <Users className="w-5 h-5 inline mr-2" />
                  {loading ? 'Uniéndose...' : 'Unirse'}
                </button>
              </div>
            </div>

            <button
              onClick={resetGame}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors duration-300"
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer waiting room
  if (isMultiplayer && gameState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
              <Users className="w-16 h-16 text-white" />
              <div className="text-left">
                <h2 className="text-3xl font-bold text-white">Sala: {gameRoomId}</h2>
                <p className="text-white/80">Esperando jugadores...</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold text-white text-center">Jugadores ({players.length}):</h3>
            {players.map((player) => (
              <div key={player.id} className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {player.isHost && <Crown className="w-5 h-5 text-yellow-400" />}
                  <span className="text-white font-semibold text-lg">{player.name}</span>
                  {player.id === currentPlayerId && <span className="text-yellow-300 text-sm">(Tú)</span>}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  player.isReady
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {player.isReady ? '✓ Listo' : '⏳ Esperando'}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            {isHost ? (
              <button
                onClick={startMultiplayerGame}
                disabled={players.length < 2}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50"
              >
                <GamepadIcon className="w-6 h-6 inline mr-2" />
                ¡Iniciar Juego!
              </button>
            ) : (
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white text-lg">Esperando que el host inicie el juego...</p>
              </div>
            )}

            <p className="text-white/70 text-sm">Mínimo 2 jugadores requeridos</p>

            <button
              onClick={resetGame}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors duration-300"
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Salir de la Sala
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer writing phase
  if (isMultiplayer && gameState === 'writing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-4xl w-full">
          <div className="text-center mb-8">
            <Heart className="w-20 h-20 mx-auto mb-4 text-white" />
            <h2 className="text-4xl font-bold text-white mb-4">¡Escribe tu mensaje de felicitación!</h2>
            <p className="text-xl text-white/80">Los demás jugadores calificarán tu mensaje</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4">
              <p className="text-red-200 text-center font-semibold">{error}</p>
            </div>
          )}

          {hasSubmittedMessage ? (
            <div className="text-center space-y-6">
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-300" />
                <h3 className="text-2xl font-bold text-white mb-2">¡Mensaje enviado!</h3>
                <p className="text-white/80">Esperando que todos terminen de escribir...</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white text-lg">Tu mensaje:</p>
                <p className="text-white/90 mt-2 p-4 bg-white/10 rounded-lg italic">"{playerMessage}"</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white text-lg">Esperando a {players.length - (playerMessages.length + (hasSubmittedMessage ? 1 : 0))} jugador(es)...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-white text-lg font-semibold mb-2">
                  Tu mensaje de felicitación para Miguel:
                </label>
                <textarea
                  value={playerMessage}
                  onChange={(e) => setPlayerMessage(e.target.value)}
                  placeholder="Escribe un mensaje bonito y original de felicitación..."
                  className="w-full px-4 py-4 rounded-xl text-gray-800 text-lg font-medium bg-white/90 border-2 border-transparent focus:border-yellow-400 focus:outline-none transition-colors resize-none"
                  rows={6}
                  maxLength={500}
                />
                <p className="text-white/70 text-sm mt-2 text-right">
                  {playerMessage.length}/500 caracteres
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={savePlayerMessage}
                  disabled={!playerMessage.trim() || loading}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Mensaje'}
                  <Heart className="w-5 h-5 inline ml-2" />
                </button>
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <button
              onClick={resetGame}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors duration-300"
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Salir de la Sala
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer game playing
  if (isMultiplayer && gameState === 'playing') {
    // Si no hay mensajes de jugadores, mostrar pantalla de espera
    if (!playerMessages || playerMessages.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-2xl w-full">
            <div className="text-center mb-8">
              <Award className="w-20 h-20 mx-auto mb-4 text-white" />
              <h2 className="text-4xl font-bold text-white mb-4">Cargando mensajes...</h2>
              <p className="text-xl text-white/80">Esperando que se carguen los mensajes de los jugadores</p>
            </div>

            <div className="text-center">
              <button
                onClick={resetGame}
                className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors duration-300"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Volver
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <RatingGame
          friends={playerMessages}
          clickedBalls={clickedBalls}
          setClickedBalls={setClickedBalls}
          showMessage={showMessage}
          setShowMessage={setShowMessage}
          selectedFriend={selectedFriend}
          setSelectedFriend={setSelectedFriend}
          musicEnabled={musicEnabled}
          setMusicEnabled={setMusicEnabled}
          confetti={confetti}
          setConfetti={setConfetti}
          specialEffects={specialEffects}
          setSpecialEffects={setSpecialEffects}
          showCelebration={showCelebration}
          setShowCelebration={setShowCelebration}
          isSpeaking={isSpeaking}
          setIsSpeaking={setIsSpeaking}
          audioRef={audioRef}
          utteranceRef={utteranceRef}
          friendRatings={friendRatings}
          setFriendRatings={setFriendRatings}
          currentRating={currentRating}
          setCurrentRating={setCurrentRating}
          currentComment={currentComment}
          setCurrentComment={setCurrentComment}
          showRatingModal={showRatingModal}
          setShowRatingModal={setShowRatingModal}
          ballAnimations={ballAnimations}
          setBallAnimations={setBallAnimations}
          magicMode={magicMode}
          setMagicMode={setMagicMode}
          generateConfetti={generateConfetti}
          generateSpecialEffect={generateSpecialEffect}
          toggleSpeech={toggleSpeech}
          shareMessage={shareMessage}
          resetGame={resetGame}
          handleBallClick={handleBallClick}
          handleRatingSubmit={handleRatingSubmit}
          getBestRatedFriend={getBestRatedFriend}
          getWorstRatedFriend={getWorstRatedFriend}
          isMultiplayer={true}
          submitPlayerRatings={submitPlayerRatings}
          roomData={roomData}
          players={players}
          notifications={notifications}
          loading={loading}
        />

        <NotificationSystem
          notifications={localNotifications}
          onDismiss={dismissNotification}
          roomData={roomData}
        />
      </>
    );
  }

  // Multiplayer results screen
  if (isMultiplayer && gameState === 'results' && multiplayerResults) {
    return (
      <MultiplayerResults
        multiplayerResults={multiplayerResults}
        allPlayersRatings={allPlayersRatings}
        currentPlayerId={currentPlayerId}
        friends={friends}
        confetti={confetti}
        shareMessage={shareMessage}
        resetGame={resetGame}
      />
    );
  }

  return null;
};

export default BirthdayGame;
