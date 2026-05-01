import { useEffect, useState } from "react";
import { obtenerPerfilAutenticadoAsync, type perfilAutenticado } from "../PanelAdministrador/Api/auth";

export default function InicioPage() {
  const [perfil, setPerfil] = useState<perfilAutenticado | null>(null);

  useEffect(() => {
    obtenerPerfilAutenticadoAsync()
      .then(setPerfil)
      .catch(() => null);
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,#2563eb33,transparent_55%),#1c1f21] p-10 text-center shadow-2xl">
        <p className="text-white/50 uppercase tracking-[0.3em] text-xs">ConeXion Process</p>
        <h1 className="mt-4 text-5xl font-bold text-white">
          Bienvenido{perfil?.usuario?.nombre ? `, ${perfil.usuario.nombre}` : ""}
        </h1>
        <p className="mt-5 text-lg text-white/65">
          Ya tienes la sesion iniciada. Usa la barra lateral para entrar a tus paneles, revisar tu perfil o continuar con tu trabajo.
        </p>
      </div>
    </div>
  );
}
