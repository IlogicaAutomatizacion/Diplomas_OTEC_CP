import { useEffect } from "react";

interface ErrorPopoutProps {
    mensaje: string | null;
    onClose: () => void;
}

export default function ErrorPopout({ mensaje, onClose }: ErrorPopoutProps) {

    // cerrar con ESC (extra nice)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            className="
        fixed inset-0 z-50
        bg-black/60 backdrop-blur-sm
        flex items-center justify-center
        animate-fadeIn
      "
        >
            {/* card */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="
          w-[90%] max-w-md
          bg-[#1c1f21]
          border border-white/10
          rounded-2xl
          shadow-2xl
          p-6
          text-white
          space-y-4
          animate-scaleIn
        "
            >
                <h2 className="text-2xl font-bold text-red-400 text-center">
                    Ocurrió un error
                </h2>

                <p className="text-center text-slate-300 break-words">
                    {mensaje}
                </p>

                <button
                    onClick={onClose}
                    className="
            w-full mt-4
            bg-red-500 hover:bg-red-600
            transition
            py-2 rounded-xl
            font-semibold
            cursor-pointer
          "
                >
                    Entendido
                </button>
            </div>
        </div>
    );
}
