
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CertificadoCP from './CP/CertificadoCP';
import CertificadoCollegium from './COLLEGIUM/CertificadoCollegium';
import { obtenerIdDeSuscripcionPorTokenDeCursoArmadoAsync } from '../PanelAdministrador/Api/suscripciones';

const certificados = {
    3: CertificadoCP,
    2: CertificadoCollegium
} as const

type TipoComponente = keyof typeof certificados

const Certificado = ({ id }: { id: TipoComponente }) => {
    console.log(id,'CERTIFICADO')
    const CertificadoB = certificados[id]

    if (CertificadoB) {
        return <CertificadoB id_suscriptor={id} />
    }
}

export default () => {
    const { token, token_curso } = useParams<{
        token: string
        token_curso: string
    }>()

    const [idSuscriptor, setIdSuscriptor] = useState<TipoComponente | null>(null)

    const [msg, setMsg] = useState<string | null>('Obteniendo datos del usuario...')


    useEffect(() => {
        console.log('uuhuuhuhuh',token,token_curso)

        if (!token || !token_curso) { return }

        const obtener = async () => {
            try {
                const id_suscriptor = await obtenerIdDeSuscripcionPorTokenDeCursoArmadoAsync(token_curso)
                console.log(idSuscriptor)
                setIdSuscriptor(id_suscriptor)
            } catch (e) {
                console.log(e)
                setMsg('Hubo un problema al obtener los datos del alumno')
            }
        }

        obtener()

    }, [])

    useEffect(() => {
        console.log(idSuscriptor)
        if (idSuscriptor) {
            setMsg(null)
        }
    }), [idSuscriptor]

    return msg ? <p>{msg}</p> : idSuscriptor ? <Certificado id={idSuscriptor} /> : null
}
