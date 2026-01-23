import React, { useRef, useEffect, useState, useCallback } from 'react';

const FaceDetectionCanvas = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceInCircle, setFaceInCircle] = useState(false);
  const [faceCenter, setFaceCenter] = useState({ x: 0, y: 0 });
  const [isCloseEnough, setIsCloseEnough] = useState(false);
  const [faceSizePercentage, setFaceSizePercentage] = useState(0);
  const animationRef = useRef(null);

  // Configuración ajustable
  const MIN_FACE_SIZE = 0.25; // 25% del tamaño del canvas (para cerca)
  const MAX_FACE_SIZE = 0.6;  // 60% del tamaño del canvas (demasiado cerca)
  const IDEAL_FACE_SIZE_MIN = 0.35; // 35% - tamaño ideal mínimo
  const IDEAL_FACE_SIZE_MAX = 0.5;  // 50% - tamaño ideal máximo

  // Iniciar cámara
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 }, // Aumentar resolución para mejor detección
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = async () => {
            await videoRef.current.play();
            detectFaceLoop();
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    startCamera();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Función mejorada para detectar límites del rostro
  const detectFace = useCallback((ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let facePixels = 0;
    let sumX = 0;
    let sumY = 0;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    // Escanear la imagen
    for (let y = 0; y < height; y += 2) { // Reducir paso para mejor precisión
      for (let x = 0; x < width; x += 2) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Filtro mejorado para tonos de piel
        const isSkinTone = detectSkinTone(r, g, b);

        if (isSkinTone) {
          facePixels++;
          sumX += x;
          sumY += y;

          // Actualizar límites del rostro
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (facePixels > 50) { // Aumentar mínimo de píxeles
      const centerX = sumX / facePixels;
      const centerY = sumY / facePixels;

      // Calcular tamaño del rostro
      const faceWidth = maxX - minX;
      const faceHeight = maxY - minY;
      const faceSize = Math.max(faceWidth, faceHeight);

      // Calcular porcentaje del tamaño relativo al canvas
      const canvasSize = Math.min(width, height);
      const faceSizePercent = faceSize / canvasSize;
      setFaceSizePercentage(faceSizePercent);

      // Verificar si está lo suficientemente cerca
      const isClose = faceSizePercent >= MIN_FACE_SIZE && faceSizePercent <= MAX_FACE_SIZE;
      const isIdealDistance = faceSizePercent >= IDEAL_FACE_SIZE_MIN &&
        faceSizePercent <= IDEAL_FACE_SIZE_MAX;
      setIsCloseEnough(isClose);

      const circleCenterX = width / 2;
      const circleCenterY = height / 2;
      const circleRadius = Math.min(width, height) * 0.35;

      const distance = Math.sqrt(
        Math.pow(centerX - circleCenterX, 2) +
        Math.pow(centerY - circleCenterY, 2)
      );

      const isInside = distance <= circleRadius && isIdealDistance;
      setFaceInCircle(isInside);
      setFaceCenter({ x: centerX, y: centerY });

      // Dibujar elementos visuales
      drawVisualGuides(ctx, width, height, minX, minY, maxX, maxY,
        centerX, centerY, isInside, isIdealDistance, faceSizePercent);

      return isInside;
    }

    setFaceInCircle(false);
    setIsCloseEnough(false);
    setFaceSizePercentage(0);
    drawNoFaceDetected(ctx, width, height);
    return false;
  }, []);

  // Función para detectar tonos de piel
  const detectSkinTone = (r, g, b) => {
    // Varios filtros para diferentes condiciones de luz
    const brightness = (r + g + b) / 3;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);

    // Filtro 1: Para condiciones normales
    const filter1 =
      r > 95 && g > 40 && b > 20 &&
      chroma > 15 &&
      Math.abs(r - g) > 15 &&
      r > g && r > b &&
      brightness < 240; // Excluir muy brillante

    // Filtro 2: Para condiciones de poca luz
    const filter2 =
      r > 80 && g > 30 && b > 15 &&
      r > g * 1.1 && r > b * 1.1 &&
      brightness > 30 && brightness < 200;

    // Filtro 3: Para luz artificial
    const filter3 =
      r > 100 && g > 45 && b < 100 && // Menos azul
      r > g && r > b &&
      Math.abs(r - g) > 10;

    return filter1 || filter2 || filter3;
  };

  // Función para dibujar guías visuales
  const drawVisualGuides = (ctx, width, height, minX, minY, maxX, maxY,
    centerX, centerY, isInside, isIdealDistance, faceSizePercent) => {

    const circleCenterX = width / 2;
    const circleCenterY = height / 2;
    const circleRadius = Math.min(width, height) * 0.35;

    // 1. Dibujar bounding box del rostro
    ctx.beginPath();
    ctx.rect(minX, minY, maxX - minX, maxY - minY);
    ctx.strokeStyle = isIdealDistance ? '#4CAF50' : '#FF9800';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Dibujar círculo guía
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = isInside ? '#00ff00' : '#ff0000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 3. Dibujar círculo de distancia ideal
    const idealMinRadius = circleRadius * 0.8;
    const idealMaxRadius = circleRadius * 1.2;

    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, idealMinRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, idealMaxRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 4. Dibujar punto central de la cara
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = isInside ? '#00ff00' : '#ff0000';
    ctx.fill();

    // 5. Mostrar información de tamaño
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText(`Tamaño: ${Math.round(faceSizePercent * 100)}%`, 10, 20);

    // 6. Indicador de distancia
    const distanceStatus = getDistanceStatus(faceSizePercent);
    ctx.fillStyle = distanceStatus.color;
    ctx.font = 'bold 16px Arial';
    ctx.fillText(distanceStatus.text, width - 150, 20);
  };

  // Función para determinar estado de distancia
  const getDistanceStatus = (faceSizePercent) => {
    if (faceSizePercent < MIN_FACE_SIZE) {
      return { text: 'DEMASIADO LEJOS', color: '#ff9800' };
    } else if (faceSizePercent > MAX_FACE_SIZE) {
      return { text: 'DEMASIADO CERCA', color: '#f44336' };
    } else if (faceSizePercent >= IDEAL_FACE_SIZE_MIN &&
      faceSizePercent <= IDEAL_FACE_SIZE_MAX) {
      return { text: 'DISTANCIA IDEAL ✓', color: '#4CAF50' };
    } else {
      return { text: 'AJUSTA DISTANCIA', color: '#ff9800' };
    }
  };

  // Dibujar cuando no se detecta rostro
  const drawNoFaceDetected = (ctx, width, height) => {
    const circleCenterX = width / 2;
    const circleCenterY = height / 2;
    const circleRadius = Math.min(width, height) * 0.35;

    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NO SE DETECTA ROSTRO', width / 2, height / 2);
    ctx.textAlign = 'left';
  };

  // Loop de detección
  const detectFaceLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current ||
      videoRef.current.readyState !== 4) {
      animationRef.current = requestAnimationFrame(detectFaceLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Sincronizar dimensiones
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar frame actual (espejado para que se vea natural)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Detectar rostro
    detectFace(ctx, canvas.width, canvas.height);

    // Continuar loop
    animationRef.current = requestAnimationFrame(detectFaceLoop);
  }, [detectFace]);

  return (
    <div style={{
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#2C2A29',
      borderRadius: '10px',
      color: '#ffffff',
      maxWidth: '700px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginBottom: '20px', color: '#fdda24' }}>
        Verificación Facial
      </h2>

      <div style={{
        position: 'relative',
        display: 'inline-block',
        marginBottom: '20px'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ display: 'none' }}
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{
            border: `4px solid ${faceInCircle ? '#4CAF50' : '#f44336'}`,
            borderRadius: '8px',
            backgroundColor: '#000',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            maxWidth: '100%',
            height: 'auto'
          }}
        />

        {/* Indicador superior */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: faceInCircle
            ? 'rgba(76, 175, 80, 0.9)'
            : 'rgba(244, 67, 54, 0.9)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '25px',
          fontWeight: 'bold',
          fontSize: '16px',
          transition: 'all 0.3s ease',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap'
        }}>
          {faceInCircle
            ? '✓ VERIFICACIÓN COMPLETA'
            : isCloseEnough
              ? '✓ AJUSTA POSICIÓN'
              : 'ACÉRCATE A LA CÁMARA'}
        </div>

        {/* Barra de progreso de distancia */}
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '10px',
          padding: '5px'
        }}>
          <div style={{
            width: `${Math.min(faceSizePercentage * 100, 100)}%`,
            height: '10px',
            background: faceInCircle
              ? '#4CAF50'
              : faceSizePercentage >= MIN_FACE_SIZE
                ? '#FF9800'
                : '#f44336',
            borderRadius: '5px',
            transition: 'width 0.3s ease'
          }} />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '5px',
            fontSize: '12px',
            color: '#ccc'
          }}>
            <span>Lejos</span>
            <span style={{
              color: faceInCircle ? '#4CAF50' : '#fdda24',
              fontWeight: 'bold'
            }}>
              Ideal
            </span>
            <span>Cerca</span>
          </div>
        </div>
      </div>

      {/* Panel de instrucciones */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px',
        textAlign: 'left'
      }}>
        <h3 style={{ color: '#fdda24', marginBottom: '15px' }}>
          Instrucciones para una verificación exitosa:
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{
              background: '#fdda24',
              color: '#2C2A29',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '10px',
              flexShrink: 0,
              fontWeight: 'bold'
            }}>1</div>
            <div>
              <strong style={{ color: '#fdda24' }}>Iluminación adecuada</strong>
              <p style={{ margin: '5px 0 0', fontSize: '14px' }}>
                Ubícate en un lugar bien iluminado, preferiblemente con luz natural
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{
              background: '#fdda24',
              color: '#2C2A29',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '10px',
              flexShrink: 0,
              fontWeight: 'bold'
            }}>2</div>
            <div>
              <strong style={{ color: '#fdda24' }}>Distancia correcta</strong>
              <p style={{ margin: '5px 0 0', fontSize: '14px' }}>
                Acércate hasta que tu rostro ocupe el 35-50% del círculo
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{
              background: '#fdda24',
              color: '#2C2A29',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '10px',
              flexShrink: 0,
              fontWeight: 'bold'
            }}>3</div>
            <div>
              <strong style={{ color: '#fdda24' }}>Centra tu rostro</strong>
              <p style={{ margin: '5px 0 0', fontSize: '14px' }}>
                Asegúrate de que tu rostro esté dentro del círculo guía
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{
              background: '#fdda24',
              color: '#2C2A29',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '10px',
              flexShrink: 0,
              fontWeight: 'bold'
            }}>4</div>
            <div>
              <strong style={{ color: '#fdda24' }}>Mira a la cámara</strong>
              <p style={{ margin: '5px 0 0', fontSize: '14px' }}>
                Mantén contacto visual directo con la cámara
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de estado */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: faceInCircle ? '#4CAF50' : '#f44336',
            margin: '0 auto 5px',
            boxShadow: faceInCircle ? '0 0 10px #4CAF50' : 'none'
          }} />
          <span style={{ fontSize: '14px' }}>
            {faceInCircle ? 'Centrado ✓' : 'Por centrar'}
          </span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: isCloseEnough ? '#4CAF50' : '#f44336',
            margin: '0 auto 5px',
            boxShadow: isCloseEnough ? '0 0 10px #4CAF50' : 'none'
          }} />
          <span style={{ fontSize: '14px' }}>
            {isCloseEnough ? 'Distancia ✓' : 'Acércate más'}
          </span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: faceSizePercentage > 0 ? '#4CAF50' : '#f44336',
            margin: '0 auto 5px',
            boxShadow: faceSizePercentage > 0 ? '0 0 10px #4CAF50' : 'none'
          }} />
          <span style={{ fontSize: '14px' }}>
            {faceSizePercentage > 0 ? 'Rostro detectado' : 'Sin detección'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FaceDetectionCanvas;