import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { b2Url, b2UsuarioBucket } from "../../vars";
import type { usuario } from "../PanelAdministrador/Api/usuarios";
import {
  cambiarPasswordAsync,
  cerrarSesion,
  eliminarFirmaPerfilPropiaAsync,
  eliminarFotoPerfilPropiaAsync,
  obtenerPerfilAutenticadoAsync,
  subirFirmaPerfilPropiaAsync,
  subirFotoPerfilPropiaAsync,
  type perfilAutenticado,
} from "../PanelAdministrador/Api/auth";

type ArchivoPerfil = "foto_perfil" | "firma";

function assetUrl(key: string | null | undefined, version: number) {
  return key ? `https://${b2UsuarioBucket}.${b2Url}/${key}?t=${version}` : null;
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<perfilAutenticado | null>(null);
  const [mensaje, setMensaje] = useState<string | null>("Cargando perfil...");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [assetVersion, setAssetVersion] = useState(() => Date.now());

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

  function actualizarPerfilLocal(usuarioId: number, cambios: Partial<usuario>) {
    setPerfil(prev => {
      if (!prev) return prev;

      const perfiles = prev.perfiles.map(perfilUsuario =>
        perfilUsuario.id === usuarioId ? { ...perfilUsuario, ...cambios } : perfilUsuario
      );

      return {
        ...prev,
        perfiles,
        usuario: prev.usuario?.id === usuarioId ? { ...prev.usuario, ...cambios } : prev.usuario,
      };
    });
    setAssetVersion(Date.now());
  }

  async function handleChangePassword() {
    if (guardando) return;

    if (!currentPassword.trim() || !newPassword.trim()) {
      setMensaje("Debes completar la contraseña actual y la nueva.");
      return;
    }

    setGuardando(true);

    try {
      const res = await cambiarPasswordAsync(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setMensaje(res.message);
    } catch (error: any) {
      setMensaje(error?.message ?? "No se pudo cambiar la contraseña.");
    } finally {
      setGuardando(false);
    }
  }

  async function subirArchivo(usuarioId: number | undefined, file: File | undefined, tipo: ArchivoPerfil) {
    if (!usuarioId || !file) return;

    const uploadKey = `${usuarioId}-${tipo}`;
    setSubiendo(uploadKey);
    setMensaje(null);

    try {
      const result = tipo === "foto_perfil"
        ? await subirFotoPerfilPropiaAsync(usuarioId, file)
        : await subirFirmaPerfilPropiaAsync(usuarioId, file);

      actualizarPerfilLocal(usuarioId, result);
      setMensaje(tipo === "foto_perfil" ? "Foto actualizada correctamente." : "Firma actualizada correctamente.");
    } catch (error: any) {
      setMensaje(error?.message ?? "No se pudo actualizar el archivo.");
    } finally {
      setSubiendo(null);
    }
  }

  async function eliminarArchivo(usuarioId: number | undefined, tipo: ArchivoPerfil) {
    if (!usuarioId) return;

    const uploadKey = `${usuarioId}-${tipo}`;
    setSubiendo(uploadKey);
    setMensaje(null);

    try {
      if (tipo === "foto_perfil") {
        await eliminarFotoPerfilPropiaAsync(usuarioId);
        actualizarPerfilLocal(usuarioId, { foto_perfil: null });
        setMensaje("Foto eliminada correctamente.");
      } else {
        await eliminarFirmaPerfilPropiaAsync(usuarioId);
        actualizarPerfilLocal(usuarioId, { firma: null });
        setMensaje("Firma eliminada correctamente.");
      }
    } catch (error: any) {
      setMensaje(error?.message ?? "No se pudo eliminar el archivo.");
    } finally {
      setSubiendo(null);
    }
  }

  const perfiles = perfil?.perfiles ?? [];

  return (
    <div className="min-h-screen w-full bg-[#131516] text-white flex justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-[#1c1f21] p-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-blue-400">Perfil</h1>
            <p className="text-white/60">Perfiles vinculados</p>
          </div>

          <div className="mt-6 grid gap-4">
            {perfiles.length ? perfiles.map((perfilUsuario) => {
              const fotoPerfil = assetUrl(perfilUsuario.foto_perfil, assetVersion);
              const firma = assetUrl(perfilUsuario.firma, assetVersion);
              const roles = perfilUsuario.rolesVinculados ?? [];
              const telefono = perfilUsuario.fono_fax ?? perfilUsuario.telefono;
              const suscripciones = perfilUsuario.suscripcionesVinculadas ?? [];

              return (
                <article
                  key={perfilUsuario.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex flex-col lg:flex-row gap-5">
                    <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:w-44">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-white/40">Foto</p>
                        {fotoPerfil ? (
                          <img
                            src={fotoPerfil}
                            alt="Foto de perfil"
                            className="h-28 w-28 rounded-xl object-cover border border-white/10"
                          />
                        ) : (
                          <div className="h-28 w-28 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-4xl text-blue-300">
                            {perfilUsuario.nombre?.trim()?.slice(0, 1).toUpperCase() ?? "U"}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <label className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold cursor-pointer">
                            {subiendo === `${perfilUsuario.id}-foto_perfil` ? "Subiendo..." : "Cambiar"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={Boolean(subiendo)}
                              onChange={(e) => subirArchivo(perfilUsuario.id, e.target.files?.[0], "foto_perfil")}
                            />
                          </label>
                          {fotoPerfil ? (
                            <button
                              onClick={() => eliminarArchivo(perfilUsuario.id, "foto_perfil")}
                              disabled={Boolean(subiendo)}
                              className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-white/40">Firma</p>
                        {firma ? (
                          <img
                            src={firma}
                            alt="Firma"
                            className="h-20 w-36 rounded-xl object-contain bg-white border border-white/10 p-2"
                          />
                        ) : (
                          <div className="h-20 w-36 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm text-white/40">
                            Sin firma
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <label className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold cursor-pointer">
                            {subiendo === `${perfilUsuario.id}-firma` ? "Subiendo..." : "Cambiar"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={Boolean(subiendo)}
                              onChange={(e) => subirArchivo(perfilUsuario.id, e.target.files?.[0], "firma")}
                            />
                          </label>
                          {firma ? (
                            <button
                              onClick={() => eliminarArchivo(perfilUsuario.id, "firma")}
                              disabled={Boolean(subiendo)}
                              className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <Info label="Nombre" value={perfilUsuario.nombre} />
                        <Info label="Correo" value={perfilUsuario.correo ?? perfil?.cuenta?.correo} />
                        <Info label="RUT" value={perfilUsuario.rut} />
                        <Info label="Telefono" value={telefono} />
                        <Info label="Direccion" value={perfilUsuario.direccion} />
                        <Info label="Especialidad" value={perfilUsuario.especialidad} />
                        <Info label="ID perfil" value={perfilUsuario.id ? `#${perfilUsuario.id}` : null} />
                        <Info
                          label="Suscripcion"
                          value={suscripciones.map(s => s.nombre_empresa ?? `Suscriptor #${s.suscriptor_id}`).join(", ")}
                        />
                      </div>

                      <div className="mt-4 rounded-xl bg-black/20 border border-white/10 p-3">
                        <p className="text-white/40 text-sm">Roles</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {roles.length ? roles.map((rol) => (
                            <span key={rol} className="rounded-lg bg-blue-500/15 px-2.5 py-1 text-blue-300 border border-blue-500/20 text-sm">
                              {rol}
                            </span>
                          )) : <span className="text-sm">Sin roles</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }) : (
              <div className="rounded-xl bg-black/20 border border-white/10 p-4 text-white/60">
                No se encontraron perfiles vinculados para esta cuenta.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#1c1f21] p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Seguridad</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Contraseña actual"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleChangePassword}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-3 font-semibold cursor-pointer"
            >
              {guardando ? "Guardando..." : "Cambiar contraseña"}
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
              Olvide mi contraseña
            </Link>
          </p>

          {mensaje ? <p className="text-sm text-white/70">{mensaje}</p> : null}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string, value?: string | number | null }) {
  return (
    <div className="rounded-xl bg-black/20 border border-white/10 p-3">
      <p className="text-white/40">{label}</p>
      <p className="break-words">{value || "Sin informacion"}</p>
    </div>
  );
}
