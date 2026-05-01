import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { backend } from "../../vars";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState<string | null>();
  const [clickeado, setClickeado] = useState(false);
  const [token, setToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!mensaje) {
      return;
    }

    const timer = setTimeout(() => {
      setMensaje(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [mensaje]);

  async function handleSubmit() {
    if (token || clickeado || !password || !email) {
      return;
    }

    setClickeado(true);

    try {
      const res = await fetch(`${backend}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: email,
          password: password,
        }),
      });

      if (!res.ok) {
        const resE = await res.json();
        throw new Error(resE?.message ?? "Hubo un problema al iniciar sesion.");
      }

      const { access_token } = await res.json();

      if (!access_token) {
        return;
      }

      localStorage.setItem("token", access_token);
      setToken(true);
      navigate("/");
    } catch (e: any) {
      setMensaje(e?.message || "Hubo un problema al iniciar sesion.");
    } finally {
      setClickeado(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#131516] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1c1f21] border border-white/10 rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">Iniciar sesion</h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Correo electronico"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contrasena"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {mensaje ? (
          <p>{mensaje}</p>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 font-semibold"
          >
            Entrar
          </button>
        )}

        <p className="text-center text-white/50 text-sm">
          ¿No has activado tu cuenta?{" "}
          <Link to="/activar-cuenta" className="cursor-pointer text-blue-400 hover:underline">
            Haz click aqui
          </Link>
        </p>

        <p className="text-center text-white/50 text-sm">
          <Link to="/forgot-password" className="cursor-pointer text-blue-400 hover:underline">
            ¿Olvidaste tu contrasena?
          </Link>
        </p>
      </div>
    </div>
  );
}
