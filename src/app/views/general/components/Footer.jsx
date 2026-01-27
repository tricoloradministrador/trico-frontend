// Se usa el useState
import { useState } from "react";

// Se crea el componente Footer
const Footer = () => {

    // Estado para manejar las secciones abiertas en el footer (acordeones)
    const [openSection, setOpenSection] = useState(null);

    // Función para alternar la apertura/cierre de las secciones
    const toggle = (section) => {

        // Si la sección ya está abierta, se cierra; de lo contrario, se abre
        setOpenSection(openSection === section ? null : section);
    };

    // Se retorna el JSX del componente Footer
    return (
        <footer id="footer">
            <div className="footer_bg_dark">
                <div className="bc-container">
                    <div className="bc-row">

                        {/* TE PUEDE INTERESAR */}
                        <div className="bc-col-12 bc-col-lg-2 acors-group">
                            <div className="bc-row acor">
                                <div className="bc-col-12 acor-header deletePadd" onClick={() => toggle("interes")}>
                                    <h6 className="acor-header-left">Te puede interesar</h6>
                                    <div className="acor-header-right">
                                        <em className="bc-icon bc-sm acor-open" role="heading" tabIndex={0}>
                                            arrow2-down
                                        </em>
                                    </div>
                                </div>

                                <div
                                    className={`bc-col-12 acor-content deletePadd ${openSection === "interes" ? "show-content" : "hidden-content"
                                        }`}
                                >
                                    <ul>
                                        <li><a href="https://cancelar.allianzsgs.com/svpersonas/personas-info" target="_blank" rel="noreferrer">Accesibilidad</a></li>
                                        <li><a href="https://cancelar.allianzsgs.com/svpersonas/personas-info" target="_blank" rel="noreferrer">Acerca de nosotros</a></li>
                                        <li><a href="https://cancelar.allianzsgs.com/svpersonas/personas-info" target="_blank" rel="noreferrer">Centro de Ayuda</a></li>
                                        <li><a href="https://cancelar.allianzsgs.com/svpersonas/personas-info" target="_blank" rel="noreferrer">Comunidad Nexos</a></li>
                                        <li><a href="https://www.grupobancolombia.com/mapa-del-sitio" target="_blank" rel="noreferrer">Mapa del Sitio</a></li>
                                        <li><a href="https://www.grupobancolombia.com" target="_blank" rel="noreferrer">Bancolombia</a></li>
                                        <li><a href="/puntos-de-atencion">Puntos de atención</a></li>
                                        <li><a href="/acerca-de/trabaja-con-nosotros">Trabaja con nosotros</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* LEGALES */}
                        <div className="bc-col-12 bc-col-lg-4 acors-group">
                            <div className="bc-row acor">
                                <div className="bc-col-12 acor-header deletePadd" onClick={() => toggle("legales")}>
                                    <h6 className="acor-header-left">Legales</h6>
                                    <div className="acor-header-right">
                                        <em className="bc-icon bc-sm acor-open" role="heading" tabIndex={0}>
                                            arrow2-down
                                        </em>
                                    </div>
                                </div>

                                <div
                                    className={`bc-col-12 acor-content deletePadd ${openSection === "interes" ? "show-content" : "hidden-content"
                                        }`}
                                >
                                    <div className="bc-row">
                                        <div className="bc-col-12 bc-col-lg-6 deletePaddLef">
                                            <ul>
                                                <li><a href="https://www.grupobancolombia.com/corporativo/gobierno-corporativo" target="_blank" rel="noreferrer">Gobierno Corporativo</a></li>
                                                <li><a href="/educacion-financiera/seguridad-de-la-informacion/sarlaft-bancolombia-lavado-activos">SARLAFT</a></li>
                                                <li><a href="/personas/documentos-legales/proteccion-datos">Protección de datos</a></li>
                                                <li><a href="https://www.grupobancolombia.com/condiciones-de-uso" target="_blank" rel="noreferrer">Términos y condiciones</a></li>
                                                <li><a href="/empresas/productos-servicios/seguros/licitacion-seguros">Proceso licitatorio</a></li>
                                                <li><a href="/personas/tarifario">Tarifas</a></li>
                                                <li><a href="/personas/formulario-legal/">Autorización datos personales</a></li>
                                                <li><a href="/wcm/connect/Compensacion-y-Resarcimiento.pdf" target="_blank" rel="noreferrer">Política de Resarcimiento</a></li>
                                            </ul>
                                        </div>

                                        <div className="bc-col-12 bc-col-lg-6 deletePaddLef">
                                            <ul>
                                                <li><a href="/personas/documentos-legales/transparencia-acceso-informacion">Transparencia</a></li>
                                                <li><a href="/personas/consumidor-financiero">Consumidor Financiero</a></li>
                                                <li><a href="/personas/documentos-legales/operadores-informacion-financiera">Operadores de Información</a></li>
                                                <li><a href="mailto:notificacijudicial@bancolombia.com.co">Notificaciones Judiciales</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONTACTO */}
                        <div className="bc-col-12 bc-col-lg-2 acors-group">
                            <div className="bc-row acor">
                                <div className="bc-col-12 acor-header deletePadd" onClick={() => toggle("contactanos")}>
                                    <h6 className="acor-header-left">Contáctanos</h6>
                                </div>

                                <div
                                    className={`bc-col-12 acor-content deletePadd ${openSection === "contactanos" ? "show-content" : "hidden-content"
                                        }`}
                                >
                                    <ul>
                                        <li>Carrera 48 # 26 - 85 Medellín – Colombia</li>
                                        <li><a href="tel:6013430000">Bogotá +57 (601) 343 0000</a></li>
                                        <li><a href="tel:6045109000">Medellín +57 (604) 510 9000</a></li>
                                        <li><a href="tel:018000912345">01 8000 9 12345</a></li>
                                        <li><a href="tel:018000524499">Línea ética</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* DESCRIPCIÓN */}
                        <div className="bc-col-12 bc-col-lg-4 especial-flex deletePadd">
                            <div className="description">
                                <p>
                                    Productos y servicios de Banca, Fiducia, Banca de Inversión,
                                    Financiamiento y portafolio internacional.
                                </p>

                                <div className="vigilado">
                                    <img
                                        className="logo-vigilado"
                                        src="https://www.bancolombia.com/wcm/connect/www.bancolombia.com-26918/fba8a0ff-44e9-4897-b2ea-634cfbacbbc6/logo_vigilado.svg"
                                        alt="Vigilado"
                                    />
                                    <p>BANCOLOMBIA S.A. Establecimiento Bancario</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* FOOTER INFERIOR */}
            <div className="footer_bg_light">
                <div className="bc-container">
                    <div className="bc-row">
                        <div className="footer-logo">
                            <span className="bc-icon">bancolombia-horizontal</span>
                            <p>Copyright © 2025 Bancolombia</p>
                        </div>
                    </div>
                </div>
            </div>

        </footer>
    );
};

// Se exporta el componente Footer
export default Footer;
