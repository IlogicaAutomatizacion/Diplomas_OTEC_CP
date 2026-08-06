import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import {
    AcademicCapIcon,
    BuildingOffice2Icon,
    DocumentCheckIcon,
    PresentationChartBarIcon,
    ShieldCheckIcon,
    Squares2X2Icon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";

import { obtenerRolesDeUsuarioAsync, type rolEnum } from "../Api/roles";

type RolesState = rolEnum[] | null

// Cada entrada del menu se identifica con un icono de Heroicons en lugar de la
// inicial de su nombre: el icono se lee de un vistazo y no colisiona cuando dos
// secciones empiezan con la misma letra (Cursos empresa / Certificados).
type SidebarIcon = ComponentType<SVGProps<SVGSVGElement>>

function checarSiTieneRol(userRolList: rolEnum[], rolListToCompare: rolEnum[]) {
    if (userRolList.includes('ADMINISTRADOR')) {
        return true
    }

    return userRolList.some((rol) => rolListToCompare.includes(rol))
}

const SidebarButton = ({
    to,
    icon: Icono,
    label,
    onClick,
}: {
    to: string,
    icon: SidebarIcon,
    label: string,
    onClick: () => void
}) => {
    const location = useLocation()
    const activo = location.pathname === to

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activo
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
        >
            <Icono
                className={`size-5 shrink-0 transition ${
                    activo ? "text-blue-400" : "text-white/50 group-hover:text-white"
                }`}
                aria-hidden="true"
            />
            <span className="text-sm font-medium">{label}</span>
        </Link>
    )
}

function Sidebar({ roles }: { roles: RolesState }) {
    const [abierta, setAbierta] = useState(false)

    return (
        <>
            <button
                onClick={() => setAbierta(true)}
                className="md:hidden fixed top-4 left-4 z-40 bg-[#1c1f21] p-2 rounded-lg border border-white/10"
            >
                Menu
            </button>

            {abierta ? (
                <div
                    onClick={() => setAbierta(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                />
            ) : null}

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
                        Cerrar
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    {roles ? (
                        <>
                        {checarSiTieneRol(roles, ['ADMINISTRADOR']) ? (
                            <SidebarButton
                                to="/panelAdministradores"
                                icon={ShieldCheckIcon}
                                label="Administradores"
                                onClick={() => setAbierta(false)}
                            />
                        ) : null}

                        {checarSiTieneRol(roles, ['EMPRESA', 'ADMINISTRADOREMPRESA']) ? (
                            <SidebarButton
                                to="/cursosEmpresa"
                                icon={BuildingOffice2Icon}
                                label="Cursos empresa"
                                onClick={() => setAbierta(false)}
                            />
                        ) : null}

                        {checarSiTieneRol(roles, ['ADMINISTRADOREMPRESA']) ? (
                            <SidebarButton
                                to="/panelAdminitradorCursos"
                                icon={Squares2X2Icon}
                                label="Administración de OTEC"
                                onClick={() => setAbierta(false)}
                            />
                        ) : null}

                        {checarSiTieneRol(roles, ['PROFESOR']) ? (
                            <SidebarButton
                                to="/mis-cursos-profesor"
                                icon={PresentationChartBarIcon}
                                label="Mis cursos (Profesor)"
                                onClick={() => setAbierta(false)}
                            />
                        ) : null}

                        {checarSiTieneRol(roles, ['ALUMNO']) ? (
                            <SidebarButton
                                to="/mis-cursos-alumno"
                                icon={AcademicCapIcon}
                                label="Mis cursos (Alumno)"
                                onClick={() => setAbierta(false)}
                            />
                        ) : null}

                        {checarSiTieneRol(roles, ['ALUMNO']) ? (
                            <SidebarButton
                                to="/certificados"
                                icon={DocumentCheckIcon}
                                label="Certificados"
                                onClick={() => setAbierta(false)}
                            />
                        ) : null}
                        </>
                    ) : null}

                    <SidebarButton
                        to="/perfil"
                        icon={UserCircleIcon}
                        label="Perfil"
                        onClick={() => setAbierta(false)}
                    />
                </div>

                <div className="mt-auto text-xs text-white/30 text-center pt-6">
                    ConeXion process 2026
                </div>
            </aside>
        </>
    )
}

export default function Layout() {
    const [roles, setRoles] = useState<RolesState>(null)

    if (!localStorage.getItem('token')) {
        return <Navigate to="/login" replace />
    }

    useEffect(() => {
        ; (async () => {
            try {
                const rolesRes = await obtenerRolesDeUsuarioAsync()
                setRoles(rolesRes)
            } catch (e) {
                console.log(e)
            }
        })()
    }, [])

    return (
        <div className="flex bg-[#131516] text-white min-h-screen">
            <Sidebar roles={roles} />

            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    )
}
