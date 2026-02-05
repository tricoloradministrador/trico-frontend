import { useEffect, useState, useRef } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import './css/LoginModal.css';
import { limpiarPaddingBody } from "@utils";

// Se exporta el componente
export default function VerificacionIdentidad() {

  // Se inicializan los estados para manejar el continuar
  const [formState, setFormState] = useState({
    paso: 1,
    continuar: false,
    volverIntentar: false,
    error: false,
    ok: false,
    texto: "Empezar",
    textoAtras: "Atrás",
    contador: 3
  });

  // Ref para la cámara
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const faceDetectorRef = useRef(null);

  // Se inicializa los estados
  const [ip, setIp] = useState("");
  const [fechaHora, setFechaHora] = useState("");

  // Se crea el useEffect para iniciar la cámara y la detección facial
  useEffect(() => {

    // Se limpia el padding del body
    limpiarPaddingBody();

    // Solo iniciar en paso 3
    if (formState.paso !== 3) return;

    // Verificar que el ref del video esté disponible
    if (!videoRef.current) return;

    // Función para inicializar la detección facial
    const initFaceDetection = async () => {

      faceDetectorRef.current = new FaceDetection({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
      });

      faceDetectorRef.current.setOptions({
        model: "short",
        minDetectionConfidence: 0.7,
      });

      faceDetectorRef.current.onResults((results) => {
        if (results.detections && results.detections.length === 1) {
          setFormState(prev => ({ ...prev, ok: true, error: false }));
        } else {
          setFormState(prev => ({ ...prev, ok: false, error: false }));
        }
      });

      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceDetectorRef.current?.send({
            image: videoRef.current,
          });
        },
        width: 320,
        height: 400,
      });

      cameraRef.current.start();
    };

    initFaceDetection();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (faceDetectorRef.current) {
        faceDetectorRef.current.close();
        faceDetectorRef.current = null;
      }
    };
  }, [formState.paso]);

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

  // Placeholder function for the button
  const handleContinuar = () => {

    // Se actualiza el estado según el paso actual
    setFormState((prev) => {

      // Paso 1 → Paso 2
      if (prev.paso === 1) {

        // Iniciar cámara y detección facial
        return {
          ...prev,
          paso: 2,
          texto: "Continuar"
        };
      };

      // Paso 2 → Paso 3
      if (prev.paso === 2) {

        // Iniciar cámara y detección facial
        return {
          ...prev,
          paso: 3,
          continuar: true,
          texto: "Comenzar",
        };
      };

      // Paso 3 (aquí puedes enviar info o finalizar)
      if (prev.paso === 3) {

        // Aquí podrías agregar lógica para enviar datos o finalizar el proceso
        return prev;
      };

      // Por defecto,
      return prev;
    });
  };

  // Función para manejar el botón de atrás
  const handleAtras = () => {

    // Se actualiza el estado según el paso actual
    setFormState((prev) => {

      // Paso 2 → Paso 1
      if (prev.paso === 2) {

        // Volver al paso 1
        return {
          ...prev,
          paso: 1,
          texto: "Empezar"
        };
      };

      // Paso 3 → Paso 2
      if (prev.paso === 3) {

        // Volver al paso 2
        return {
          ...prev,
          paso: 2,
          texto: "Continuar"
        };
      };

      // Por defecto,
      return prev;
    });
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "center"
                }}
              >
              </div>

              {formState.paso === 1 ?
                <>
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
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "20px"
                      }}
                    >
                      <img
                        src="/assets/images/indicacion/celular_logo2.png"
                        alt="Alert Icon"
                      />
                    </div>
                  </div>

                  <h2 style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginBottom: "20px",
                    lineHeight: "1.3",
                    color: "#ffffff"
                  }}>
                    ¡Bienvenido a Biometría Facial!
                  </h2>

                  <p style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "15px", color: "#ffffff" }}>
                    Una alianza para la transformación digital segura.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "40px",
                      marginBottom: "40px",
                      width: "100%"
                    }}
                  >
                    {/* Izquierda */}
                    <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                      <img
                        src="/assets/images/img_pantalla2/imgi_1_bancolombia-horizontal-no-spacing.svg"
                        width={120}
                      />
                    </div>

                    {/* HR vertical */}
                    <div
                      style={{
                        width: "2px",
                        height: "40px",
                        backgroundColor: "#ffffff",
                        margin: "0 20px",
                        flexShrink: 0
                      }}
                    />

                    {/* Derecha */}
                    <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
                      <img
                        src="/assets/images/indicacion/soyyoredeban.png"
                        width={105}
                      />
                    </div>
                  </div>
                </> : null}

              {formState.paso === 2 ?
                <>
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
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "20px"
                      }}
                    >
                      <img
                        src="/assets/images/indicacion/celular_logo2.png"
                        alt="Alert Icon"
                      />
                    </div>
                  </div>

                  <h2 className="mt-2" style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginBottom: "20px",
                    lineHeight: "1.3",
                    color: "#ffffff"
                  }}>
                    Verificación de identidad
                  </h2>

                  <p className="mt-4" style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "15px", color: "#ffffff" }}>
                    Necesitamos verificar tu identidad para continuar con el proceso de forma segura.
                  </p>

                  <p className="mt-4 mb-4" style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "15px", color: "#ffffff" }}>
                    Para completar la verificacion, acepta los permisos de la cámara y sigue las instrucciones:
                  </p>

                  <div className="info-list mt-4 mb-4">
                    <div className="info-item">
                      <img src="/assets/images/img1.svg" alt="" />
                      <p className="info-text">
                        <h5 style={{ color: "#fdda24" }}>
                          Ubicate en un espacio iluminado
                        </h5>
                        Mejor un lugar con luz natural o luz blanca.
                      </p>
                    </div>

                    <div className="info-item">
                      <img src="/assets/images/img2.svg" alt="" />
                      <p className="info-text">
                        <h5 style={{ color: "#fdda24" }}>
                          Ubica tú celular a la altura de tu rostro
                        </h5>
                        Mantén la cabeza recta mirando al frente y ubica tu celular a esa altura.
                      </p>
                    </div>

                    <div className="info-item">
                      <img src="/assets/images/img3.svg" alt="" />
                      <p className="info-text">
                        <h5 style={{ color: "#fdda24" }}>
                          Retira los accesorios
                        </h5>
                        Evita cubrir tu rostro con tú cabello, gafas, gorras, tapabocas, etc.
                      </p>
                    </div>
                  </div>
                </> : null}

              {formState.paso === 3 ?
                <>
                  <div
                    id="webcam-container"
                    style={{
                      position: "relative",
                      width: "320px",
                      margin: "0 auto",
                    }}
                  >
                    {/* Video */}
                    <video
                      key="video-face"
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: "100%",
                        borderRadius: "12px",
                        transform: "scaleX(-1)", // 👈 corrige el espejo
                      }}
                    />

                    {/* Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "285px",
                          borderRadius: "50%",
                          border: "5px solid rgb(220 190 30)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <div className="face-dashed-container">
                          <div className={`face-dashed ${formState.ok ? "spin" : ""}`} />
                        </div>
                      </div>
                    </div>

                    {/* Mensaje de error */}
                    {formState.error && (
                      <p style={{ color: "#fdda24", fontSize: "13px", marginTop: "10px" }}>
                        Ubica tu rostro dentro del círculo
                      </p>
                    )}
                  </div>
                </> : null}

              <div className="step-container mt-4 mb-4">
                {/* Slot 1 */}
                {formState.paso === 1 ? (
                  <div className="step bar active"></div>
                ) : (
                  <div className="step circle"></div>
                )}

                {/* Slot 2 */}
                {formState.paso === 2 ? (
                  <div className="step bar active"></div>
                ) : (
                  <div className="step circle"></div>
                )}

                {/* Slot 3 */}
                {formState.paso === 3 ? (
                  <div className="step bar active"></div>
                ) : (
                  <div className="step circle"></div>
                )}
              </div>

              <div className="mt-4" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                {formState.paso > 1 && (
                  <button className="bc-button-primary login-btn-borrar" onClick={handleAtras} style={{ fontSize: "14px" }}>
                    {formState.textoAtras}
                  </button>
                )}
                <button className="bc-button-primary login-btn" onClick={handleContinuar} style={{ fontSize: "14px" }}>
                  {formState.texto}
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
      </div >

      <div className="visual-captcha" style={{ cursor: "pointer" }}>
        <img src="/assets/images/lateral-der.png" alt="Visual Captcha" />
      </div>
    </>
  );
};