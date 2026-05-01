import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { backend } from "../../vars";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  useEffect(() => {
    if (!guardado) return;

    const timer = setTimeout(() => navigate("/login"), 1800);
    return () => clearTimeout(timer);
  }, [guardado, navigate]);

  async function handleSubmit() {
    if (cargando) return;

    if (!token) {
      setMensaje("El enlace de recuperacion es invalido.");
      return;
    }

    if (!password.trim()) {
      setMensaje("La nueva contrasena es obligatoria.");
      return;
    }

    setCargando(true);

    try {
      const res = await fetch(`${backend}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resetToken: token,
          password: password.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message ?? "No se pudo restablecer la contrasena.");
      }

      setGuardado(true);
      setMensaje(data?.message ?? "Contrasena actualizada correctamente.");
    } catch (error: any) {
      setMensaje(error?.message ?? "No se pudo restablecer la contrasena.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#131516] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1c1f21] border border-white/10 rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-400">Nueva contrasena</h1>

        <p className="text-sm text-white/60 text-center">
          Escribe la nueva contrasena que quieres usar para tu cuenta.
        </p>

        <input
          type="password"
          placeholder="Nueva contrasena"
          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mensaje ? (
          <p className={`text-center ${guardado ? "text-blue-400" : "text-red-400"}`}>{mensaje}</p>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 font-semibold"
          >
            {cargando ? "Guardando..." : "Cambiar contrasena"}
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
