
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CertificadoCP from './CP/CertificadoCP';
import CertificadoCollegium from './COLLEGIUM/CertificadoCollegium';
import { obtenerIdDeSuscripcionPorTokenDeCursoArmadoAsync } from '../PanelAdministrador/Api/suscripciones';
import { useCertificateRealtime } from '../../realtime';

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
    const [refreshKey, setRefreshKey] = useState(0)

    const [msg, setMsg] = useState<string | null>('Obteniendo datos del usuario...')

    const refrescarCertificado = useCallback(() => {
        setRefreshKey(key => key + 1)
    }, [])

    useCertificateRealtime(token_curso, refrescarCertificado)


    useEffect(() => {
        if (!token || !token_curso) { return }

        const obtener = async () => {
            try {
                const id_suscriptor = await obtenerIdDeSuscripcionPorTokenDeCursoArmadoAsync(token_curso)
                setIdSuscriptor(id_suscriptor)
            } catch (e) {
                console.log(e)
                setMsg('Hubo un problema al obtener los datos del alumno')
            }
        }

        obtener()

    }, [token, token_curso])

    useEffect(() => {
        console.log(idSuscriptor)
        if (idSuscriptor) {
            setMsg(null)
        }
    }, [idSuscriptor])

    return msg ? <p>{msg}</p> : idSuscriptor ? <div key={refreshKey}><Certificado id={idSuscriptor} /></div> : null
}
