"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatList from "../../components/ChatList";
import Message from "../../components/Message";
import Input from "../../components/Input";
import Button from "../../components/Button";
import NuevoChatModal from "../../components/NuevoChatModal";
import useSocket from "../../hooks/useSocket";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ChatsPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [chats, setChats] = useState([]);
  const [chatActivo, setChatActivo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [textoNuevo, setTextoNuevo] = useState("");
  const [modalAbierto, setModalAbierto] = useState(null);
  const { mensajes, setMensajes, enviarMensaje } = useSocket(
    chatActivo?.id,
    usuario?.id
  );

  useEffect(() => {
    const data = localStorage.getItem("pioChatUsuario");
    if (!data) {
      router.push("/");
      return;
    }
    setUsuario(JSON.parse(data));
  }, [router]);

  useEffect(() => {
    if (!usuario) return;
  }, [usuario]);

  async function cargarChats() {
    try {
      const res = await fetch(`${API_URL}/chats?usuario_id=${usuario.id}`);
      const data = await res.json();
      setChats(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function seleccionarChat(chat) {
    setChatActivo(chat);
    setMensajes([]);
    setHistorial([]);

    try {
      const res = await fetch(`${API_URL}/chats/${chat.id}/mensajes`);
      const data = await res.json();
      setHistorial(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleEnviar(e) {
    e.preventDefault();
    if (!textoNuevo.trim()) return;
    enviarMensaje(textoNuevo.trim());
    setTextoNuevo("");
  }

  function handleLogout() {
    localStorage.removeItem("pioChatUsuario");
    router.push("/");
  }

  if (!usuario) return null;

  const todosLosMensajes = [...historial, ...mensajes];

  return (
    <main>
      <header>
        <span>{usuario.nombre}</span>
        <button onClick={handleLogout}>Salir</button>
      </header>

      <div>
        <Button onClick={() => setModalAbierto("chat")}>+ Nuevo chat</Button>
        <Button onClick={() => setModalAbierto("grupo")}>+ Nuevo grupo</Button>
      </div>

      <ChatList
        chats={chats}
        chatActivoId={chatActivo?.id}
        onSeleccionar={seleccionarChat}
      />

      {chatActivo && (
        <section>
          <h2>{chatActivo.nombre_chat}</h2>

          <div>
            {todosLosMensajes.map((m) => (
              <Message
                key={m.id}
                contenido={m.contenido}
                propio={m.usuario_id === usuario.id}
                autor={m.nombre_usuario}
                hora={new Date(m.fecha_envio).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            ))}
          </div>

          <form onSubmit={handleEnviar}>
            <Input
              name="mensaje"
              value={textoNuevo}
              onChange={(e) => setTextoNuevo(e.target.value)}
              placeholder="Escribí un mensaje..."
            />
            <Button type="submit">Enviar</Button>
          </form>
        </section>
      )}

      {modalAbierto && (
        <NuevoChatModal
          tipo={modalAbierto}
          usuarioId={usuario.id}
          onCerrar={() => setModalAbierto(null)}
          onCreado={() => {
            setModalAbierto(null);
            cargarChats();
          }}
        />
      )}
    </main>
  );
}