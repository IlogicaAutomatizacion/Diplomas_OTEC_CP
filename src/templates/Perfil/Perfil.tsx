import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { b2Url, b2UsuarioBucket } from "../../vars";
import {
  cambiarPasswordAsync,
  cerrarSesion,
  obtenerPerfilAutenticadoAsync,
  type perfilAutenticado,
} from "../PanelAdministrador/Api/auth";

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<perfilAutenticado | null>(null);
  const [mensaje, setMensaje] = useState<string | null>("Cargando perfil...");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await obtenerPerfilAutenticadoAsync();
        setPerfil(data);
        setMensaje(null);
      } catch (error: any) {
        setMensaje(error?.message ?? "No se pudo cargar el perfil.");
      }
    })();
  }, []);

  async function handleChangePassword() {
    if (guardando) return;

    if (!currentPassword.trim() || !newPassword.trim()) {
      setMensaje("Debes completar la contrasena actual y la nueva.");
      return;
    }

    setGuardando(true);

    try {
      const res = await cambiarPasswordAsync(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setMensaje(res.message);
    } catch (error: any) {
      setMensaje(error?.message ?? "No se pudo cambiar la contrasena.");
    } finally {
      setGuardando(false);
    }
  }

  const fotoPerfil = perfil?.usuario?.foto_perfil
    ? `https://${b2UsuarioBucket}.${b2Url}/${perfil.usuario.foto_perfil}`
    : null;

  return (
    <div className="min-h-screen w-full bg-[#131516] text-white flex justify-center p-6">
      <div className="w-full max-w-4xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-[#1c1f21] p-6 flex flex-col md:flex-row gap-6 md:items-center">
          <div className="shrink-0">
            {fotoPerfil ? (
              <img
                src={fotoPerfil}
                alt="Foto de perfil"
                className="h-28 w-28 rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="h-28 w-28 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-4xl text-blue-300">
                {perfil?.usuario?.nombre?.trim()?.slice(0, 1).toUpperCase() ?? "U"}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-blue-400">Perfil</h1>
            <p className="text-white/60 mt-1">Informacion de la cuenta autenticada.</p>

            <div className="grid md:grid-cols-2 gap-3 mt-5 text-sm">
              <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                <p className="text-white/40">Nombre</p>
                <p>{perfil?.usuario?.nombre ?? "Sin informacion"}</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                <p className="text-white/40">Correo</p>
                <p>{perfil?.cuenta?.correo ?? "Sin informacion"}</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                <p className="text-white/40">RUT</p>
                <p>{perfil?.usuario?.rut ?? "Sin informacion"}</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                <p className="text-white/40">Telefono</p>
                <p>{perfil?.usuario?.fono_fax ?? "Sin informacion"}</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 p-3 md:col-span-2">
                <p className="text-white/40">Roles</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {perfil?.roles?.length ? perfil.roles.map((rol) => (
                    <span key={rol} className="rounded-lg bg-blue-500/15 px-2.5 py-1 text-blue-300 border border-blue-500/20">
                      {rol}
                    </span>
                  )) : <span>Sin roles</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#1c1f21] p-6 space-y-4">

          <h2 className="text-2xl font-semibold">Seguridad</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Contrasena actual"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contrasena"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleChangePassword}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-3 font-semibold cursor-pointer"
            >
              {guardando ? "Guardando..." : "Cambiar contrasena"}
            </button>

            <button
              onClick={cerrarSesion}
              className="rounded-xl bg-white/10 hover:bg-white/15 px-5 py-3 font-semibold cursor-pointer"
            >
              Cerrar sesion
            </button>
          </div>

          <p className="text-sm text-white/60">
            <Link to="/forgot-password" className="text-blue-400 hover:underline">
              Olvide mi contrasena
            </Link>
          </p>

          {mensaje ? <p className="text-sm text-white/70">{mensaje}</p> : null}
        </div>
      </div>
    </div>
  );
}
