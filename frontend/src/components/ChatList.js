"use client";

import ChatItem from "./ChatItem";
import styles from "./ChatList.module.css";

export default function ChatList({ chats, chatActivoId, onSeleccionar }) {
  if (chats.length === 0) {
    return (
      <p className={styles.vacio}>
        Todavía no tenés chats. Creá uno nuevo para empezar.
      </p>
    );
  }

  return (
    <div className={styles.lista}>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          activo={chat.id === chatActivoId}
          onClick={() => onSeleccionar(chat)}
        />
      ))}
    </div>
  );
}
