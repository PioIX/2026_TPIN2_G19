"use client";

const FOTO_POR_DEFECTO = "https://api.dicebear.com/7.x/initials/svg?seed=Chat";

export default function ChatItem({ chat, activo, onClick }) {
  return (
    <div onClick={onClick}>
      <img
        src={chat.foto_url || FOTO_POR_DEFECTO}
        alt={chat.nombre_chat}
        width="40"
        height="40"
      />
      <span>
        {activo ? "> " : ""}
        {chat.nombre_chat}
      </span>
    </div>
  );
}