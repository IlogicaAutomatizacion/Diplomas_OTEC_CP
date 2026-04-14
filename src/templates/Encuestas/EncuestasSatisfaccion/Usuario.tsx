import { useEffect, useState } from "react"
import ResponderEncuesta from "../FormatoBaseEncuesta"
import { useParams } from "react-router-dom"
import { obtenerFormatoEncuestaSatisfaccionUsuarioAsync, obtenerRespuestasEncuestaAsync } from "../../PanelAdministrador/Api/formatos-dinamicos"
import type { CrearRespuestaEncuestaDto, EncuestaFormato } from "../../PanelAdministrador/Componentes/CreadorDeEncuesta"
import { agregarRespuestaEncuestaAsync } from "../../PanelAdministrador/Api/inscripciones"

export default () => {
    const { token_inscripcion, token_suscriptor } = useParams<{
        token_inscripcion: string
        token_suscriptor: string
    }>()

    const [encuesta, setEncuesta] = useState<EncuestaFormato | null>()
    const [respondida, setRespondida] = useState(false)

    useEffect(() => {
        if (!token_suscriptor || !token_inscripcion) return

        ;(async () => {
            const encuesta = await obtenerFormatoEncuestaSatisfaccionUsuarioAsync(token_suscriptor)
            setEncuesta(encuesta)

            // 👇 Verifica si ya respondió
            
            const respuestasprevias = await obtenerRespuestasEncuestaAsync(token_inscripcion, encuesta.id)

            if (respuestasprevias?.length > 0) setRespondida(true)
        })()
    }, [token_suscriptor])

    const handleSubmit = async (respuestas: CrearRespuestaEncuestaDto) => {
        if (!token_inscripcion || !encuesta) return

        await agregarRespuestaEncuestaAsync(token_inscripcion, encuesta.id, respuestas)
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