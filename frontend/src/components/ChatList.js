"use client";

import ChatItem from "./ChatItem";

export default function ChatList({ chats, chatActivoId, onSeleccionar }) {
  if (chats.length === 0) {
    return <p>Todavía no tenés chats. Creá uno nuevo para empezar.</p>;
  }

  return (
    <div>
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