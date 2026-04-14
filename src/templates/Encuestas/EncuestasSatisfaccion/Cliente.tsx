import { useEffect, useState } from "react"
import ResponderEncuesta from "../FormatoBaseEncuesta"
import { useParams } from "react-router-dom"
import { agregarRespuestaEncuestaAsync, obtenerFormatoEncuestaSatisfaccionClienteAsync, obtenerRespuestaEncuestaPorCursoArmadoAsync } from "../../PanelAdministrador/Api/formatos-dinamicos"
import type { CrearRespuestaEncuestaDto, EncuestaFormato } from "../../PanelAdministrador/Componentes/CreadorDeEncuesta"

export default () => {
    const { token_usuario, token_suscriptor, token_curso_armado } = useParams<{
        token_usuario: string
        token_suscriptor: string
        token_curso_armado: string
    }>()

    const [encuesta, setEncuesta] = useState<EncuestaFormato | null>(null)
    const [respondida, setRespondida] = useState(false)

    useEffect(() => {
        if (!token_suscriptor || !token_usuario || !token_curso_armado) return

        ;(async () => {
            const encuesta = await obtenerFormatoEncuestaSatisfaccionClienteAsync(token_suscriptor)
            setEncuesta(encuesta)

            // 👇 Verifica si ya respondió
            const respuestaPrevia = await obtenerRespuestaEncuestaPorCursoArmadoAsync(
                token_usuario,
                encuesta.id,
                token_curso_armado
            )

            if (respuestaPrevia) setRespondida(true)
        })()
    }, [token_suscriptor])

    const handleSubmit = async (respuestas: CrearRespuestaEncuestaDto) => {
        if (!token_usuario || !encuesta) return

        const payload: CrearRespuestaEncuestaDto = {
            ...respuestas,
            informacionAdicional: { token_curso_armado }
        }

        await agregarRespuestaEncuestaAsync(token_usuario, encuesta.id, payload)
        setRespondida(true)
    }

    if (respondida) return (
        <div className="flex flex-col justify-center items-center h-screen gap-4">
            <p className="text-3xl font-semibold">¡Gracias por responder!</p>
            <p className="opacity-60">Tus respuestas han sido registradas.</p>
        </div>
    )

    return encuesta ? <ResponderEncuesta encuesta={encuesta} onSubmit={handleSubmit} /> : null
}