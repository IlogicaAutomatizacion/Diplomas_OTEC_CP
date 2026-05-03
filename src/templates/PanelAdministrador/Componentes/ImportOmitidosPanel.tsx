import { useEffect, useState } from "react";
import type { ImportOmitido } from "./importReport";

export default function ImportOmitidosPanel({ omitidos }: { omitidos: ImportOmitido[] }) {
    const [cerrado, setCerrado] = useState(false);

    useEffect(() => {
        setCerrado(false);
    }, [omitidos]);

    if (cerrado || !omitidos.length) return null;

    return (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-amber-200">Elementos ignorados</p>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-200/70">{omitidos.length}</span>
                    <button
                        type="button"
                        onClick={() => setCerrado(true)}
                        className="rounded-md px-2 py-1 text-xs font-semibold text-amber-200/80 transition hover:bg-amber-500/10 hover:text-amber-100"
                        aria-label="Cerrar reporte de elementos ignorados"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
            <div className="mt-3 max-h-52 overflow-auto rounded-lg border border-amber-500/20">
                {omitidos.map((omitido, index) => (
                    <div key={`${omitido.etiqueta}-${index}`} className="grid gap-1 border-b border-amber-500/10 px-3 py-2 last:border-b-0">
                        <span className="text-sm text-amber-100">{omitido.etiqueta}</span>
                        <span className="text-xs text-amber-100/70">{omitido.motivo}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
