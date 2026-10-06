"use client";

import { useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import Input from "./Input";
import Button from "./Button";
import styles from "./NuevoChatModal.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function NuevoChatModal({ tipo, usuarioId, onCerrar, onCreado }) {
  const esGrupo = tipo === "grupo";
  const [correo, setCorreo] = useState("");
  const [correos, setCorreos] = useState("");
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [fotoGrupo, setFotoGrupo] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const path = esGrupo ? "/chats/grupo" : "/chats";
      const body = esGrupo
        ? {
            usuario_id: usuarioId,
            nombre_chat: nombreGrupo,
            foto_url: fotoGrupo,
            correos: correos
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean),
          }
        : { usuario_id: usuarioId, correo_contacto: correo };

      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Ocurrió un error inesperado");
      }

      onCreado();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Popup open modal nested onClose={onCerrar}>
      <div className={styles.modal}>
        <h2 className={styles.titulo}>
          {esGrupo ? "Crear grupo nuevo" : "Iniciar chat nuevo"}
        </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {esGrupo ? (
            <>
              <Input
                label="Nombre del grupo"
                name="nombreGrupo"
                value={nombreGrupo}
                onChange={(e) => setNombreGrupo(e.target.value)}
                required
              />
              <Input
                label="Foto del grupo (URL, opcional)"
                name="fotoGrupo"
                value={fotoGrupo}
                onChange={(e) => setFotoGrupo(e.target.value)}
              />
              <Input
                label="Correos separados por coma"
                name="correos"
                value={correos}
                onChange={(e) => setCorreos(e.target.value)}
                placeholder="a@pioix.edu.ar, b@pioix.edu.ar"
                required
              />
            </>
          ) : (
            <Input
              label="Correo del contacto"
              name="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.acciones}>
            <Button variant="secondary" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cargando}>
              {cargando ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </Popup>
  );
}
