"use client";

import styles from "./ChatItem.module.css";

const FOTO_POR_DEFECTO = "https://api.dicebear.com/7.x/initials/svg?seed=Chat";

export default function ChatItem({ chat, activo, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.item} ${activo ? styles.activo : ""}`}
    >
      <img
        src={chat.foto_url || FOTO_POR_DEFECTO}
        alt={chat.nombre_chat}
        className={styles.foto}
      />
      <div className={styles.info}>
        <span className={styles.nombre}>{chat.nombre_chat}</span>
        {chat.ultimo_mensaje && (
          <span className={styles.ultimoMensaje}>{chat.ultimo_mensaje}</span>
        )}
      </div>
    </button>
  );
}
