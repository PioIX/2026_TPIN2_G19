"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatList from "../../components/ChatList";
import Message from "../../components/Message";
import Input from "../../components/Input";
import Button from "../../components/Button";
import NuevoChatModal from "../../components/NuevoChatModal";
import useSocket from "../../hooks/useSocket";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const FOTO_POR_DEFECTO = "https://api.dicebear.com/7.x/initials/svg?seed=Chat";

export default function ChatsPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [chats, setChats] = useState([]);
  const [chatActivo, setChatActivo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [textoNuevo, setTextoNuevo] = useState("");
  const [modalAbierto, setModalAbierto] = useState(null); // "chat" | "grupo" | null

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
    cargarChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <main className={styles.main}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.nombreUsuario}>{usuario.nombre}</span>
          <button className={styles.logout} onClick={handleLogout}>
            Salir
          </button>
        </div>

        <div className={styles.accionesNuevo}>
          <Button variant="secondary" onClick={() => setModalAbierto("chat")}>
            + Nuevo chat
          </Button>
          <Button variant="secondary" onClick={() => setModalAbierto("grupo")}>
            + Nuevo grupo
          </Button>
        </div>

        <ChatList
          chats={chats}
          chatActivoId={chatActivo?.id}
          onSeleccionar={seleccionarChat}
        />
      </aside>

      <section className={styles.panel}>
        {!chatActivo ? (
          <div className={styles.sinChat}>
            Elegí un chat para empezar a conversar.
          </div>
        ) : (
          <>
            <header className={styles.panelHeader}>
              <img
                src={chatActivo.foto_url || FOTO_POR_DEFECTO}
                alt={chatActivo.nombre_chat}
                className={styles.panelFoto}
              />
              <span className={styles.panelNombre}>
                {chatActivo.nombre_chat}
              </span>
            </header>

            <div className={styles.mensajes}>
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

            <form className={styles.formEnvio} onSubmit={handleEnviar}>
              <Input
                name="mensaje"
                value={textoNuevo}
                onChange={(e) => setTextoNuevo(e.target.value)}
                placeholder="Escribí un mensaje..."
              />
              <Button type="submit">Enviar</Button>
            </form>
          </>
        )}
      </section>

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
