import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { backend } from "../../vars";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!mensaje || enviado) return;

    const timer = setTimeout(() => setMensaje(null), 2500);
    return () => clearTimeout(timer);
  }, [mensaje, enviado]);

  async function handleSubmit() {
    if (cargando || !email.trim()) {
      setMensaje("El correo es obligatorio.");
      return;
    }

    setCargando(true);

    try {
      const res = await fetch(`${backend}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: email.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message ?? "No se pudo enviar el correo de recuperacion.");
      }

      setEnviado(true);
      setMensaje(data?.message ?? "Si el correo esta registrado, recibiras un enlace.");
    } catch (error: any) {
      setMensaje(error?.message ?? "No se pudo enviar el correo de recuperacion.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#131516] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1c1f21] border border-white/10 rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-400">Recuperar contrasena</h1>

        <p className="text-sm text-white/60 text-center">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contrasena.
        </p>

        <input
          type="email"
          placeholder="Correo electronico"
          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {mensaje ? (
          <p className={`text-center ${enviado ? "text-blue-400" : "text-red-400"}`}>{mensaje}</p>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 font-semibold"
          >
            {cargando ? "Enviando..." : "Enviar enlace"}
          </button>
        )}

        <p className="text-center text-white/50 text-sm">
          <Link to="/login" className="text-blue-400 hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
}
