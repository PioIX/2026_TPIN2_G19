CREATE TABLE IF NOT EXISTS Usuarios(
    id INT AUTO_INCREMENT UNIQUE NOT NULL,
    nombre VARCHAR(255),
    correo VARCHAR(255),
    contraseña VARCHAR(255),
    foto_url VARCHAR(255),
    fecha_creacion DATETIME,
    PRIMARY KEY (id)
);

CREATE TABLE Mensajes(
    id INT AUTO_INCREMENT UNIQUE NOT NULL,
    chat_id INT,
    usuario_id INT,
    cotenido VARCHAR(255),
    fecha_envio DATETIME,	
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_Id) REFERENCES Usuarios(id),
    FOREIGN KEY (chat_id) REFERENCES Chats(id)
);

CREATE TABLE Chats(
    id INT AUTO_INCREMENT UNIQUE NOT NULL,
    nombre_chat VARCHAR(255),
    es_grupal BOOLEAN,
    foto_url VARCHAR(255),
    fecha_creacion	 DATETIME,	
    PRIMARY KEY (id)
);

CREATE TABLE ChatParticipantes(
    id INT AUTO_INCREMENT UNIQUE NOT NULL,
    chat_id INT,
    usuario_id INT,
    fecha_union DATETIME,	
    PRIMARY KEY (id),
	FOREIGN KEY (chat_id) REFERENCES Chats(id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

INSERT INTO Usuarios(nombre, correo, contraseña, foto_url) VALUES 
('agustinp', 'amedina@pioix.edu.ar', 'eloso', 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Estadio_mas_monumental.jpg?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original'),
('agustinf', 'afilipelli@pioix.edu.ar', 'velez', 'https://velezsarsfield.com.ar/img/contenido/club/cd/estadio-05.jpg'),
('facundog', 'fngarcia@pioix.edu.ar', 'tanque', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjPZZw_0s-VWNWsKm2C-Ju_iyVDbBhzqitv8fQlhA9oYdK-NXtWq681O7D&s=10'),
('bautistam', 'bmarc@pioix.edu.ar', 'marcus', 'https://cdn.conmebol.com/wp-content/uploads/2014/08/bombonera-750x485.jpg');

INSERT INTO Mensajes(contenido, fecha_envio) VALUES
('El chori está agresivo', '2026-09-14 14:30:00'),
('Cierto', '2026-09-15 14:35:00'),
('Muy bien', '2026-09-16 14:40:00');

INSERT INTO Chats(nombre_chat, es_grupal, fecha_creacion) VALUES
('Chat 0', TRUE, '2026-09-13 17:00:00');

INSERT INTO ChatParticipantes(fecha_union) VALUES
('2026-09-14 07:00:00');
