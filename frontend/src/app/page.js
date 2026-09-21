"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/Button";
import Input from "../components/Input";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState("login");
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contraseña: "",
    foto_url: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const path = modo === "login" ? "/login" : "/register";
      const body =
        modo === "login"
          ? { correo: form.correo, contraseña: form.contraseña }
          : form;

      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Ocurrió un error inesperado");
      }

      localStorage.setItem("pioChatUsuario", JSON.stringify(data));
      router.push("/chats");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main>
      <h1>Pio Chat</h1>
      <p>
        {modo === "login"
          ? "Ingresá con tu cuenta"
          : "Creá tu cuenta para empezar a chatear"}
      </p>

      <form onSubmit={handleSubmit}>
        {modo === "registro" && (
          <Input
            label="Nombre de usuario"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="agustinp"
            required
          />
        )}

        <Input
          label="Correo"
          type="email"
          name="correo"
          value={form.correo}
          onChange={handleChange}
          placeholder="tu@pioix.edu.ar"
          required
        />

        <Input
          label="Contraseña"
          type="password"
          name="contraseña"
          value={form.contraseña}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />

        {modo === "registro" && (
          <Input
            label="URL de tu foto (opcional)"
            name="foto_url"
            value={form.foto_url}
            onChange={handleChange}
            placeholder="https://..."
          />
        )}

        {error && <p>{error}</p>}

        <Button type="submit" disabled={cargando}>
          {cargando
            ? "Un momento..."
            : modo === "login"
            ? "Ingresar"
            : "Registrarme"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => {
          setError("");
          setModo(modo === "login" ? "registro" : "login");
        }}
      >
        {modo === "login"
          ? "¿No tenés cuenta? Registrate"
          : "¿Ya tenés cuenta? Ingresá"}
      </button>
    </main>
  );
}