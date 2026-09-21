CREATE TABLE IF NOT EXISTS Usuarios (
    id INT AUTO_INCREMENT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    foto_url VARCHAR(255),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS Chats (
    id INT AUTO_INCREMENT NOT NULL,
    nombre_chat VARCHAR(255),
    es_grupal BOOLEAN NOT NULL DEFAULT FALSE,
    foto_url VARCHAR(255),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS ChatParticipantes (
    id INT AUTO_INCREMENT NOT NULL,
    chat_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_union DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (chat_id) REFERENCES Chats(id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

CREATE TABLE IF NOT EXISTS Mensajes (
    id INT AUTO_INCREMENT NOT NULL,
    chat_id INT NOT NULL,
    usuario_id INT NOT NULL,
    contenido VARCHAR(255) NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id),
    FOREIGN KEY (chat_id) REFERENCES Chats(id)
);

INSERT INTO Usuarios (nombre, correo, contraseña, foto_url) VALUES
('agustinp', 'amedina@pioix.edu.ar', 'eloso', 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Estadio_mas_monumental.jpg'),
('agustinf', 'afilipelli@pioix.edu.ar', 'velez', 'https://velezsarsfield.com.ar/img/contenido/club/cd/estadio-05.jpg'),
('facundog', 'fngarcia@pioix.edu.ar', 'tanque', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjPZZw_0s-VWNWsKm2C-Ju_iyVDbBhzqitv8fQlhA9oYdK-NXtWq681O7D&s=10'),
('bautistam', 'bmarc@pioix.edu.ar', 'marcus', 'https://cdn.conmebol.com/wp-content/uploads/2014/08/bombonera-750x485.jpg');

INSERT INTO Chats (nombre_chat, es_grupal, fecha_creacion) VALUES
(NULL, FALSE, '2026-09-13 17:00:00');

INSERT INTO Chats (nombre_chat, es_grupal, fecha_creacion) VALUES
('Chat 0', TRUE, '2026-09-13 17:30:00');

INSERT INTO ChatParticipantes (chat_id, usuario_id, fecha_union) VALUES
(1, 1, '2026-09-14 07:00:00'),
(1, 2, '2026-09-14 07:00:00'),
(2, 1, '2026-09-14 07:00:00'),
(2, 3, '2026-09-14 07:00:00'),
(2, 4, '2026-09-14 07:00:00');

INSERT INTO Mensajes (chat_id, usuario_id, contenido, fecha_envio) VALUES
(1, 1, 'El chori está agresivo', '2026-09-14 14:30:00'),
(1, 2, 'Cierto', '2026-09-15 14:35:00'),
(2, 3, 'Muy bien', '2026-09-16 14:40:00');