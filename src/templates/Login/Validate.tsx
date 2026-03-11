import { useEffect, useState } from "react";
import { backend } from "../../vars";

export default function ActivarCuentaPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clickeado, setClickeado] = useState<boolean>(false)

  const [mensaje, setMensaje] = useState<string | null>()

  const [valido, setValido] = useState<boolean>(false)

  useEffect(() => {
    if (!valido) { return }

    setMensaje("Se ha enviado un correo para activar tu cuenta.")

  }, [valido])

  useEffect(() => {
    if (valido) { return }

    const x = setTimeout(() => {
      setMensaje(null)
    }, 2500);

    return () => { clearTimeout(x) }

  }, [mensaje])

  async function handleSubmit() {
    if (clickeado || valido) { return }

    if (!password) {

      setMensaje('La constraseña es obligatoria.')
      return
    }

    if (!email) {

      setMensaje('El correo es obligatorio'

      )
      return
    }


    setClickeado(true)

    try {
      const res = await fetch(`${backend}/auth/activar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: email,
          password: password
        })

      })

      if (!res.ok) {
        const resE = await res.json()

        throw new Error(resE?.message ?? "Hubo un problema al activar tu cuenta.")
      }

      setValido(true)

    } catch (e: any) {
      setMensaje(e?.message ?? "Hubo un problema al activar tu cuenta.")
    } finally {
      setClickeado(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#131516] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1c1f21] border border-white/10 rounded-2xl shadow-xl p-8 space-y-6">

        <h1 className="text-3xl font-bold text-center text-blue-400">
          Activar Cuenta
        </h1>

        <p className="text-sm text-white/60 text-center">
          Si tu correo está registrado, recibirás un enlace para activar tu cuenta.
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña que deseas usar"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {mensaje ? <h2 className={`"text-3xl font-bold text-center ${valido ? 'text-blue-400' : 'text-red-500'} `}>{mensaje}</h2> : <button onClick={(() => {
          handleSubmit()
        })} className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 font-semibold">
          Enviar enlace de activación
        </button>}

      </div>
    </div>
  );
}
