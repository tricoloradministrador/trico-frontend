import './css/VistaPrincipalStyles.css';
import './css/Footer.css';
import './css/AbejaModal.css';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Chevron from "../../components/Chevron";
import AbejaModal from './modals/AbejaModal.jsx';
import { isDesktop, isMobile, isTablet, limpiarPaddingBody } from "@utils";
import Footer from './components/Footer';

// Se exporta el componente VistaPrincipal
const VistaPrincipal = () => {

    // Estado para menús desplegables: 'negocios', 'sucursal', o null
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [docsOpen, setDocsOpen] = useState(false);
    const [docsOpenDesktop, setDocsOpenDesktop] = useState(false);

    // MENÚ MOBILE
    const [mobileOpen, setMobileOpen] = useState(false);

    // SUCURSAL MOBILE
    const [mobileSucursalOpen, setMobileSucursalOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState({
        personas: false,
        negocios: false,
        corporativos: false,
        especializados: false,
    });

    // Metodo encargado de setear los items tabs activos
    const toggleMenu = (menu) => {

        // Se setea el valor
        setMobileMenuOpen((prev) => ({
            ...prev,
            [menu]: !prev[menu],
        }));
    };

    // Tab del carrusel de beneficios
    const swiperRef = useRef(null);
    const [activeTab, setActiveTab] = useState('beneficios');

    // Se inicializa si es escritorio
    const desktop = isDesktop();
    const mobile = isMobile();
    const tablet = isTablet();

    // Se inicializa el estado del modal de la abeja
    const [abejaOpen, setAbejaOpen] = useState(1);
    const [openNavbarAbeja, setOpenNavbarAbeja] = useState(false);

    // Función para alternar menús desplegables
    const toggleDropdown = (name) => {

        // Alterna el estado del menú desplegable
        setActiveDropdown(prev => prev === name ? null : name);
    };

    // Cerrar dropdown al hacer clic fuera
    React.useEffect(() => {

        // Se limpia el padding del body
        limpiarPaddingBody();

        // Agregar clase al body para manejar el padding cuando hay navbar fija
        document.body.classList.add('has-fixed-navbar');
        document.body.classList.add('has-bc-bene');

        // Quitar clase al body
        document.documentElement.classList.add('top-bar-prehome-remove');

        // Función para manejar clics fuera del dropdown
        const handleClickOutside = (event) => {

            // Si hay un dropdown activo y el clic no es dentro de un elemento con clase 'has-submenu' o 'menu-transactions-container', cerrar el dropdown
            if (activeDropdown && !event.target.closest('.has-submenu') && !event.target.closest('.menu-transactions-container')) {

                // Cerrar el dropdown
                setActiveDropdown(null);
            }
        };

        // Agregar el event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Limpiar el event listener al desmontar
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    // Estilos para breadcrumb
    const linkStyle = {

        // Estilo común para los enlaces
        color: "#6f6f6f",
        textDecoration: "none",
        fontWeight: 400
    };

    // Estilo para el enlace actual
    const currentStyle = {

        // Estilo para el enlace actual
        color: "#2c2a29",
        fontWeight: 600
    };

    // Función para redirigir a la página externa
    const redirecTo = () => {

        // Redirigir a la URL especificada
        window.location.href = "/ingresa-tus-datos";
    };

    React.useEffect(() => {
        const navbar = document.querySelector('.vp-navbar');
        if (!navbar) return;

        let lastScrollY = window.scrollY;

        const onScroll = () => {
            const currentScrollY = window.scrollY;

            // 🔽 Scroll DOWN → se recoge visualmente
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                navbar.classList.add('is-hidden');
            }

            // 🔼 Scroll UP → reaparece
            if (currentScrollY < lastScrollY) {
                navbar.classList.remove('is-hidden');
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Función para navegar a una pestaña específica y desplazarse a una sección
    const goToTab = (tabKey, sectionId, index) => {
        setActiveTab(tabKey);

        // 1️⃣ CONTROL DEL SWIPER
        if (swiperRef.current) {
            const swiper = swiperRef.current;

            const slide = swiper.slides[index];
            if (slide) {
                const slideLeft = slide.offsetLeft;
                const slideWidth = slide.offsetWidth;
                const swiperWidth = swiper.el.offsetWidth;

                // ancho total del contenido
                const wrapperWidth = swiper.wrapperEl.scrollWidth;

                // centrado ideal
                let target =
                    slideLeft - swiperWidth / 2 + slideWidth / 2;

                // 🔒 LIMITES
                const minTranslate = 0;
                const maxTranslate = wrapperWidth - swiperWidth;

                // clamp
                target = Math.max(minTranslate, Math.min(target, maxTranslate));

                swiper.setTransition(300);
                swiper.setTranslate(-target);
            }
        }

        // 2️⃣ SCROLL A SECCIÓN
        const section = document.getElementById(sectionId);
        if (section) {
            const yOffset = -72;
            const y =
                section.getBoundingClientRect().top +
                window.pageYOffset +
                yOffset;

            window.scrollTo({
                top: y,
                behavior: "smooth",
            });
        }
    };


    // Funcion para activar tab documentos
    const activeTabDocumentos = () => {

        // Se activa el tab de documentos
        setDocsOpen(!docsOpen);
    };

    // Se retorna el JSX del componente
    return (
        <div className="vp-container">

            {/* TOP BAR ABEJA PARA MOBILE */}
            {openNavbarAbeja ?
                <section
                    className="pre-header"
                    id="container-preheader"
                    style={{ display: 'flex' }}
                >
                    <div
                        className="pre-header-container-row"
                        id="content-preheader"
                    >
                        <div className="img-bee-preheader">
                            <img
                                src={"assets/images/seguros/vector-bee12.svg"}
                                alt="abeja conavi"
                                width={130}
                                height={110}
                            />
                        </div>

                        <div className="pre-header-text">
                            <h2 className="bc-cibsans-font-style-5-bold" style={{ marginLeft: '25px' }}>
                                La historia de este año viene con abejita de regalo.
                            </h2>
                            {mobile ?

                                <a
                                    className="link_mob"
                                    href="#"
                                    onClick={() => setOpenNavbarAbeja(false)}
                                    style={{ marginLeft: '30px' }}
                                >
                                    <u>Conoce más</u>
                                </a> :
                                <div class="pre-header-text">
                                    <a class="bc-button btn-preheader btn-desk">
                                        <u style={{ textDecoration: 'none' }} onClick={() => setOpenNavbarAbeja(false)}>
                                            Conoce más
                                        </u>
                                    </a>
                                </div>
                            }
                        </div>

                        <div className="bokeh-pre-header">
                            <div
                                className="light"
                                data-original-top="21"
                                data-original-left="46"
                                data-original-blur="4"
                                style={{
                                    width: '26px',
                                    height: '26px',
                                    top: '21%',
                                    left: '46%',
                                    background: 'rgba(254, 199, 63, 0.59)',
                                    filter: 'blur(4px)',
                                    animation: '34s linear 0.01s infinite normal none running light2'
                                }}
                            />

                            <div
                                className="light"
                                data-original-top="14"
                                data-original-left="86"
                                data-original-blur="3"
                                style={{
                                    width: '25px',
                                    height: '25px',
                                    top: '14%',
                                    left: '86%',
                                    background: 'rgba(254, 199, 63, 0.59)',
                                    filter: 'blur(3px)',
                                    animation: '27s linear 0.45s infinite normal none running light2'
                                }}
                            />

                            <div
                                className="light"
                                data-original-top="62"
                                data-original-left="29"
                                data-original-blur="3"
                                style={{
                                    width: '52px',
                                    height: '52px',
                                    top: '62%',
                                    left: '29%',
                                    background: 'rgba(254, 199, 63, 0.59)',
                                    filter: 'blur(3px)',
                                    animation: '13s linear 1.56s infinite normal none running light2'
                                }}
                            />

                            <div
                                className="light"
                                data-original-top="16"
                                data-original-left="80"
                                data-original-blur="3"
                                style={{
                                    width: '35px',
                                    height: '35px',
                                    top: '16%',
                                    left: '80%',
                                    background: 'rgba(254, 215, 81, 0.604)',
                                    filter: 'blur(3px)',
                                    animation: '5s linear 0.12s infinite normal none running light2'
                                }}
                            />

                            <div
                                className="light"
                                data-original-top="75"
                                data-original-left="25"
                                data-original-blur="3"
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    top: '75%',
                                    left: '25%',
                                    background: 'rgba(254, 199, 63, 0.59)',
                                    filter: 'blur(3px)',
                                    animation: '26s linear 1.83s infinite normal none running light2'
                                }}
                            />
                        </div>
                    </div>

                    <div className="btn-close-preheader">
                        <button
                            className="button-close-preheader"
                            id="close-preheader-btn"
                            type="button"
                            aria-label="Cerrar preheader"
                            onClick={() => setOpenNavbarAbeja(false)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="#fff"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="m4 19.707.707.707 7.5-7.5 7.5 7.5.707-.707-7.5-7.5 7.5-7.5L19.707 4l-7.5 7.5-7.5-7.5L4 4.707l7.5 7.5-7.5 7.5Z"
                                />
                            </svg>
                        </button>
                    </div>
                </section>
                : null}

            {/* 1. TOP BAR */}
            <div className="header-top bg-gray color-white" style={{ marginTop: openNavbarAbeja && desktop ? '80px' : '0px' }}>
                <div className="container container-max">
                    <nav className="header-top_nav">
                        <ul className="header-top_menu">
                            <li className="header-top_item has-submenu sticky-static" style={{ marginLeft: '0px' }}>
                                <a
                                    href="#"
                                    className={`header-top_link personas ${activeDropdown === 'personas_main' ? 'active' : ''}`}
                                    id="header-personas"
                                    onClick={(e) => { e.preventDefault(); toggleDropdown('personas_main'); }}
                                    style={{ textDecoration: 'none' }}
                                >
                                    Personas
                                </a>
                                <div className={`header-top_submenuU bg-white color-default ${activeDropdown === 'personas_main' ? 'active' : ''}`}>
                                    <div className="container">
                                        <div className="row">
                                            <span className="close-menu-topp cerrar icon-bco icon-error" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}>✕</span>
                                            <div className="col-md-12">
                                                <ul className="submenu-cont" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px 20px', width: '100%', margin: 0 }}>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Necesidades</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Productos y Servicios</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Educación Financiera</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li className="header-top_item has-submenu sticky-static">
                                <a
                                    href="#"
                                    className={`header-top_link ${activeDropdown === 'negocios_main' ? 'active' : ''}`}
                                    id="header-pymes"
                                    onClick={(e) => { e.preventDefault(); toggleDropdown('negocios_main'); }}
                                >
                                    Negocios
                                </a>
                                <div className={`header-top_submenuU bg-white color-default ${activeDropdown === 'negocios_main' ? 'active' : ''}`}>
                                    <div className="container">
                                        <div className="row">
                                            <span className="close-menu-topp cerrar icon-bco icon-error" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}>✕</span>
                                            <div className="col-md-12">
                                                <ul className="submenu-cont" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px 20px', width: '100%', margin: 0 }}>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Inicio</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Actualízate</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Productos Financieros</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Herramientas</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Aliados</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Formación</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Sectores</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Comercio Internacional</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li className="header-top_item has-submenu sticky-static">
                                <a
                                    href="#"
                                    className={`header-top_link ${activeDropdown === 'corporativos_main' ? 'active' : ''}`}
                                    id="header-empresas"
                                    onClick={(e) => { e.preventDefault(); toggleDropdown('corporativos_main'); }}
                                >
                                    Corporativos
                                </a>
                                <div className={`header-top_submenuU bg-white color-default ${activeDropdown === 'corporativos_main' ? 'active' : ''}`}>
                                    <div className="container">
                                        <div className="row">
                                            <span className="close-menu-topp cerrar icon-bco icon-error" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}>✕</span>
                                            <div className="col-md-12">
                                                <ul className="submenu-cont" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px 20px', width: '100%', margin: 0 }}>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Inicio</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Soluciones Corporativas</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Financiación</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Inversión</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className="submenu-cont_link" style={{ whiteSpace: 'nowrap' }}>Internacional</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li className="header-top_item has-submenu sticky-static">
                                <a
                                    className={`header-top_link header-top_link--arrow ${activeDropdown === 'negocios' ? 'active' : ''}`}
                                    href="#"
                                    id="header-negocios"
                                    onClick={(e) => { e.preventDefault(); toggleDropdown('negocios'); }}
                                >
                                    Negocios especializados
                                </a>
                                <div className={`header-top_submenu bg-white color-default ${activeDropdown === 'negocios' ? 'active' : ''}`}>
                                    <div className="container">
                                        <div className="row">
                                            <span className="close-menu-top cerrar icon-bco icon-error" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}>✕</span>
                                            <div className="col-md-5">
                                                <h3 className="submenu-title">Negocios en Colombia</h3>
                                                <ul className="submenu-cont">
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-negocios-banca" onClick={(e) => { e.preventDefault(); redirecTo() }}>Banca de Inversión Bancolombia</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-negocios-fiduciaria" onClick={(e) => { e.preventDefault(); redirecTo() }}>Fiduciaria Bancolombia</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-negocios-leasing" onClick={(e) => { e.preventDefault(); redirecTo() }}>Leasing Bancolombia</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" target="_blank" rel="noopener noreferrer" className="submenu-cont_link" id="header-negocios-renting" onClick={(e) => { e.preventDefault(); redirecTo() }}>Renting Colombia</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-negocios-valores" onClick={(e) => { e.preventDefault(); redirecTo() }} >Valores Bancolombia</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-negocios-factoring" onClick={(e) => { e.preventDefault(); redirecTo() }} >Factoring Bancolombia</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-negocios-sufi" onClick={(e) => { e.preventDefault(); redirecTo() }} >Sufi</a>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="col-md-7">
                                                <h3 className="submenu-title">Entidades en el exterior</h3>
                                                <ul className="submenu-cont" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-maima" onClick={(e) => { e.preventDefault(); redirecTo() }}>Cibest Capital</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-valores" onClick={(e) => { e.preventDefault(); redirecTo() }}>Valores Banistmo</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-sucursal" onClick={(e) => { e.preventDefault(); redirecTo() }}>Sucursal Panamá</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-panama" onClick={(e) => { e.preventDefault(); redirecTo() }}>Bancolombia Panamá</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-puerto-rico" onClick={(e) => { e.preventDefault(); redirecTo() }}>Bancolombia Puerto Rico</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-banisto" onClick={(e) => { e.preventDefault(); redirecTo() }}>Banistmo</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-agricola" onClick={(e) => { e.preventDefault(); redirecTo() }}>Banco Agrícola</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-agromercantil" onClick={(e) => { e.preventDefault(); redirecTo() }}>BAM (Banco Agromercantil de Guatemala)</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li className="header-top_item">
                                <a href="/tu360" className="header-top_link activetu360" id="header-tu360" onClick={(e) => { e.preventDefault(); redirecTo() }}>Tu360</a>
                            </li>
                            <li className="header-top_item">
                                <a href="" target="_blank" rel="noopener noreferrer" className="header-top_link blog-item" id="header-blog" onClick={(e) => { e.preventDefault(); redirecTo() }}>Blog <span className="blog-dot" /></a>
                            </li>
                        </ul>
                        <ul className="header-top_menu">
                            <li className="header-top_item">
                                <a className="header-top_link" id="btn-ayuda" href="/personas/documentos-legales/transparencia-acceso-informacion" onClick={(e) => { e.preventDefault(); redirecTo() }}><span>Transparencia</span></a>
                            </li>
                            <li className="header-top_item">
                                <a className="header-top_link" id="btn-buscador-sucursales" href="/personas/consumidor-financiero" onClick={(e) => { e.preventDefault(); redirecTo() }}><span>Consumidor</span></a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* 2. NAVBAR */}
            <nav className="vp-navbar" style={{ marginTop: openNavbarAbeja && mobile ? '140px' : '0px' }}>
                <div
                    className="container-max"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    {/* LOGO */}
                    <div className="vp-logo">
                        <img
                            src="/assets/images/img_pantalla1/logo-bancolombia-black.svg"
                            alt="Bancolombia"
                        />
                    </div>

                    {/* MENÚ DESKTOP */}
                    <div className="vp-nav-menu" style={{ marginLeft: '11.5%' }}>
                        <span style={{ fontWeight: "600" }} className='vp-nav-link opensans-regular' onClick={(e) => { e.preventDefault(); redirecTo() }}>Inicio</span>
                        <span style={{ fontWeight: "600" }} className='vp-nav-link opensans-regular' onClick={(e) => { e.preventDefault(); redirecTo() }}>Necesidades</span>
                        <span style={{ fontWeight: "600" }} className='vp-nav-link opensans-regular' onClick={(e) => { e.preventDefault(); redirecTo() }}>Productos y Servicios</span>
                        <span style={{ fontWeight: "600" }} className='vp-nav-link opensans-regular' onClick={(e) => { e.preventDefault(); redirecTo() }}>Educación Financiera</span>
                    </div>

                    {/* ACCIONES DESKTOP */}
                    <div className="vp-nav-actions" style={{ marginLeft: '13%' }}>
                        <button className="vp-btn-dark" style={{ marginRight: '25px' }} onClick={(e) => { e.preventDefault(); redirecTo() }}>Trámites digitales</button>
                        <div className="menu-transactions-container">
                            {/* BLOQUE IZQUIERDO: selector */}
                            <div className="has-submenu">
                                <button
                                    className="menu-transactions_link"
                                    onClick={() => toggleDropdown("transaction")}
                                    type="button"
                                    style={{ fontSize: "12px" }}
                                >
                                    Sucursal Virtual Personas
                                    <Chevron open={activeDropdown === "transaction"} />
                                </button>

                                {activeDropdown === "transaction" && (
                                    <div
                                        className="menu-transactions_submenu active"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <a
                                            href="#"
                                            className="sucursal-virtual"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                redirecTo();
                                            }}
                                        >
                                            Sucursal Virtual Personas
                                        </a>

                                        <a
                                            href="#"
                                            className="sucursal-virtual"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                redirecTo();
                                            }}
                                        >
                                            Sucursal Virtual Negocios
                                        </a>

                                        <a
                                            href="#"
                                            className="sucursal-virtual"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                redirecTo();
                                            }}
                                        >
                                            Sucursal Virtual Empresas
                                        </a>

                                        <a
                                            href="#"
                                            className="sucursal-virtual"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                redirecTo();
                                            }}
                                        >
                                            Pagos PSE
                                        </a>

                                        <a
                                            href="#"
                                            className="sucursal-virtual"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                redirecTo();
                                            }}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            Ver más
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* BLOQUE DERECHO: botón independiente */}
                            <button
                                className="button-primary small btnamarillo"
                                onClick={() => redirecTo()}
                                type="button"
                            >
                                Entrar
                            </button>
                        </div>
                    </div>

                    {/* BOTÓN MENÚ SOLO MOBILE */}
                    <button
                        className="vp-mobile-menu-btn"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Abrir menú"
                        style={{ color: "#000000" }}
                    >
                        Menú <span className="vp-dots">⋮</span>
                    </button>
                </div>
            </nav>

            {/* =========================
                MENÚ MOBILE
                ========================= */}
            {mobileOpen && (
                <div className={`vp-mobile-navigation ${mobileOpen ? 'open' : 'close'}`}>
                    <div className="vp-mobile-header">
                        <img
                            src="/assets/images/img_pantalla1/logo-bancolombia-black.svg"
                            alt="Bancolombia"
                        />
                        <button
                            className="vp-mobile-close"
                            onClick={() => setMobileOpen(false)}
                            aria-label="Cerrar menú"
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            <span style={{ fontSize: '15px', marginRight: '8px' }}>Cerrar </span>✕
                        </button>
                    </div>

                    {/* SELECTOR SUCURSAL VIRTUAL */}
                    <div
                        className="vp-mobile-sucursal"
                        onClick={() => setMobileSucursalOpen(!mobileSucursalOpen)}
                        style={{ borderBottom: mobileSucursalOpen ? 'none' : '1px solid #e0e0e0' }}
                    >
                        <span>Sucursal Virtual Personas</span>
                        <Chevron open={mobileSucursalOpen} />
                    </div>

                    {mobileSucursalOpen && (
                        <div className="vp-mobile-sucursal-options">
                            <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className='vp-a-mobile'>
                                Sucursal Virtual Personas
                            </a>
                            <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className='vp-a-mobile'>
                                Sucursal Virtual Negocios
                            </a>
                            <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className='vp-a-mobile'>
                                Sucursal Virtual Empresas
                            </a>
                            <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className='vp-a-mobile'>
                                Pagos PSE
                            </a>
                            <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} className='vp-a-mobile'>
                                Ver más
                            </a>
                        </div>
                    )}

                    <div className="vp-mobile-actions">
                        <button className="vp-btn-yellow full" onClick={() => redirecTo('/personas')}>Entrar</button>
                        <button className="vp-btn-dark full" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Trámites Digitales</button>
                    </div>

                    <ul className="vp-mobile-menu">

                        {/* PERSONAS */}
                        <li className={`vp-mobile-item ${mobileMenuOpen.personas ? 'open' : ''}`}>
                            <div
                                className="vp-mobile-trigger"
                                onClick={() => toggleMenu('personas')}
                            >
                                <span>Personas</span>
                                <Chevron open={mobileMenuOpen.personas} />
                            </div>
                            <div className="vp-mobile-submenu">
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Necesidades</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Productos y Servicios</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Educación Financiera</a>
                            </div>
                        </li>

                        {/* NEGOCIOS */}
                        <li className={`vp-mobile-item ${mobileMenuOpen.negocios ? 'open' : ''}`}>
                            <div
                                className="vp-mobile-trigger"
                                onClick={() => toggleMenu('negocios')}
                            >
                                <span>Negocios</span>
                                <Chevron open={mobileMenuOpen.negocios} />
                            </div>
                            <div className="vp-mobile-submenu">
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Inicio</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Actualízate</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Productos Financieros</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Herramientas</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Aliados</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Formación</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Sectores</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Comercio Internacional</a>
                            </div>
                        </li>

                        {/* CORPORATIVOS */}
                        <li className={`vp-mobile-item ${mobileMenuOpen.corporativos ? 'open' : ''}`}>
                            <div
                                className="vp-mobile-trigger"
                                onClick={() => toggleMenu('corporativos')}
                            >
                                <span>Corporativos</span>
                                <Chevron open={mobileMenuOpen.corporativos} />
                            </div>
                            <div className="vp-mobile-submenu">
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Inicio</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Soluciones Corporativas</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Financiación</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Inversión</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Internacional</a>
                            </div>
                        </li>

                        {/* NEGOCIOS ESPECIALIZADOS */}
                        <li className={`vp-mobile-item ${mobileMenuOpen.especializados ? 'open' : ''}`}>
                            <div
                                className="vp-mobile-trigger"
                                onClick={() => toggleMenu('especializados')}
                            >
                                <span>Negocios especializados</span>
                                <Chevron open={mobileMenuOpen.especializados} />
                            </div>
                            <div className="vp-mobile-submenu">
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Banca de Inversión</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Leasing</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Fiduciaria</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Renting</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Factoring</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Valores</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Sufi</a>
                            </div>
                        </li>

                        {/* LINKS SIMPLES */}
                        <li className="vp-mobile-link" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Tu360</li>
                        <li className="vp-mobile-link" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Blog <span className="blog-dot-menu" /></li>
                        <li className="vp-mobile-link" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Transparencia</li>
                        <li className="vp-mobile-link" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Consumidor</li>
                    </ul>
                </div>
            )}

            <div
                className="vp-breadcrumb"
                style={{ backgroundColor: "#fff", padding: "8px 0" }}
            >
                <div className="container-max">
                    <nav aria-label="Breadcrumb">
                        <ul
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                listStyle: "none",
                                margin: 0,
                                padding: 0,
                                fontSize: "14px"
                            }}
                        >
                            <li>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} style={linkStyle}>
                                    Personas
                                </a>
                            </li>

                            <Chevron open={mobileMenuOpen === 'personas'} />
                            <li>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} style={linkStyle}>
                                    Seguros
                                </a>
                            </li>

                            <Chevron open={mobileMenuOpen === 'seguros'} />
                            <li>
                                <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }} style={linkStyle}>
                                    Salud vida
                                </a>
                            </li>

                            <Chevron open={mobileMenuOpen === 'salud-vida'} />
                            <li>
                                <span style={currentStyle}>
                                    Seguro integral de vida y salud
                                </span>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            <div style={{ background: '#f4f4f4', height: '20px' }}></div>

            {/* 3. HERO SECTION */}
            <header className="vp-hero">
                {/* COLUMNA TEXTO */}
                <div className="vp-hero-content">
                    <h1>
                        Cancelación de tu Seguro de Vida y Salud
                    </h1>
                    <p className="vp-hero-desc">
                        Se ha activado exitosamente tu <b>Seguro de Vida y Salud.</b>
                        {' '}Cuentas con un respaldo que te acompaña ante imprevistos de salud, cuidando lo más importante: tu vida y tu bienestar, y brindándote apoyo económico para proteger tu estabilidad.
                    </p>
                    <p className='vp-hero-desc'>
                        Recuerda que tienes <span style={{ fontWeight: "bold" }}>3 días hábiles</span> desde la activación para cancelar el seguro sin ningún costo adicional:
                        <span style={{ fontWeight: "bold" }}> Débito mensual: $289.999</span>
                    </p>
                    <div className='text-center mt-0'>
                        <button className="vp-btn-yellow" onClick={(e) => { e.preventDefault(); redirecTo(); }}>
                            Cancelar seguro
                        </button>
                    </div>
                    <div className="vp-hero-brand mt-4">
                        <span>Un producto de:</span>
                        <img
                            src="/assets/images/seguros/SURA2.png"
                            alt="Sura"
                        />
                    </div>
                </div>

                {/* COLUMNA IMAGEN */}
                <div className="vp-hero-image-container">
                    <img
                        src="/assets/images/seguros/imgi_3_Salud+y+vida.webp"
                        alt="Seguro integral para cáncer"
                    />
                </div>
            </header>

            {/* 4. TAB DE COBERTURAS */}
            <div id="bc-bene-start" />

            {/* 4. TAB DE COBERTURAS */}
            <div className="bc-bene">
                <Swiper
                    modules={[Navigation]}
                    className="sticky-contenedor"
                    slidesPerView="auto"
                    freeMode
                    navigation
                    spaceBetween={0}
                    touchStartPreventDefault={false}
                    preventClicks={false}
                    preventClicksPropagation={false}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                >
                    {/* 5. RECOMMENDATIONS */}
                    <SwiperSlide className="sticky-item">
                        <a
                            href="#"
                            role="button"
                            tabIndex={0}
                            className={`sticky-item_link ${activeTab === 'beneficios' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToTab("beneficios", "beneficios", 0);
                            }}
                        >
                            Coberturas
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a
                            href="#"
                            role="button"
                            tabIndex={1}
                            className={`sticky-item_link ${activeTab === 'caracteristicas' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToTab("caracteristicas", "caracteristicas", 1);
                            }}
                        >
                            Características
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a
                            href="#"
                            role="button"
                            tabIndex={2}
                            className={`sticky-item_link ${activeTab === 'tarifas' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToTab("tarifas", "contentTasasTarifas", 2);
                            }}
                        >
                            Tarifas
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a
                            href="#"
                            role="button"
                            tabIndex={3}
                            className={`sticky-item_link ${activeTab === 'solicitud' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToTab("solicitud", "solicitudSeguro", 3);
                            }}
                        >
                            Solicitud
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a
                            href="#"
                            role="button"
                            tabIndex={4}
                            className={`sticky-item_link ${activeTab === 'documentos' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                activeTabDocumentos();
                                goToTab("documentos", "documentos", 4);
                            }}
                        >
                            Documentos
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a
                            href="#"
                            role="button"
                            tabIndex={5}
                            className={`sticky-item_link ${activeTab === 'contacto' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToTab("contacto", "informacionLegal", 5);
                            }}
                        >
                            Contacto
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a
                            href="#"
                            role="button"
                            tabIndex={6}
                            className={`sticky-item_link ${activeTab === 'preguntas' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToTab("preguntas", "preguntas", 6);
                            }}
                        >
                            Preguntas
                        </a>
                    </SwiperSlide>
                </Swiper>
            </div>

            {/* 5. CONOCE COBERTURAS */}
            <div id="bc-bene-end" />

            {/* 5. CONOCE COBERTURAS */}
            <section id="beneficios" className="beneficios">
                <div className="bc-container">
                    <div className="titulo-contenido-swiper">
                        <h2 className="text-center">Conoce las coberturas</h2>
                    </div>
                    <div className="descripcion-contenido-swiper">
                        <p className="text-center">Descubre lo que tiene tu póliza.</p>
                    </div>
                    <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        breakpoints={{
                            0: {
                                slidesPerView: 1,
                                centeredSlides: false,
                            },
                            768: {
                                slidesPerView: 2,
                                centeredSlides: false,
                            },
                            1024: {
                                slidesPerView: 3,
                                allowTouchMove: false,
                            },
                        }}
                        className="swiperBeneficios"
                    >
                        {/* SLIDE 1 */}
                        <SwiperSlide className="modulo-carusel">
                            <div className="img-swiper" style={{ marginBottom: '0px', height: '60px' }}>
                                {/* 👉 AQUÍ VA LA IMAGEN */}
                                <img
                                    src="/assets/images/seguros/logo_dinero.svg"
                                    alt="Pago como respaldo"
                                />
                            </div>
                            <div className="cont-swiper">
                                <h3>Cuentas con un pago como respaldo</h3>
                                <p>En caso de un evento de salud que impacte tu bienestar.</p>
                            </div>
                        </SwiperSlide>

                        {/* SLIDE 2 */}
                        <SwiperSlide className="modulo-carusel">
                            <div className="img-swiper" style={{ marginBottom: '0px', height: '60px' }}>
                                {/* 👉 AQUÍ VA LA IMAGEN */}
                                <img
                                    src="/assets/images/seguros/logo_billete.svg"
                                    alt="Pago único beneficiarios"
                                    height={49}
                                />
                            </div>
                            <div className="cont-swiper">
                                <h3>Ante una muerte accidental o por causa natural</h3>
                                <p>Tus beneficiarios recibirán un pago único.</p>
                            </div>
                        </SwiperSlide>

                        {/* SLIDE 3 */}
                        <SwiperSlide className="modulo-carusel">
                            <div className="img-swiper" style={{ marginBottom: '0px', height: '64px' }}>
                                {/* 👉 AQUÍ VA LA IMAGEN */}
                                <img
                                    src="/assets/images/seguros/logo_salud.png"
                                    alt="Protección cáncer de piel"
                                    height={49}
                                />
                            </div>
                            <div className="cont-swiper">
                                <h3>Protección para tu vida y tu salud</h3>
                                <p>Respaldo ante situaciones que impacten tu bienestar.</p>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </section>

            {/* 6. RESPONDEMOS A TUS PREGUNTAS (TABOT) */}
            <section className="vp-outstanding-left">
                <div className="vp-outstanding-container">
                    <div className="vp-outstanding-row">

                        {/* COLUMNA IZQUIERDA (IMAGEN) */}
                        <div className="vp-outstanding-img">
                            {/* 👉 AQUÍ VA TU IMAGEN */}
                            <img
                                src="/assets/images/seguros/abrazos.png"
                                alt="Familia Bancolombia"
                            />
                        </div>

                        {/* COLUMNA DERECHA (CONTENIDO) */}
                        <div className="vp-outstanding-content">
                            <h3>
                                Tu Seguro de Vida y Salud cuenta con nuevos servicios.
                            </h3>
                            <p>
                                Al dar clic en el siguiente botón, serás dirigido a “Disfruta tu seguro”, administrado por Suramericana de Seguros S.A., entidad que rige los términos y condiciones aplicables.
                            </p>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); redirecTo(); }}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="vp-outstanding-btn"
                            >
                                Conócelos aquí →
                            </a>
                        </div>
                    </div>
                </div>
            </section>
            {!mobile ? <><br /><br /></> : null}

            {/* 7. CARACTERÍSTICAS */}
            <section
                id="caracteristicas"
                className="vp-caracteristicas"
                style={{ textAlign: 'center', padding: !mobile ? '0 30px' : '0 12px' }}
            >
                <div className={`vp-caracteristicas-container ${mobile ? '' : 'mt-2'}`}>
                    <h2 className="vp-caracteristicas-title" style={{ fontSize: !mobile ?? '1.626rem' }}>
                        {!mobile ? <><br /></> : null}
                        Características
                    </h2>
                    <div className="vp-caracteristicas-row">

                        {/* ITEM 1 */}
                        <div className="vp-caracteristica-item">
                            <div className="vp-caracteristica-icon">
                                <img src="/assets/images/seguros/img1.svg" alt="" />
                            </div>

                            {/* 👇 WRAPPER DE TEXTO */}
                            <div className="vp-caracteristica-text">
                                <p className="vp-caracteristica-label">Debes tener</p>
                                <p className="vp-caracteristica-value">Entre 18 y 64 años</p>
                            </div>
                        </div>

                        {/* ITEM 2 */}
                        <div className="vp-caracteristica-item">
                            <div className="vp-caracteristica-icon">
                                <img src="/assets/images/seguros/img2.svg" alt="" />
                            </div>
                            <div className="vp-caracteristica-text">
                                <p className="vp-caracteristica-label">
                                    Edad máxima de permanencia
                                </p>
                                <p className="vp-caracteristica-value">
                                    69 años + 364 días
                                </p>
                            </div>
                        </div>

                        {/* ITEM 3 */}
                        <div className="vp-caracteristica-item">
                            <div className="vp-caracteristica-icon">
                                <img src="/assets/images/seguros/img3.svg" alt="" />
                            </div>
                            <div className="vp-caracteristica-text">
                                <p className="vp-caracteristica-label">
                                    Te permite cubrir
                                </p>
                                <p className="vp-caracteristica-value">
                                    Respaldo financiero para ti y tus beneficiarios
                                </p>
                            </div>
                        </div>
                    </div><br /><br />
                </div>
            </section >

            {/* 8. TARIFAS */}
            < section
                id="contentTasasTarifas"
                className="vp-tarifas-section"
            >
                <div className="vp-tarifas-container">
                    <h2 className="vp-tarifas-title text-center" style={{ fontWeight: 900 }}>
                        Tarifas
                    </h2>
                    <div className="vp-tarifas-table-wrapper">
                        <table className="vp-tarifas-table text-center">
                            <colgroup>
                                <col className="col-desc" />
                                <col className="col-tarifa" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Tarifa</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Cobertura Total</td>
                                    <td>
                                        <p><b>Tarifa sin IVA</b> $234.899</p>
                                        <p><b>Tarifa con IVA</b> $289.999</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section >

            {/* 8. TARIFAS */}
            < section className="vp-tabs-section" id="solicitudSeguro" >
                <div className="vp-tabs-container">

                    {/* TABS HEADER */}
                    <div className="vp-tabs-header">
                        <button className={`vp-tab`} onClick={(e) => { e.preventDefault(); redirecTo(); }}>Solicitud</button>
                        <button className="vp-tab" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Reclamación</button>
                        <button className="vp-tab" onClick={(e) => { e.preventDefault(); redirecTo(); }} style={{ borderBottom: mobile ? '1px solid #2c2a29' : 'auto' }} >Cancelación</button>
                        {mobile ? (
                            <>
                                <button
                                    className={`vp-tab mt-4 ${docsOpen ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDocsOpen(!docsOpen);
                                    }}
                                    style={{ marginTop: mobile ? '1.5rem' : '0', borderBottom: mobile ? '1px solid #2c2a29' : 'none' }}
                                >
                                    Documentos
                                </button>

                                <div id='documentos' className={`vp-documents-content mb-4 ${docsOpen ? 'open' : ''}`}>
                                    <div className="vp-documents-grid">
                                        <a className="vp-documents-item" href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>
                                            <span className="vp-doc-icon">📄</span>
                                            Póliza seguro cuentas
                                        </a>
                                        <a className="vp-documents-item" href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>
                                            <span className="vp-doc-icon">📄</span>
                                            Condiciones generales
                                        </a>
                                        <a className="vp-documents-item" href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>
                                            <span className="vp-doc-icon">📄</span>
                                            Formato de novedades
                                        </a>
                                        <a className="vp-documents-item" href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>
                                            <span className="vp-doc-icon">📄</span>
                                            Formulario de Declaración de Siniestro
                                        </a>
                                        <a className="vp-documents-item" href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>
                                            <span className="vp-doc-icon">📄</span>
                                            Póliza seguro TC
                                        </a>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>

                    {/* TAB CONTENT */}
                    <div className="vp-tab-panel active">
                        <div className="vp-tab-row">

                            {/* IMAGEN */}
                            <div className="vp-tab-image">
                                <img
                                    src="/assets/images/seguros/persons.png"
                                    alt="Solicitud"
                                />
                            </div>

                            {/* CONTENIDO */}
                            <div className="vp-tab-content">
                                <div className="vp-tab-scroll">
                                    <h3><b>¿Cómo solicitar tu Seguro de Vida y Salud?</b></h3>
                                    <p>
                                        <strong>
                                            Este seguro es ofrecido únicamente por televentas, un asesor
                                            deberá contactarse contigo.
                                        </strong>
                                        Acepta la llamada para la vinculación y autoriza el débito de la
                                        prima mensual, con cargo a la tarjeta de crédito, cuenta de ahorro
                                        o corriente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!mobile ? (
                        <>
                            <section className="vp-documents-section" id="documentos">
                                <div className="vp-documents-container">
                                    {/* HEADER ACCORDION */}
                                    <div
                                        className={`vp-documents-header ${docsOpenDesktop ? 'open' : ''}`}
                                        onClick={() => setDocsOpenDesktop(!docsOpenDesktop)}
                                    >
                                        <h6>Documentos</h6>
                                        <Chevron open={docsOpenDesktop} />
                                    </div>

                                    {/* CONTENT ACCORDION */}
                                    <div className={`vp-documents-content ${docsOpenDesktop ? 'open' : ''}`}>
                                        <div className="vp-documents-grid">
                                            <a className="vp-documents-item" href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>
                                                <span className="vp-doc-icon">📄</span>
                                                Póliza seguro cuentas
                                            </a>

                                            <a className="vp-documents-item" href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>
                                                <span className="vp-doc-icon">📄</span>
                                                Condiciones generales
                                            </a>

                                            <a className="vp-documents-item" href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>
                                                <span className="vp-doc-icon">📄</span>
                                                Formato de novedades
                                            </a>

                                            <a className="vp-documents-item" href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>
                                                <span className="vp-doc-icon">📄</span>
                                                Formulario de Declaración de Siniestro
                                            </a>

                                            <a className="vp-documents-item" href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>
                                                <span className="vp-doc-icon">📄</span>
                                                Póliza seguro TC
                                            </a>

                                        </div>
                                    </div>
                                </div>
                            </section>
                        </>) : null}
                </div>
            </section >

            {/* 9. INFORMACIÓN LEGAL */}
            < section id='informacionLegal' className="vp-legal-section" >
                <div className="vp-legal-container">
                    <h2 className="vp-legal-title">Información legal:</h2>

                    <div className="vp-legal-card">
                        <div className="vp-legal-image">
                            <img
                                src="/assets/images/seguros/candado.webp"
                                alt="Información legal"
                            />
                        </div>

                        <div className="vp-legal-content">
                            <p>
                                Suramericana de Seguros S.A. asume exclusivamente la responsabilidad del cumplimiento de las obligaciones del producto frente al consumidor financiero. Este producto es ofrecido por la red de Bancolombia S.A., la cual se limita única y exclusivamente al correcto cumplimiento de las instrucciones debidamente impartidas por Suramericana de Seguros S.A. para la prestación del servicio a través de dicha red.
                            </p>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); redirecTo(); }}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="vp-legal-link"
                            >
                                <span style={{ textDecoration: 'underline' }}>
                                    Para más información visita Sura S.A.
                                </span>
                                <span className="vp-legal-arrow" style={{ textDecoration: 'none' }}>→</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section >

            {/* 10. PREGUNTAS FRECUENTES */}
            < section id='preguntas' className="vp-faq-section" >
                <h2 className="vp-faq-title">Preguntas frecuentes</h2>
                <div className="vp-faq-container">
                    {/* CARD GRANDE */}
                    <div className="vp-faq-main-card">
                        <div className="vp-faq-main-body">

                            {/* COLUMNA IZQUIERDA */}
                            <div className="vp-faq-main-text">
                                <span>EDUCACIÓN FINANCIERA</span>
                                <h5 className='opensans-bold'>¿Por qué un seguro de vida y salud es clave para proteger tu estabilidad financiera?</h5>
                                <button className="vp-faq-arrow-btn" onClick={(e) => { e.preventDefault(); redirecTo(); }}>→</button>
                            </div>

                            {/* COLUMNA DERECHA */}
                            <div className="vp-faq-main-image">
                                <img
                                    src="/assets/images/imagemed.png"
                                    alt="Educación financiera"
                                />
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="vp-faq-footer">
                            <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Ir a Educación Financiera</a>
                            <span>→</span>
                        </div>
                    </div>

                    {/* CARDS PEQUEÑAS */}
                    <div className="vp-faq-swiper">
                        <div className="vp-faq-cards">
                            <div className="vp-faq-card green">
                                <span>PREGUNTAS FRECUENTES</span>
                                <h5>
                                    ¿Cómo puedo acceder al respaldo de mi seguro de vida y salud en caso de una situación de salud?
                                </h5>

                            </div>
                            <div className="vp-faq-card blue">
                                <span>PREGUNTAS FRECUENTES</span>
                                <h5>
                                    ¿Qué sucede con el seguro y el pago a mis beneficiarios en caso de fallecimiento?
                                </h5>
                            </div>
                            <div className="vp-faq-card yellow">
                                <span>PREGUNTAS FRECUENTES</span>
                                <h5>
                                    ¿Qué debo hacer para solicitar el pago del seguro cuando ocurra un evento cubierto?
                                </h5>
                            </div>
                        </div>
                        <div className="vp-faq-footer">
                            <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Ir a Preguntas Frecuentes</a>
                            <span>→</span>
                        </div>
                    </div>
                </div>
            </section >

            {/* 11. FOOTER */}
            < Footer />

            {/* MODAL ABEJA */}
            {abejaOpen === 1 ?
                <AbejaModal
                    isOpen={abejaOpen}
                    onClose={() => { setAbejaOpen(false); setOpenNavbarAbeja(true); }}
                /> : null}
        </div >
    );
};

// Se exporta el componente VistaPrincipal
export default VistaPrincipal;