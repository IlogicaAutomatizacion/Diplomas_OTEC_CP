/**
 * LoginPage: puerta de entrada de la plataforma OTEC (ConeXion Process).
 *
 * La vista es solo fachada: toda la autenticacion sigue siendo un POST a
 * `${backend}/auth/login` que guarda el access_token en localStorage y navega
 * a '/'. El interceptor de window.fetch definido en main.tsx trata /auth/login
 * como ruta publica, por lo que aqui no se adjunta Authorization.
 *
 * Layout: dos columnas en escritorio (presentacion de marca + formulario) que
 * colapsan a una sola columna en movil, donde la columna de marca se reduce a
 * logo y titulo para que el formulario quede sobre el pliegue.
 */
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AcademicCapIcon,
  ArrowRightIcon,
  DocumentCheckIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import { backend } from "../../vars";
import logoConexion from "../../assets/CP/CxPLogo.png";

const DESTACADOS = [
  {
    icono: AcademicCapIcon,
    titulo: "Tus cursos",
    detalle: "Avanza en tus capacitaciones desde cualquier dispositivo.",
  },
  {
    icono: DocumentCheckIcon,
    titulo: "Certificados",
    detalle: "Descarga y verifica tus certificados cuando los necesites.",
  },
  {
    icono: ShieldCheckIcon,
    titulo: "Acceso seguro",
    detalle: "Tu sesion viaja cifrada y se cierra sola si caduca.",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
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
    }, 5000);

    return () => clearTimeout(timer);
  }, [mensaje]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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

  const cargando = clickeado || token;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f1113] text-white">
      <div className="auth-aurora pointer-events-none absolute inset-0" />
      <div className="auth-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10 sm:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Columna de marca */}
          <section className="auth-rise flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="relative">
              <div className="absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.28),transparent_70%)] blur-xl" />
              <img
                src={logoConexion}
                alt="ConeXion Process"
                className="relative w-32 rounded-2xl bg-white p-2 shadow-[0_18px_40px_rgba(0,0,0,0.45)] sm:w-36"
              />
            </div>

            <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-300">
              SAPA OTEC
            </span>

            <h1 className="auth-gradient-text mt-5 max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">
              Bienvenido de vuelta
            </h1>

            <p className="mt-4 max-w-md text-base leading-7 text-white/60">
              Ingresa con tu correo para retomar tus cursos, revisar tus
              certificados y continuar donde lo dejaste.
            </p>

            <ul className="mt-9 hidden w-full max-w-md space-y-4 lg:block">
              {DESTACADOS.map(({ icono: Icono, titulo, detalle }) => (
                <li key={titulo} className="flex items-start gap-4">
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blue-300">
                    <Icono className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white/90">
                      {titulo}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-white/50">
                      {detalle}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Columna del formulario */}
          <section className="auth-rise w-full justify-self-center [animation-delay:120ms] lg:justify-self-end">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#16191b]/90 p-7 shadow-[0_30px_70px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:p-9">
              <h2 className="text-2xl font-bold">Iniciar sesion</h2>
              <p className="mt-2 text-sm text-white/50">
                Usa el correo con el que activaste tu cuenta.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Correo
                  </span>
                  <div className="group relative">
                    <EnvelopeIcon
                      className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/30 transition group-focus-within:text-blue-400"
                      aria-hidden="true"
                    />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="tu@correo.cl"
                      className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-12 pr-4 text-base outline-none transition placeholder:text-white/25 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/40"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Contraseña
                  </span>
                  <div className="group relative">
                    <LockClosedIcon
                      className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/30 transition group-focus-within:text-blue-400"
                      aria-hidden="true"
                    />
                    <input
                      type={verPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-12 pr-12 text-base outline-none transition placeholder:text-white/25 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/40"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setVerPassword((valor) => !valor)}
                      aria-label={
                        verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/35 transition hover:bg-white/5 hover:text-white/70"
                    >
                      {verPassword ? (
                        <EyeSlashIcon className="size-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="size-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </label>

                {mensaje ? (
                  <p
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
                  >
                    <ExclamationCircleIcon
                      className="mt-0.5 size-5 shrink-0"
                      aria-hidden="true"
                    />
                    {mensaje}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={cargando || !email || !password}
                  className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
                >
                  {cargando ? "Entrando..." : "Entrar"}
                  {cargando ? null : (
                    <ArrowRightIcon
                      className="size-5 transition group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/30">
                  ¿Necesitas ayuda?
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="space-y-3 text-center text-sm text-white/50">
                <p>
                  ¿No has activado tu cuenta?{" "}
                  <Link
                    to="/activar-cuenta"
                    className="font-semibold text-blue-400 underline-offset-4 transition hover:text-blue-300 hover:underline"
                  >
                    Actívala aquí
                  </Link>
                </p>
                <p>
                  <Link
                    to="/forgot-password"
                    className="text-white/50 underline-offset-4 transition hover:text-white hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-white/25">
              ConeXion Process · Plataforma de capacitación OTEC
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
