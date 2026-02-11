import { createContext, useEffect, useState } from "react";
import ErrorPopout from "./Errorpopout";

let errorHandler: ((msg: string) => void) | null = null;

export function registerErrorHandler(fn: (msg: string) => void) {
    errorHandler = fn;
}

export function emitError(msg: string) {
    if (errorHandler) {
        errorHandler(msg);
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

    useEffect(() => {
        registerErrorHandler(setError)
    }, [])

    return (
        <ErrorContext.Provider value={{ error, setError }}>
            {children}

            {error && (
                <ErrorPopout
                    mensaje={error}
                    onClose={() => setError(null)}
                />
            )}
        </ErrorContext.Provider>
    )
}
