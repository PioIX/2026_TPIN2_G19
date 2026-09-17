"use client"

export default function Login({mail, password}) {
    return (
        <div>
            <h1>El mail es {mail}</h1>
            <h2>La contraseña es {password}</h2>
        </div>
    );
}