import { io, Socket } from "socket.io-client";
import { backend } from "./vars";

export const socket: Socket = io(backend, {
    transports: ["websocket"],
    autoConnect: false,
});

const joinedSubscriptions = new Map<number, number>()
const joinedCertificates = new Map<string, number>()
let joinedAdminCount = 0

socket.on('connect', () => {
    joinedSubscriptions.forEach((count, suscriptorId) => {
        if (count <= 0) return
        socket.emit('subscription:join', { suscriptorId })
    })
    joinedCertificates.forEach((count, tokenCurso) => {
        if (count <= 0) return
        socket.emit('certificate:join', { tokenCurso })
    })
    if (joinedAdminCount > 0) {
        socket.emit('admin:join')
    }
})

export type RealtimeResource =
    | 'usuarios'
    | 'empresas'
    | 'cursos'
    | 'cursosArmados'
    | 'inscripciones'
    | 'parametros'
    | 'certificados'
    | 'suscripciones'

export type SubscriptionRealtimeEvent = {
    resource: RealtimeResource
    action: string
    suscriptorId: number
    entityId?: number | string
    affectedIds?: Array<number | string>
    version: number
    at: string
}

export type SubscriptionPresenceEvent = {
    suscriptorId: number
    usuarios: { correo: string }[]
    at: string
}

export type CertificateRealtimeEvent = {
    tokenCurso: string
    version: number
    at: string
}

export type AdminRealtimeEvent = {
    resource: RealtimeResource
    action: string
    entityId?: number | string
    version: number
    at: string
}

export type UserRealtimeEvent = {
    resource: string
    action: string
    entityId?: number | string
    version: number
    at: string
}

export function ensureSocketConnected(token?: string | null) {
    if (token) {
        socket.auth = { token }
    }

    if (!socket.connected) {
        socket.connect()
    }
}

export function joinSubscriptionRealtime(suscriptorId: number) {
    ensureSocketConnected(localStorage.getItem('token'))
    const nextCount = (joinedSubscriptions.get(suscriptorId) ?? 0) + 1
    joinedSubscriptions.set(suscriptorId, nextCount)
    if (nextCount > 1) return
    socket.emit('subscription:join', { suscriptorId })
}

export function leaveSubscriptionRealtime(suscriptorId: number) {
    const currentCount = joinedSubscriptions.get(suscriptorId) ?? 0
    if (currentCount <= 1) {
        joinedSubscriptions.delete(suscriptorId)
    } else {
        joinedSubscriptions.set(suscriptorId, currentCount - 1)
        return
    }
    if (!socket.connected) return
    socket.emit('subscription:leave', { suscriptorId })
}

export function joinCertificateRealtime(tokenCurso: string) {
    ensureSocketConnected()
    const nextCount = (joinedCertificates.get(tokenCurso) ?? 0) + 1
    joinedCertificates.set(tokenCurso, nextCount)
    if (nextCount > 1) return
    socket.emit('certificate:join', { tokenCurso })
}

export function leaveCertificateRealtime(tokenCurso: string) {
    const currentCount = joinedCertificates.get(tokenCurso) ?? 0
    if (currentCount <= 1) {
        joinedCertificates.delete(tokenCurso)
    } else {
        joinedCertificates.set(tokenCurso, currentCount - 1)
        return
    }
    if (!socket.connected) return
    socket.emit('certificate:leave', { tokenCurso })
}

export function joinAdminRealtime() {
    ensureSocketConnected(localStorage.getItem('token'))
    joinedAdminCount += 1
    if (joinedAdminCount > 1) return
    socket.emit('admin:join')
}
