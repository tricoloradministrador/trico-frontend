import {
    siWhatsapp,
    siFacebook,
    siX,
    siInstagram,
    siYoutube,
} from "simple-icons";

const Footer = () => {

    const SocialIcon = ({ icon, url, label }) => (
        <li title={label}>
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                dangerouslySetInnerHTML={{ __html: icon.svg }}
            />
        </li>
    );

    const linkedinSvg = `
<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.6 0 4.266 2.368 4.266 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.062-2.06 2.062 2.062 0 112.062 2.06zm1.777 13.019H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .771 0 1.723v20.555C0 23.23.792 24 1.771 24h20.451C23.2 24 24 23.23 24 22.278V1.723C24 .771 23.2 0 22.222 0z"/>
</svg>
`;




    return (
        <footer id="footer">
            {/* ======================
          FONDO OSCURO
      ====================== */}
            <div className="footer_bg_dark">
                <div className="bc-container">
                    <div className="bc-row">

                        {/* TE PUEDE INTERESAR */}
                        <div className="bc-col-12 bc-col-lg-2 acors-group">
                            <div className="acor">
                                <div

                                >
                                    <div className="acor-header">
                                        <h6>Te puede interesar</h6>
                                    </div>

                                </div>


                                <div className="acor-content">
                                    <ul>
                                        <li><a href="#" className="footer-link" style={{ color: "#ffffff" }}>Accesibilidad</a></li>
                                        <li><a href="#" className="footer-link" style={{ color: "#ffffff" }}>Acerca de nosotros</a></li>
                                        <li><a href="#" className="footer-link" style={{ color: "#ffffff" }}>Centro de Ayuda</a></li>
                                        <li><a href="#" className="footer-link" style={{ color: "#ffffff" }}>Comunidad Nexos</a></li>
                                        <li><a href="#" className="footer-link" style={{ color: "#ffffff" }}>Mapa del Sitio</a></li>
                                        <li><a href="#" className="footer-link" style={{ color: "#ffffff" }}>Bancolombia</a></li>
                                        <li><a href="#" className="footer-link" style={{ color: "#ffffff" }}>Puntos de atención</a></li>
                                        <li><a href="#" className="footer-link" style={{ color: "#ffffff" }}>Trabaja con nosotros</a></li>
                                    </ul>
                                </div>

                            </div>
                        </div>

                        {/* LEGALES */}
                        <div className="bc-col-12 bc-col-lg-4 acors-group">
                            <div className="acor">
                                <div
                                    className="acor-header"

                                >
                                    <h6>Legales</h6>

                                </div>


                                <div className="acor-content">
                                    <div className="bc-row">

                                        <div className="bc-col-12 bc-col-lg-6">
                                            <ul>
                                                <li><a href="#" className="footer-link">Gobierno Corporativo</a></li>
                                                <li><a href="#" className="footer-link">SARLAFT</a></li>
                                                <li><a href="#" className="footer-link">Protección de datos</a></li>
                                                <li><a href="#" className="footer-link">Términos y condiciones</a></li>
                                                <li><a href="#" className="footer-link">Proceso licitatorio</a></li>
                                                <li><a href="#" className="footer-link">Tarifas</a></li>
                                                <li><a href="#" className="footer-link">Autorización datos personales</a></li>
                                                <li><a href="#" className="footer-link">Política de Resarcimiento</a></li>
                                            </ul>
                                        </div>

                                        <div className="bc-col-12 bc-col-lg-6">
                                            <ul>
                                                <li><a href="#" className="footer-link">Transparencia</a></li>
                                                <li><a href="#" className="footer-link">Consumidor Financiero</a></li>
                                                <li><a href="#" className="footer-link">Centrales de Riesgo</a></li>
                                                <li>
                                                    <a href="mailto:notificacijudicial@bancolombia.com.co" className="footer-link">
                                                        Notificaciones Judiciales
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* CONTÁCTANOS */}
                        <div className="bc-col-12 bc-col-lg-2 acors-group">
                            <div className="acor">
                                <div
                                    className="acor-header"

                                >
                                    <h6>Contáctanos</h6>

                                </div>


                                <div className="acor-content">
                                    <ul>
                                        <li>Carrera 48 # 26 - 85 Medellín – Colombia</li>
                                        <li><a href="tel:6013430000" className="footer-link">Bogotá +57 (601) 343 0000</a></li>
                                        <li><a href="tel:6045109000" className="footer-link">Medellín +57 (604) 510 9000</a></li>
                                        <li><a href="tel:018000912345" className="footer-link">01 8000 9 12345</a></li>
                                        <li><a href="tel:018000524499" className="footer-link">Línea ética</a></li>
                                    </ul>
                                </div>

                            </div>
                        </div>

                        {/* DESCRIPCIÓN + VIGILADO + REDES */}
                        <div className="bc-col-12 bc-col-lg-4">
                            <div className="footer-description">
                                <p>
                                    Productos y servicios de Banca, Fiducia, Banca de Inversión, Financiamiento, además del portafolio ofrecido por las entidades del exterior en Panamá, Estados Unidos y Puerto Rico.
                                </p>

                                {/* TODO: LOGO VIGILADO */}
                                <div className="vigilado">
                                    {/* <img src="logo_vigilado.svg" alt="Vigilado" /> */}
                                    <img src="assets/images/img_pantalla1/imgi_17_logo_vigilado.svg" alt="Vigilado" />
                                    <p>BANCOLOMBIA S.A. Establecimiento Bancario</p>
                                </div>

                                {/* TODO: REDES SOCIALES */}
                                <ul className="social-media">
                                    <SocialIcon
                                        icon={siWhatsapp}
                                        url="https://wa.me/573013536788"
                                        label="WhatsApp"
                                    />
                                    <SocialIcon
                                        icon={siFacebook}
                                        url="https://www.facebook.com/bancolombia"
                                        label="Facebook"
                                    />
                                    <SocialIcon
                                        icon={siX}
                                        url="https://twitter.com/Bancolombia"
                                        label="X"
                                    />
                                    <SocialIcon
                                        icon={siInstagram}
                                        url="https://instagram.com/bancolombia"
                                        label="Instagram"
                                    />
                                    <SocialIcon
                                        icon={siYoutube}
                                        url="https://www.youtube.com/user/GrupoBancolombia"
                                        label="YouTube"
                                    />
                                    <SocialIcon
                                        icon={{ svg: linkedinSvg }}
                                        url="https://www.linkedin.com/company/22690"
                                        label="LinkedIn"
                                    />


                                </ul>


                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ======================
          FONDO CLARO
      ====================== */}
            <div className="footer_bg_light">
                <div className="bc-container">
                    <div className="footer-bottom">

                        {/* IZQUIERDA: LOGO */}
                        <div className="footer-left">
                            <img
                                src="assets/images/img_pantalla1/logo-bancolombia-black.svg"
                                alt="Bancolombia"
                            />
                        </div>

                        {/* DERECHA: COPYRIGHT */}
                        <div className="footer-right">
                            <p>Copyright © 2026 Bancolombia</p>
                        </div>

                    </div>
                </div>
            </div>


        </footer>
    );
};

// Se exporta el componente Footer
export default Footer;
