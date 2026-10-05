"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function useSocket(chatId, usuarioId) {
  const socketRef = useRef(null);
  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {
    if (!chatId || !usuarioId) return;

    const socket = io(API_URL);
    socketRef.current = socket;

    socket.emit("unirseAChat", chatId);

    socket.on("mensajeNuevo", (mensaje) => {
      if (mensaje.chat_id === chatId) {
        setMensajes((prev) => [...prev, mensaje]);
      }
    });

    return () => {
      socket.emit("salirDeChat", chatId);
      socket.disconnect();
    };
  }, [chatId, usuarioId]);

  function enviarMensaje(contenido) {
    if (!socketRef.current) return;
    socketRef.current.emit("enviarMensaje", {
      chat_id: chatId,
      usuario_id: usuarioId,
      contenido,
    });
  }

  return { mensajes, setMensajes, enviarMensaje };
}