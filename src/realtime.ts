import { useEffect, useRef } from "react";
import {
    joinCertificateRealtime,
    joinAdminRealtime,
    joinSubscriptionRealtime,
    leaveCertificateRealtime,
    leaveSubscriptionRealtime,
    socket,
    type CertificateRealtimeEvent,
    type AdminRealtimeEvent,
    type UserRealtimeEvent,
    type SubscriptionPresenceEvent,
    type SubscriptionRealtimeEvent,
} from "./socket";

export function useSubscriptionRealtime(
    suscriptorId: number | null | undefined,
    onChange: (event: SubscriptionRealtimeEvent) => void,
    onPresence?: (event: SubscriptionPresenceEvent) => void,
) {
    const onChangeRef = useRef(onChange)
    const onPresenceRef = useRef(onPresence)

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
        onPresenceRef.current = onPresence
    }, [onPresence])

    useEffect(() => {
        if (!suscriptorId) return;

        const handleChange = (event: SubscriptionRealtimeEvent) => {
            if (event.suscriptorId !== suscriptorId) return;
            onChangeRef.current(event);
        };

        const handlePresence = (event: SubscriptionPresenceEvent) => {
            if (event.suscriptorId !== suscriptorId) return;
            onPresenceRef.current?.(event);
        };

        socket.on('subscription:changed', handleChange);
        socket.on('subscription:presence', handlePresence);
        joinSubscriptionRealtime(suscriptorId);

        return () => {
            socket.off('subscription:changed', handleChange);
            socket.off('subscription:presence', handlePresence);
            leaveSubscriptionRealtime(suscriptorId);
        };
    }, [suscriptorId]);
}

export function useCertificateRealtime(
    tokenCurso: string | null | undefined,
    onChange: (event: CertificateRealtimeEvent) => void,
) {
    useEffect(() => {
        if (!tokenCurso) return;

        const handleChange = (event: CertificateRealtimeEvent) => {
            if (event.tokenCurso !== tokenCurso) return;
            onChange(event);
        };

        joinCertificateRealtime(tokenCurso);
        socket.on('certificate:changed', handleChange);

        return () => {
            socket.off('certificate:changed', handleChange);
            leaveCertificateRealtime(tokenCurso);
        };
    }, [tokenCurso, onChange]);
}

export function useAdminRealtime(onChange: (event: AdminRealtimeEvent) => void) {
    useEffect(() => {
        joinAdminRealtime();
        socket.on('admin:changed', onChange);

        return () => {
            socket.off('admin:changed', onChange);
        };
    }, [onChange]);
}

export function useUserRealtime(onChange: (event: UserRealtimeEvent) => void) {
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return

        socket.auth = { token }
        if (!socket.connected) {
            socket.connect()
        }

        socket.on('user:changed', onChange)

        return () => {
            socket.off('user:changed', onChange)
        }
    }, [onChange])
}
