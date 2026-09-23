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