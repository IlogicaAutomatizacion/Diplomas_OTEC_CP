import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { backend } from "../../vars";

export default function ConfirmarActivacionPage() {

  const [mensaje, setMensaje] = useState<string | null>('Cargando...')
  const [validado, setValidado] = useState<boolean>(false)
  const navigate = useNavigate();

  const [params] = useSearchParams();

  const rawToken = params.get('token');

  async function handleSubmit() {
    if (!rawToken) { return }

    try {
      const res = await fetch(`${backend}/auth/confirmar-activacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activationToken: rawToken,
        })

      })

      if (res.ok) {
        setValidado(true)
        setMensaje("Tu cuenta ha sido validada correctamente.")

      } else {
        const resE = await res.json()
        console.log(resE)
        throw new Error(resE?.message ?? "Hubo un problema al activar tu cuenta.")
      }

    } catch (e: any) {
      setMensaje(e?.message || "Hubo un problema al activar tu cuenta.")
    }
  }

  useEffect(() => {
    handleSubmit()

  }, [])

  useEffect(() => {
    if (validado) {
      const t = setTimeout(() => {
        navigate('/login')
      }, 2000);

      return () => clearTimeout(t);
    }
  }, [validado])


  return (
    <div className="min-h-screen bg-[#131516] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1c1f21] border border-white/10 rounded-2xl shadow-xl p-8 space-y-6">

        <h1 className="text-3xl font-bold text-center text-blue-400">
          Confirmar Activación
        </h1>

        <h2 className=" font-bold text-center text-slate-400">{mensaje}</h2>
      </div>
    </div>
  );
}
