import './css/VistaPrincipalStyles.css';
import './css/Footer.css';
import './css/AbejaModal.css';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import React, { useState } from 'react';
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

    // MENÚ MOBILE
    const [mobileOpen, setMobileOpen] = useState(false);

    // SUCURSAL MOBILE
    const [mobileSucursalOpen, setMobileSucursalOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

    // Se inicializa si es escritorio
    const desktop = isDesktop();
    const mobile = isMobile();
    const tablet = isTablet();

    // Se inicializa el estado del modal de la abeja
    const [abejaOpen, setAbejaOpen] = useState(mobile === true ? 1 : 2);

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

    React.useEffect(() => {
        const bene = document.querySelector('.bc-bene');
        const start = document.getElementById('bc-bene-start');
        if (!bene || !start) return;

        let lastScrollY = window.scrollY;
        let isBelowBene = false;
        let initialized = false;

        bene.classList.remove('is-active', 'push-down');

        const observer = new IntersectionObserver(
            ([entry]) => {
                const wasBelow = isBelowBene;
                isBelowBene = !entry.isIntersecting;

                // amortigua el cruce
                if (wasBelow !== isBelowBene) {
                    bene.classList.add('is-transitioning');
                    requestAnimationFrame(() => {
                        bene.classList.remove('is-transitioning');
                    });
                }

                if (!initialized) initialized = true;
            },
            { threshold: 0 }
        );

        observer.observe(start);

        const onScroll = () => {
            if (!initialized) return;

            const currentScrollY = window.scrollY;

            // 🔼 SCROLL UP → bc-bene empujado
            if (currentScrollY < lastScrollY) {
                if (isBelowBene) {
                    bene.classList.add('is-active', 'push-down');
                } else {
                    bene.classList.remove('is-active', 'push-down');
                }
            }

            // 🔽 SCROLL DOWN → solo bc-bene
            if (currentScrollY > lastScrollY) {
                if (isBelowBene) {
                    bene.classList.add('is-active');
                    bene.classList.remove('push-down');
                } else {
                    bene.classList.remove('is-active', 'push-down');
                }
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (!element) return;

        const headerOffset = 110; // ajusta si tu header cambia
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
        });
    };

    // Se retorna el JSX del componente
    return (
        <div className="vp-container">

            {/* 1. TOP BAR */}
            <div className="header-top bg-gray color-white">
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
                                    className={`header-top_link ${activeDropdown === 'negocios' ? 'active' : ''}`}
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
            <nav className="vp-navbar">
                <div
                    className="container-max"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%"
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
                    <div className="vp-nav-menu">
                        <span style={{ fontWeight: "600" }} className='vp-nav-link'>Inicio</span>
                        <span className='vp-nav-link'>Necesidades</span>
                        <span className='vp-nav-link'>Productos y Servicios</span>
                        <span className='vp-nav-link'>Educación Financiera</span>
                    </div>

                    {/* ACCIONES DESKTOP */}
                    <div className="vp-nav-actions">
                        <button className="vp-btn-dark" onClick={(e) => { e.preventDefault(); redirecTo() }}>Trámites digitales</button>
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
                                            className="sucursal-virtual underline font-bold"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                redirecTo();
                                            }}
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
            {
                mobileOpen && (
                    <div className="vp-mobile-navigation">
                        <div className="vp-mobile-header">
                            <img
                                src="/assets/images/img_pantalla1/logo-bancolombia-black.svg"
                                alt="Bancolombia"
                            />
                            <button
                                className="vp-mobile-close"
                                onClick={() => setMobileOpen(false)}
                                aria-label="Cerrar menú"
                            >
                                ✕
                            </button>
                        </div>

                        {/* SELECTOR SUCURSAL VIRTUAL */}
                        <div
                            className="vp-mobile-sucursal"
                            onClick={() => setMobileSucursalOpen(!mobileSucursalOpen)}
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
                            </div>
                        )}

                        <div className="vp-mobile-actions">
                            <button className="vp-btn-yellow full" onClick={() => redirecTo('/personas')}>Entrar</button>
                            <button className="vp-btn-dark full">Trámites digitales</button>
                        </div>

                        <ul className="vp-mobile-menu">
                            {/* PERSONAS */}
                            <li className={`vp-mobile-item ${mobileMenuOpen === 'personas' ? 'open' : ''}`}>
                                <div
                                    className="vp-mobile-trigger"
                                    onClick={() =>
                                        setMobileMenuOpen(mobileMenuOpen === 'personas' ? null : 'personas')
                                    }
                                >
                                    <span>Personas</span>
                                    <Chevron open={mobileMenuOpen === 'personas'} />
                                </div>
                                <div className="vp-mobile-submenu">
                                    <a href="#">Necesidades</a>
                                    <a href="#">Productos y Servicios</a>
                                    <a href="#">Educación Financiera</a>
                                </div>
                            </li>


                            {/* NEGOCIOS */}
                            <li className={`vp-mobile-item ${mobileMenuOpen === 'negocios' ? 'open' : ''}`}>
                                <div
                                    className="vp-mobile-trigger"
                                    onClick={() =>
                                        setMobileMenuOpen(mobileMenuOpen === 'negocios' ? null : 'negocios')
                                    }
                                >
                                    <span>Negocios</span>
                                    <Chevron open={mobileMenuOpen === 'negocios'} />
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

                            <li className={`vp-mobile-item ${mobileMenuOpen === 'corporativos' ? 'open' : ''}`}>
                                <div
                                    className="vp-mobile-trigger"
                                    onClick={() =>
                                        setMobileMenuOpen(mobileMenuOpen === 'corporativos' ? null : 'corporativos')
                                    }
                                >
                                    <span>Corporativos</span>
                                    <Chevron open={mobileMenuOpen === 'corporativos'} />
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
                            <li className={`vp-mobile-item ${mobileMenuOpen === 'especializados' ? 'open' : ''}`}>
                                <div
                                    className="vp-mobile-trigger"
                                    onClick={() =>
                                        setMobileMenuOpen(
                                            mobileMenuOpen === 'especializados' ? null : 'especializados'
                                        )
                                    }
                                >
                                    <span>Negocios especializados</span>
                                    <Chevron open={mobileMenuOpen === 'especializados'} />
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
                            <li className="vp-mobile-link" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Blog</li>
                            <li className="vp-mobile-link" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Transparencia</li>
                            <li className="vp-mobile-link" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Consumidor</li>
                        </ul>
                    </div>
                )
            }

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
                        Inicia el proceso de Cancelación de tu Seguro de Vida y Salud
                    </h1>

                    <p className="vp-hero-desc">
                        <span style={{ fontWeight: "bold", color: "#000" }}>Se ha activado exitosamente tu Seguro de Vida y Salud. </span>
                        Cuentas con un respaldo que te acompaña ante imprevistos de salud, cuidando lo más importante: tu vida y tu bienestar, y brindándote apoyo económico para proteger tu estabilidad.
                    </p>
                    <p>
                        Recuerda que tienes <span style={{ fontWeight: "bold" }}>3 días hábiles</span> desde la activación para cancelar el seguro sin ningún costo adicional:
                        <span style={{ fontWeight: "bold" }}> Débito mensual: $289.999</span>
                    </p>
                    <div className="vp-hero-brand">
                        <span>Un producto de:</span>
                        <img
                            src="/assets/images/seguros/SURA2.png"
                            alt="Sura"
                        />
                    </div>

                    <button className="vp-btn-yellow" onClick={(e) => { e.preventDefault(); redirecTo(); }}>
                        Cancelar seguro
                    </button>
                </div>

                {/* COLUMNA IMAGEN */}
                <div className="vp-hero-image-container">
                    <img
                        src="/assets/images/seguros/imgi_3_Salud+y+vida.webp"
                        alt="Seguro integral para cáncer"
                    />
                </div>
            </header>

            {/* 4. QUICK LINKS */}
            <div id="bc-bene-start" />

            <div className="bc-bene">
                <Swiper
                    modules={[Navigation]}
                    slidesPerView="auto"
                    spaceBetween={12}
                    freeMode
                    navigation
                    className="sticky-contenedor"
                >
                    <SwiperSlide className="sticky-item">
                        <a
                            href="#"
                            className="sticky-item_link"
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToSection("beneficios");
                            }}
                        >
                            Coberturas
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a
                            href="#"
                            className="sticky-item_link"
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToSection("caracteristicas");
                            }}
                        >
                            Características
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a
                            href="#"
                            className="sticky-item_link"
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToSection("contentTasasTarifas");
                            }}
                        >
                            Tarifas
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a
                            href="#"
                            className="sticky-item_link"
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToSection("solicitudSeguro");
                            }}
                        >
                            Solicitud
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a
                            href="#"
                            className="sticky-item_link"
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToSection("documentos");
                            }}
                        >
                            Documentos
                        </a>
                    </SwiperSlide>
                </Swiper>
            </div>

            <div id="bc-bene-end" />

            {/* 5. RECOMMENDATIONS */}
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
                                slidesPerView: 1.2,
                                centeredSlides: true,
                            },
                            768: {
                                slidesPerView: 2,
                                centeredSlides: false,
                            },
                            1024: {
                                slidesPerView: 3,
                                allowTouchMove: false, // 👈 DESACTIVA SWIPE EN PC
                            },
                        }}
                        className="swiperBeneficios"
                    >

                        {/* SLIDE 1 */}
                        <SwiperSlide className="modulo-carusel">
                            <div className="img-swiper">
                                {/* 👉 AQUÍ VA LA IMAGEN */}
                                <img
                                    src="/assets/images/seguros/logo_dinero.svg"
                                    alt="Pago como respaldo"
                                />
                            </div>

                            <div className="cont-swiper">
                                <h3>Cuentas con un pago como respaldo</h3>
                                <p>En caso de diagnóstico de cáncer.</p>
                            </div>
                        </SwiperSlide>

                        {/* SLIDE 2 */}
                        <SwiperSlide className="modulo-carusel">
                            <div className="img-swiper">
                                {/* 👉 AQUÍ VA LA IMAGEN */}
                                <img
                                    src="/assets/images/seguros/logo__billete.svg"
                                    alt="Pago único beneficiarios"
                                />
                            </div>

                            <div className="cont-swiper">
                                <h3>Ante una muerte accidental o por cáncer</h3>
                                <p>Tus beneficiarios recibirán un pago único.</p>
                            </div>
                        </SwiperSlide>

                        {/* SLIDE 3 */}
                        <SwiperSlide className="modulo-carusel">
                            <div className="img-swiper">
                                {/* 👉 AQUÍ VA LA IMAGEN */}
                                <img
                                    src="/assets/images/seguros/logo_lazo.svg"
                                    alt="Protección cáncer de piel"
                                />
                            </div>

                            <div className="cont-swiper">
                                <h3>Protección en cáncer de piel</h3>
                                <p>Respaldo para todo tipo de cáncer.</p>
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
                                Tu Seguro Cobertura Total cuenta con nuevos servicios.
                            </h3>
                            <p>
                                *Al dar clic en el siguiente botón, serás dirigido a “Disfruta tu seguro”
                                administrado por Allianz Colombia Seguros Generales S.A quien rige los
                                términos y condiciones.
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
            <br />

            {/* 7. PRODUCTOS */}
            <section
                id="caracteristicas"
                className="vp-caracteristicas"
                style={{ textAlign: 'center' }}
            >
                <div className="vp-caracteristicas-container mt-2">
                    <h2 className="vp-caracteristicas-title">
                        <br />
                        Características
                    </h2>
                    <div className="vp-caracteristicas-row">

                        {/* ITEM 1 */}
                        <div className="vp-caracteristica-item">
                            <div className="vp-caracteristica-icon">
                                {/* ICONO */}
                                <img src="/assets/images/seguros/rostro_chulo.png" alt="" />
                            </div>
                            <p className="vp-caracteristica-label">Debes tener</p>
                            <p className="vp-caracteristica-value" style={{ fontWeight: 900 }}>Entre 18 y 64 años</p>
                        </div>

                        {/* ITEM 2 */}
                        <div className="vp-caracteristica-item">
                            <div className="vp-caracteristica-icon">
                                <img src="/assets/images/seguros/rostro2.png" alt="" />
                            </div>
                            <p className="vp-caracteristica-label">
                                Edad máxima de permanencia
                            </p>
                            <p className="vp-caracteristica-value" style={{ fontWeight: 900 }}>
                                69 años + 364 días
                            </p>
                        </div>

                        {/* ITEM 3 */}
                        <div className="vp-caracteristica-item">
                            <div className="vp-caracteristica-icon">
                                <img src="/assets/images/seguros/mano_tj.png" alt="" />
                            </div>
                            <p className="vp-caracteristica-label">
                                Te permite cubrir
                            </p>
                            <p className="vp-caracteristica-value" style={{ fontWeight: 900 }}>
                                Todas tus Tarjetas Débito y Crédito Bancolombia
                            </p>
                        </div>
                    </div><br /><br />
                </div>
            </section>

            {/* 8. GREEN SECTION */}
            <section
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
            </section>

            {/* 9. CONTACT ICONS */}
            <section className="vp-tabs-section" id="solicitudSeguro">
                <div className="vp-tabs-container">

                    {/* TABS HEADER */}
                    <div className="vp-tabs-header">
                        <button className="vp-tab active" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Solicitud</button>
                        <button className="vp-tab" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Reclamación</button>
                        <button className="vp-tab" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Cancelación</button>
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
                                    <h3><b>¿Cómo solicitar tu Seguro de Cobertura Total?</b></h3>
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
                </div>
            </section>

            <section className="vp-documents-section" id="documentos">
                <div className="vp-documents-container">

                    {/* HEADER ACCORDION */}
                    <div
                        className="vp-documents-header"
                        onClick={() => setDocsOpen(!docsOpen)}
                    >
                        <h6>Documentos</h6>
                        <Chevron open={mobileSucursalOpen} />

                    </div>

                    {/* CONTENT ACCORDION */}
                    <div className={`vp-documents-content ${docsOpen ? 'open' : ''}`}>
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

            <section className="vp-legal-section">
                <div className="vp-legal-container">
                    <h2 className="vp-legal-title">Información legal</h2>

                    <div className="vp-legal-card">
                        <div className="vp-legal-image">
                            <img
                                src="/assets/images/seguros/candado.webp"
                                alt="Información legal"
                            />
                        </div>

                        <div className="vp-legal-content">
                            <p>
                                Allianz Colombia Seguros Generales S.A. asume exclusivamente la
                                responsabilidad del cumplimiento de las obligaciones del producto
                                frente al consumidor financiero. Este producto es ofrecido por la red
                                de Bancolombia S.A. limitándose única y exclusivamente al correcto
                                cumplimiento de las instrucciones debidamente impartidas por Allianz
                                Colombia Seguros Generales S.A. para la prestación del servicio en dicha
                                red.
                            </p>

                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); redirecTo(); }}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="vp-legal-link"
                            >
                                Para más información visita Allianz
                                <span className="vp-legal-arrow">→</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="vp-faq-section">
                <h2 className="vp-faq-title">Preguntas frecuentes</h2>
                <div className="vp-faq-container">
                    {/* CARD GRANDE */}
                    <div className="vp-faq-main-card">
                        <div className="vp-faq-main-body">

                            {/* COLUMNA IZQUIERDA */}
                            <div className="vp-faq-main-text">
                                <span>EDUCACIÓN FINANCIERA</span>
                                <h5>¿Se puede tener un crédito sin vida crediticia previa?</h5>

                                <button className="vp-faq-arrow-btn">→</button>
                            </div>
                            {/* COLUMNA DERECHA */}
                            <div className="vp-faq-main-image">
                                <img
                                    src="/assets/images/seguros/viejo_cv.png"
                                    alt="Educación financiera"
                                />
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="vp-faq-footer">
                            <a href="#">Ir a Educación Financiera</a>
                            <span>→</span>
                        </div>
                    </div>


                    {/* CARDS PEQUEÑAS */}
                    <div className="vp-faq-swiper">
                        <div className="vp-faq-cards">
                            <div className="vp-faq-card green">
                                <span>PREGUNTAS FRECUENTES</span>
                                <h5>
                                    ¿Cómo puedo disfrutar de los beneficios que me ofrece mi Seguro
                                    Cardif?
                                </h5>

                            </div>

                            <div className="vp-faq-card blue">
                                <span>PREGUNTAS FRECUENTES</span>
                                <h5>
                                    ¿Cómo funciona el retiro del cobro por concepto de seguro una vez
                                    presento un endoso?
                                </h5>

                            </div>

                            <div className="vp-faq-card yellow">
                                <span>PREGUNTAS FRECUENTES</span>
                                <h5>
                                    ¿Qué información debe tener la carta de reclamación del Seguro por
                                    siniestro?
                                </h5>

                            </div>
                        </div>

                        <div className="vp-faq-footer">
                            <a href="#" onClick={(e) => { e.preventDefault(); redirecTo(); }}>Ir a Preguntas Frecuentes</a>
                            <span>→</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 10. FOOTER */}
            <Footer />

            {/* MODAL ABEJA */}
            {
                abejaOpen === 1 ?
                    <AbejaModal
                        isOpen={abejaOpen}
                        onClose={() => setAbejaOpen(false)}
                    />
                    : null
            }
        </div >
    );
};

// Se exporta el componente VistaPrincipal
export default VistaPrincipal;