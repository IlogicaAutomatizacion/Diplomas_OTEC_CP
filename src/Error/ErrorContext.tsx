import { createContext, useEffect, useRef, useState } from "react";
import ErrorPopout from "./Errorpopout";
import { normalizeErrorMessage } from "./normalizeError";

let errorHandler: ((msg: string) => void) | null = null;

export function registerErrorHandler(fn: (msg: string) => void) {
    errorHandler = fn;
}

export function emitError(msg: string) {
    if (errorHandler) {
        errorHandler(normalizeErrorMessage(msg));
    } else {
        console.warn('Error no manejado:', msg);
    }
}

interface ErrorContextType {
    error: string | null;
    setError: (msg: string | null) => void;
}

export const ErrorContext = createContext<ErrorContextType | undefined>(
    undefined
);

export const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
    const [error, setError] = useState<string | null>(null)
    const queueRef = useRef<string[]>([])
    const lastShownRef = useRef<{ message: string; time: number } | null>(null)

    const showNextError = () => {
        const nextError = queueRef.current.shift() ?? null;
        setError(nextError);

        if (nextError) {
            lastShownRef.current = { message: nextError, time: Date.now() };
        }
    };

    const enqueueError = (rawMessage: string | null) => {
        if (!rawMessage) {
            return;
        }

        const message = normalizeErrorMessage(rawMessage);
        const lastShown = lastShownRef.current;
        const isRepeatedRecentMessage =
            lastShown &&
            lastShown.message === message &&
            Date.now() - lastShown.time < 2500;

        if (error === message || queueRef.current.includes(message) || isRepeatedRecentMessage) {
            return;
        }

        if (!error) {
            setError(message);
            lastShownRef.current = { message, time: Date.now() };
            return;
        }

        queueRef.current.push(message);
    };

    useEffect(() => {
        registerErrorHandler(enqueueError)
    }, [error])

    return (
        <ErrorContext.Provider value={{ error, setError: enqueueError }}>
            {children}

            {error && (
                <ErrorPopout
                    mensaje={error}
                    onClose={showNextError}
                />
            )}
        </ErrorContext.Provider>
    )
}
