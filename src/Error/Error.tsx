import { useNavigate } from "react-router-dom";

interface ErrorPageProps {
    error?: Error;
}

export default function ErrorPage({ error }: ErrorPageProps) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#131516] text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-[#1c1f21] border border-white/10 rounded-2xl shadow-xl p-8 space-y-6 text-center">

                <h1 className="text-6xl font-extrabold text-red-400">
                    ⚠️
                </h1>

                <h2 className="text-2xl font-bold">
                    Algo salió mal
                </h2>

                <p className="text-slate-400">
                    Ocurrió un error inesperado en la aplicación.
                    {error?.message && (
                        <span className="block mt-2 text-sm text-slate-500">
                            {error.message}
                        </span>
                    )}
                </p>

                <div className="flex flex-col gap-y-3">
      
                    <button
                        onClick={() => navigate("/")}
                        className="w-full cursor-pointer bg-slate-600 hover:bg-slate-700 transition rounded-xl py-3 font-semibold"
                    >
                        Volver al inicio
                    </button>
                </div>

            </div>
        </div>
    );
}
