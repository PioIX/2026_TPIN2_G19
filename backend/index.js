require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./modulos/mysql");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});


app.post("/register", async (req, res) => {
  const { nombre, correo, contraseña, foto_url } = req.body;

  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const [existentes] = await pool.query(
      "SELECT id FROM Usuarios WHERE correo = ?",
      [correo]
    );
    if (existentes.length > 0) {
      return res.status(409).json({ error: "Ya existe un usuario con ese correo" });
    }

    const [resultado] = await pool.query(
      "INSERT INTO Usuarios (nombre, correo, contraseña, foto_url) VALUES (?, ?, ?, ?)",
      [nombre, correo, contraseña, foto_url || null]
    );

    res.status(201).json({
      id: resultado.insertId,
      nombre,
      correo,
      foto_url: foto_url || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

app.post("/login", async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const [filas] = await pool.query(
      "SELECT id, nombre, correo, contraseña, foto_url FROM Usuarios WHERE correo = ?",
      [correo]
    );

    if (filas.length === 0 || filas[0].contraseña !== contraseña) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    const usuario = filas[0];
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      foto_url: usuario.foto_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

app.get("/chats", async (req, res) => {
  const usuarioId = Number(req.query.usuario_id);

  if (!usuarioId) {
    return res.status(400).json({ error: "Falta usuario_id" });
  }

  try {
    const [chats] = await pool.query(
      `SELECT c.id, c.nombre_chat, c.es_grupal, c.foto_url
       FROM Chats c
       JOIN ChatParticipantes cp ON cp.chat_id = c.id
       WHERE cp.usuario_id = ?
       ORDER BY c.fecha_creacion DESC`,
      [usuarioId]
    );

    const chatsCompletos = await Promise.all(
      chats.map(async (chat) => {
        if (chat.es_grupal) return chat;

        const [otro] = await pool.query(
          `SELECT u.nombre, u.foto_url
           FROM Usuarios u
           JOIN ChatParticipantes cp ON cp.usuario_id = u.id
           WHERE cp.chat_id = ? AND cp.usuario_id != ?`,
          [chat.id, usuarioId]
        );

        return {
          ...chat,
          nombre_chat: otro[0]?.nombre || chat.nombre_chat,
          foto_url: chat.foto_url || otro[0]?.foto_url,
        };
      })
    );

    res.json(chatsCompletos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los chats" });
  }
});

app.post("/chats", async (req, res) => {
  const { usuario_id, correo_contacto } = req.body;

  if (!usuario_id || !correo_contacto) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const [contactos] = await pool.query(
      "SELECT id, nombre, foto_url FROM Usuarios WHERE correo = ?",
      [correo_contacto]
    );

    if (contactos.length === 0) {
      return res.status(404).json({ error: "No existe ningún usuario con ese correo" });
    }

    const contacto = contactos[0];

    const [resultadoChat] = await pool.query(
      "INSERT INTO Chats (nombre_chat, es_grupal, fecha_creacion) VALUES (NULL, FALSE, NOW())"
    );
    const chatId = resultadoChat.insertId;

    await pool.query(
      "INSERT INTO ChatParticipantes (chat_id, usuario_id, fecha_union) VALUES (?, ?, NOW()), (?, ?, NOW())",
      [chatId, usuario_id, chatId, contacto.id]
    );

    res.status(201).json({
      id: chatId,
      nombre_chat: contacto.nombre,
      es_grupal: false,
      foto_url: contacto.foto_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear el chat" });
  }
});

app.post("/chats/grupo", async (req, res) => {
  const { usuario_id, nombre_chat, foto_url, correos } = req.body;

  if (!usuario_id || !nombre_chat || !Array.isArray(correos) || correos.length === 0) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const [usuarios] = await pool.query(
      `SELECT id, correo FROM Usuarios WHERE correo IN (${correos.map(() => "?").join(",")})`,
      correos
    );

    const encontrados = usuarios.map((u) => u.correo);
    const faltantes = correos.filter((c) => !encontrados.includes(c));

    if (faltantes.length > 0) {
      return res.status(404).json({
        error: `No existen usuarios con estos correos: ${faltantes.join(", ")}`,
      });
    }

    const [resultadoChat] = await pool.query(
      "INSERT INTO Chats (nombre_chat, es_grupal, foto_url, fecha_creacion) VALUES (?, TRUE, ?, NOW())",
      [nombre_chat, foto_url || null]
    );
    const chatId = resultadoChat.insertId;

    const idsParticipantes = [usuario_id, ...usuarios.map((u) => u.id)];
    const placeholders = idsParticipantes.map(() => "(?, ?, NOW())").join(", ");
    const params = idsParticipantes.flatMap((id) => [chatId, id]);

    await pool.query(
      `INSERT INTO ChatParticipantes (chat_id, usuario_id, fecha_union) VALUES ${placeholders}`,
      params
    );

    res.status(201).json({
      id: chatId,
      nombre_chat,
      es_grupal: true,
      foto_url: foto_url || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear el grupo" });
  }
});

app.get("/chats/:id/mensajes", async (req, res) => {
  const chatId = Number(req.params.id);

  try {
    const [mensajes] = await pool.query(
      `SELECT m.id, m.chat_id, m.usuario_id, m.contenido, m.fecha_envio,
              u.nombre AS nombre_usuario
       FROM Mensajes m
       JOIN Usuarios u ON u.id = m.usuario_id
       WHERE m.chat_id = ?
       ORDER BY m.fecha_envio ASC`,
      [chatId]
    );

    res.json(mensajes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el historial" });
  }
});


io.on("connection", (socket) => {
  socket.on("unirseAChat", (chatId) => {
    socket.join(`chat_${chatId}`);
  });

  socket.on("salirDeChat", (chatId) => {
    socket.leave(`chat_${chatId}`);
  });

  socket.on("enviarMensaje", async ({ chat_id, usuario_id, contenido }) => {
    try {
      const [resultado] = await pool.query(
        "INSERT INTO Mensajes (chat_id, usuario_id, contenido, fecha_envio) VALUES (?, ?, ?, NOW())",
        [chat_id, usuario_id, contenido]
      );

      const [usuarioRows] = await pool.query(
        "SELECT nombre FROM Usuarios WHERE id = ?",
        [usuario_id]
      );

      const mensaje = {
        id: resultado.insertId,
        chat_id,
        usuario_id,
        contenido,
        fecha_envio: new Date(),
        nombre_usuario: usuarioRows[0]?.nombre,
      };

      io.to(`chat_${chat_id}`).emit("mensajeNuevo", mensaje);
    } catch (err) {
      console.error(err);
    }
  });
});


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});