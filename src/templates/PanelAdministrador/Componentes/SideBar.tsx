import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { obtenerRolesDeUsuarioAsync, type rolEnum } from "../Api/roles";

type rolesState = rolEnum[] | null

function checarSiTieneRol(userRolList: rolEnum[], rolListToCompare: rolEnum[]) {
    if (userRolList.includes('ADMINISTRADOR')) { return true }

    return userRolList.some(rol => rolListToCompare.includes(rol))
}

const SidebarButton = ({ to, icon, label, onClick }: any) => {
    const location = useLocation();
    const activo = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
            ${activo
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
        >
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
};

function Sidebar({ roles }: { roles: rolesState }) {
    const [abierta, setAbierta] = useState(false);

    return (
        <>
            <button
                onClick={() => setAbierta(true)}
                className="md:hidden fixed top-4 left-4 z-40 bg-[#1c1f21] p-2 rounded-lg border border-white/10"
            >
                ☰
            </button>

            {abierta && (
                <div
                    onClick={() => setAbierta(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
    fixed md:relative top-0 left-0 h-full md:h-auto
    w-64 bg-[#1a1d1f] border-r border-white/10 p-4 flex flex-col z-50
    transform transition-transform duration-300
    ${abierta ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
            >
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-400">Panel</h1>
                    <button
                        onClick={() => setAbierta(false)}
                        className="md:hidden text-white/60"
                    >
                        ✕
                    </button>
                </div>

                {roles ? <div className="flex flex-col gap-2">
                    {/* <SidebarButton to="/perfil" icon="👤" label="Mi perfil" onClick={() => setAbierta(false)} /> */}
                    {checarSiTieneRol(roles, ['EMPRESA','ADMINISTRADOREMPRESA']) ? <SidebarButton to="/cursosEmpresa" icon="🏢" label="Cursos empresa" onClick={() => setAbierta(false)} /> : null}

                    {checarSiTieneRol(roles, ['ADMINISTRADOREMPRESA']) ? <SidebarButton to="/panelAdminitradorCursos" icon="🛠️" label="Administrar cursos" onClick={() => setAbierta(false)} /> : null}
                    {checarSiTieneRol(roles, ['PROFESOR']) ? <SidebarButton to="/mis-cursos-profesor" icon="📖" label="Mis cursos (Profesor)" onClick={() => setAbierta(false)} /> : null}
                    {checarSiTieneRol(roles, ['ALUMNO']) ? <SidebarButton to="/mis-cursos-alumno" icon="📚" label="Mis cursos (Alumno)" onClick={() => setAbierta(false)} /> : null}
                    {checarSiTieneRol(roles, ['ALUMNO']) ? <SidebarButton to="/certificados" icon="🎓" label="Certificados" onClick={() => setAbierta(false)} /> : null}
               
                </div> : null}


                <div className="mt-auto text-xs text-white/30 text-center pt-6">
                    ConeXion process © 2026
                </div>
            </aside>
        </>
    );
}

export default function Layout() {
    const [roles, setRoles] = useState<rolesState>(null)

    useEffect(() => {
        (async () => {
            try {
                const rolesRes = await obtenerRolesDeUsuarioAsync()

                setRoles(rolesRes)

                console.log(rolesRes)
            } catch (e) {
                console.log(e)
            }
        })()
    },[])

    return (
        <div className="flex bg-[#131516] text-white min-h-screen">
            <Sidebar roles={roles} />

            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}

