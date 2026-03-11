import { useEffect, useState } from "react";
import { leerArchivo } from "../../../utility/excel";

type Cabecera = {
  nombre: string;
  opcion: string;
};

type DatosImportados<T> = {
  filas: Record<string, T>[];
  cabeceras: Cabecera[];
};

export function useExcelMapper<T>(
  onFinish: (data: T[]) => Promise<void>
) {
  const [datosImportados, setDatosImportados] = useState<DatosImportados<T> | null>(null);
  const [mapeo, setMapeo] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<T[] | null>(null);

  const cargarArchivo = async (file: File) => {
    const datos = await leerArchivo(file) as Record<string, any>[];
    if (!datos.length) return;

    setDatosImportados({
      filas: datos,
      cabeceras: Object.keys(datos[0]).map(k => ({
        nombre: k,
        opcion: k
      }))
    });
  };

  const construirResultado = (normalizador: (fila: Record<string, any>, mapeo: Record<string, string>) => T) => {
    if (!datosImportados) return;

    setResultado(
      datosImportados.filas.map(fila =>
        normalizador(fila, mapeo)
      )
    );
  };

  useEffect(() => {
    if (!resultado) return;

    (async () => {
      await onFinish(resultado);
      setDatosImportados(null);
      setMapeo({});
      setResultado(null);
    })();
  }, [resultado]);

  return {
    datosImportados,
    mapeo,
    setMapeo,
    cargarArchivo,
    construirResultado
  };
}
