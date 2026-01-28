import { useState, useEffect } from "react";
import { instanceBackend } from "../axios/instanceBackend";

export default function IpBlocker({ children }) {
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        // Interceptor para detectar respuestas 403 (Bloqueado)
        const interceptor = instanceBackend.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 403) {
                    // Si el backend dice que estamos bloqueados
                    if (error.response.data && error.response.data.status === 'error_blocked') {
                        setIsBlocked(true);
                    }
                }
                return Promise.reject(error);
            }
        );

        // Endpoint de verificación inicial (opcional, para bloquear al recargar)
        // Se puede llamar a cualquier endpoint ligero o esperar a la primera interacción
        instanceBackend.get('/').catch(() => { });

        return () => {
            instanceBackend.interceptors.response.eject(interceptor);
        };
    }, []);

    if (isBlocked) {
        // Retornar null o un div vacío con estilo fixed para cubrir todo
        // El usuario pidió "pantalla en blanco"
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'white',
                zIndex: 999999
            }}>
            </div>
        );
    }

    return children;
}
