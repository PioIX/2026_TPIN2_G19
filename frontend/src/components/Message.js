"use client";

export default function Message({ contenido, propio, autor, hora }) {
  return (
    <div>
      {propio ? (
        <strong>Vos: {contenido}</strong>
      ) : (
        <span>
          {autor}: {contenido}
        </span>
      )}
      {hora && <small> ({hora})</small>}
    </div>
  );
}