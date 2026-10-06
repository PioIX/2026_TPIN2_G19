"use client";

import styles from "./Message.module.css";

export default function Message({ contenido, propio, autor, hora }) {
  return (
    <div className={`${styles.fila} ${propio ? styles.propia : styles.recibida}`}>
      <div className={styles.burbuja}>
        {!propio && autor && <span className={styles.autor}>{autor}</span>}
        <p className={styles.contenido}>{contenido}</p>
        {hora && <span className={styles.hora}>{hora}</span>}
      </div>
    </div>
  );
}
