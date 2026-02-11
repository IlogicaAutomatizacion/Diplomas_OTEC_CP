import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#131516] text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-[#1c1f21] border border-white/10 rounded-2xl shadow-xl p-8 space-y-6 text-center">

                <h1 className="text-6xl font-extrabold text-blue-400">
                    404
                </h1>

                <h2 className="text-2xl font-bold">
                    Página no encontrada
                </h2>

                <p className="text-slate-400">
                    La página que estás buscando no existe o fue movida.
                </p>

                <button
                    onClick={() => navigate("/login")}
                    className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 font-semibold"
                >
                    Volver al inicio
                </button>

            </div>
        </div>
    );
}
