-- Script SQL simplificado para instalación rápida
-- Ejecutar este archivo para crear las tablas necesarias

-- Crear tabla de salas de juego
CREATE TABLE IF NOT EXISTS `game_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_code` varchar(8) NOT NULL,
  `host_player_id` int(11) DEFAULT NULL,
  `status` enum('waiting','playing','finished','expired') DEFAULT 'waiting',
  `time_limit_hours` int(11) DEFAULT 72,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `started_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `finished_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_code` (`room_code`),
  KEY `status` (`status`),
  KEY `expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla de jugadores
CREATE TABLE IF NOT EXISTS `players` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `is_host` tinyint(1) DEFAULT 0,
  `is_ready` tinyint(1) DEFAULT 0,
  `has_finished_rating` tinyint(1) DEFAULT 0,
  `session_id` varchar(64) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `finished_rating_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `session_id` (`session_id`),
  FOREIGN KEY (`room_id`) REFERENCES `game_rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla de mensajes de felicitaciones
CREATE TABLE IF NOT EXISTS `congratulation_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `friend_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `color_class` varchar(50) NOT NULL,
  `icon_name` varchar(50) NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `friend_id` (`friend_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla de calificaciones
CREATE TABLE IF NOT EXISTS `ratings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 100),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_rating` (`room_id`,`player_id`,`message_id`),
  KEY `room_id` (`room_id`),
  KEY `player_id` (`player_id`),
  KEY `message_id` (`message_id`),
  FOREIGN KEY (`room_id`) REFERENCES `game_rooms` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`message_id`) REFERENCES `congratulation_messages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `type` enum('room_created','player_joined','game_started','one_day_left','room_closed','player_finished') NOT NULL,
  `message` text NOT NULL,
  `data` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_sent` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `type` (`type`),
  KEY `created_at` (`created_at`),
  FOREIGN KEY (`room_id`) REFERENCES `game_rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar mensajes de felicitaciones por defecto
INSERT IGNORE INTO `congratulation_messages` (`friend_id`, `name`, `message`, `color_class`, `icon_name`, `photo_url`) VALUES
(1, 'María', '¡Feliz cumpleaños! Eres una persona increíble y estoy muy agradecida de tenerte en mi vida. Que este nuevo año te traiga muchas aventuras y momentos felices. ¡Te quiero mucho! 🎉💕', 'bg-pink-400', 'Heart', '/photos/maria.jpg'),
(2, 'Carlos', '¡Hey cumpleañero/a! Espero que tengas un día fantástico lleno de risas y buena comida. Gracias por ser un amigo tan genial y por todos los buenos momentos que hemos compartido. ¡A celebrar! 🎂🎈', 'bg-blue-400', 'Gift', '/photos/carlos.jpg'),
(3, 'Ana', '¡Felicidades en tu día especial! Eres una de las personas más divertidas que conozco. Que cumplas muchos más años llenos de salud, amor y éxito. ¡Disfruta tu día al máximo! ✨🌟', 'bg-green-400', 'Star', '/photos/ana.jpg'),
(4, 'Pedro', '¡Cumpleaños feliz! Me alegra mucho poder celebrar contigo otro año de vida. Eres una persona especial que siempre sabe cómo hacer sonreír a los demás. ¡Que tengas un día maravilloso! 🎊🎁', 'bg-yellow-400', 'PartyPopper', '/photos/pedro.jpg'),
(5, 'Laura', '¡Feliz cumple! Gracias por ser tan buena persona y por todos los momentos increíbles que hemos vivido juntos. Espero que este nuevo año de vida esté lleno de nuevas oportunidades y mucha felicidad. 💜🎯', 'bg-purple-400', 'Sparkles', '/photos/laura.jpg'),
(6, 'Diego', '¡Qué tengas un cumpleaños espectacular! Eres una persona única y especial. Que este año te traiga todo lo que deseas y más. ¡Vamos a celebrar como se debe! 🔥🎸', 'bg-red-400', 'Cake', '/photos/diego.jpg'),
(7, 'Sofia', '¡Feliz cumpleaños querido/a! Tu amistad significa mucho para mí. Eres alguien en quien siempre puedo confiar. Que tengas un año lleno de bendiciones y momentos hermosos. 💙🦋', 'bg-indigo-400', 'Heart', '/photos/sofia.jpg'),
(8, 'Miguel', '¡Cumpleaños feliz! Espero que tu día esté lleno de sorpresas maravillosas. Gracias por ser un amigo tan leal y divertido. ¡Que celebres muchos cumpleaños más! 🧡🎭', 'bg-orange-400', 'Gift', '/photos/miguel.jpg'),
(9, 'Carmen', '¡Feliz cumple! Eres una persona extraordinaria con un corazón enorme. Me siento afortunada de conocerte. Que este nuevo año de vida esté lleno de amor, risas y aventuras. 💚🌺', 'bg-teal-400', 'Star', '/photos/carmen.jpg'),
(10, 'Javier', '¡Felicidades! Otro año más de vida para celebrar todo lo increíble que eres. Gracias por ser un amigo tan genial y por todos los buenos ratos. ¡A disfrutar este día especial! 🎨🎪', 'bg-cyan-400', 'PartyPopper', '/photos/javier.jpg'),
(11, 'Isabel', '¡Feliz cumpleaños! Eres una persona muy especial que siempre ilumina el día de los demás. Que este nuevo año te traiga mucha paz, amor y todas las cosas buenas que mereces. 🌸✨', 'bg-rose-400', 'Sparkles', '/photos/isabel.jpg');