"use client"

export default function Login({username, mail, password, foto}) {
    return (
        <div>
            <h1>El nombre de usuario es {username}</h1>
            <h2>El mail es {mail}</h2>
            <h3>La contraseña es {password}</h3>
            <img src={foto} alt="Foto de perfil" />
        </div>
    );
}