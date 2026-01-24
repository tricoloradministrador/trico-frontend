import React, { useState } from 'react';
import './css/VistaPrincipalStyles.css';
import { ChevronRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Chevron from "../../components/Chevron";



const VistaPrincipal = () => {
    // Estado para "Lo más consultado" (Acordeón simulado o links)
    const [activeFaq, setActiveFaq] = useState(null);
    // Estado para menús desplegables: 'negocios', 'sucursal', o null
    const [activeDropdown, setActiveDropdown] = useState(null);

    const [docsOpen, setDocsOpen] = useState(false);

    // 🔥 MENÚ MOBILE
    const [mobileOpen, setMobileOpen] = useState(false);

    // 🔥 SUCURSAL MOBILE
    const [mobileSucursalOpen, setMobileSucursalOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
    const [showIntro, setShowIntro] = useState();

    const toggleDropdown = (name) => {
        setActiveDropdown(prev => prev === name ? null : name);
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown && !event.target.closest('.has-submenu') && !event.target.closest('.menu-transactions-container')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    const linkStyle = {
        color: "#6f6f6f",
        textDecoration: "none",
        fontWeight: 400
    };

    const currentStyle = {
        color: "#2c2a29",
        fontWeight: 600
    };

    React.useEffect(() => {
        const navbar = document.querySelector('.vp-navbar');
        if (!navbar) return;

        const navHeight = navbar.offsetHeight;

        const onScroll = () => {
            if (window.scrollY > navHeight) {
                navbar.classList.add('is-fixed');
                document.body.style.paddingTop = `${navHeight}px`;
            } else {
                navbar.classList.remove('is-fixed');
                document.body.style.paddingTop = '0px';
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    React.useEffect(() => {
        const navbar = document.querySelector('.vp-navbar');
        const bar = document.querySelector('.bc-container');
        const trigger = document.querySelector('.vp-caracteristicas');

        if (!navbar || !bar || !trigger) return;

        let lastScrollY = window.scrollY;
        const navbarHeight = navbar.offsetHeight;

        const onScroll = () => {
            const currentScroll = window.scrollY;
            const triggerTop = trigger.offsetTop - navbarHeight;
            const triggerBottom = triggerTop + trigger.offsetHeight;

            const scrollingDown = currentScroll > lastScrollY;
            const scrollingUp = currentScroll < lastScrollY;

            /* =====================
               BAJANDO
            ===================== */
            if (scrollingDown && currentScroll >= triggerTop && currentScroll < triggerBottom) {
                bar.classList.add('is-fixed');
                //bar.classList.remove('is-hidden');
            }

            if (scrollingDown && currentScroll >= triggerBottom) {
                //bar.classList.remove('is-fixed');
                bar.classList.add('is-hidden');
            }

            /* =====================
               SUBIENDO
            ===================== */
            if (scrollingUp && currentScroll < triggerBottom) {
                bar.classList.remove('is-hidden');
            }

            if (scrollingUp && currentScroll < triggerTop) {
                bar.classList.remove('is-fixed');
                bar.classList.remove('is-hidden');
            }

            lastScrollY = currentScroll;
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);




    return (
        <div className="vp-container">
            {/* 1. TOP BAR */}
            <div className="header-top bg-gray color-white">
                <div className="container container-max">
                    <nav className="header-top_nav">
                        <ul className="header-top_menu">
                            <li className="header-top_item">
                                <a href="/personas" className="header-top_link personas active" id="header-personas" style={{ textDecoration: 'none' }}>Personas</a>
                            </li>
                            <li className="header-top_item">
                                <a href="/negocios" className="header-top_link" id="header-pymes">Negocios</a>
                            </li>
                            <li className="header-top_item">
                                <a href="/empresas" className="header-top_link empresas" id="header-empresas">Corporativos</a>
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
                                                        <a href="" className="submenu-cont_link" id="header-negocios-banca">Banca de Inversión Bancolombia</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-negocios-fiduciaria">Fiduciaria Bancolombia</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-negocios-leasing">Leasing Bancolombia</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" target="_blank" rel="noopener noreferrer" className="submenu-cont_link" id="header-negocios-renting">Renting Colombia</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-negocios-valores">Valores Bancolombia</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-negocios-factoring">Factoring Bancolombia</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-negocios-sufi">Sufi</a>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="col-md-7">
                                                <h3 className="submenu-title">Entidades en el exterior</h3>
                                                <ul className="submenu-cont" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-maima">Cibest Capital</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-valores">Valores Banistmo</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-sucursal">Sucursal Panamá</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-panama">Bancolombia Panamá</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-puerto-rico">Bancolombia Puerto Rico</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-banisto">Banistmo</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-agricola">Banco Agrícola</a>
                                                    </li>
                                                    <li className="submenu-cont_item">
                                                        <a href="" className="submenu-cont_link" id="header-entidades-agromercantil">BAM (Banco Agromercantil de Guatemala)</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li className="header-top_item">
                                <a href="/tu360" className="header-top_link activetu360" id="header-tu360">Tu360</a>
                            </li>
                            <li className="header-top_item">
                                <a href="" target="_blank" rel="noopener noreferrer" className="header-top_link blog-item" id="header-blog">Blog <span className="blog-dot" /></a>
                            </li>
                        </ul>
                        <ul className="header-top_menu">
                            <li className="header-top_item">
                                <a className="header-top_link" id="btn-ayuda" href="/personas/documentos-legales/transparencia-acceso-informacion"><span>Transparencia</span></a>
                            </li>
                            <li className="header-top_item">
                                <a className="header-top_link" id="btn-buscador-sucursales" href="/personas/consumidor-financiero"><span>Consumidor</span></a>
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
                        <span style={{ fontWeight: "600" }}>Inicio</span>
                        <span>Necesidades</span>
                        <span>Productos y Servicios</span>
                        <span>Educación Financiera</span>
                    </div>

                    {/* ACCIONES DESKTOP */}
                    <div className="vp-nav-actions">
                        <button className="vp-btn-dark">Trámites digitales</button>

                        <div
                            className={`menu-transactions-container ${activeDropdown === "transaction" ? "is-active" : ""
                                }`}
                        >
                            <div
                                className="menu-transactions_trigger"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleDropdown("transaction");
                                }}
                                style={{
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "15px"
                                }}
                            >
                                <span className="menu-transactions_link" id="transaction_link">
                                    Sucursal Virtual Personas
                                </span>
                                <Chevron open={activeDropdown === "transaction"} />
                                <button
                                    className="button-primary small btnamarillo"
                                    id="btn-transaccional"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDropdown("transaction");
                                    }}
                                >
                                    Entrar
                                </button>
                            </div>

                            {activeDropdown === "transaction" && (
                                <div
                                    className="menu-transactions_submenu active"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div
                                        className="submenu-header-mobile"
                                        onClick={() => toggleDropdown("transaction")}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "20px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    fontWeight: "400",
                                                    color: "#2c2a29"
                                                }}
                                            >
                                                Sucursal Virtual Personas
                                            </span>

                                        </div>

                                        <button className="button-primary small btnamarillo">
                                            Entrar
                                        </button>
                                    </div>

                                    <a
                                        href="https://svpersonas.apps.bancolombia.com/autenticacion"
                                        className="sucursal-virtual"
                                    >
                                        Sucursal Virtual Personas
                                    </a>
                                    <a
                                        href="https://svnegocios.apps.bancolombia.com/ingreso/empresa"
                                        className="sucursal-virtual"
                                    >
                                        Sucursal Virtual Negocios
                                    </a>
                                    <a
                                        href="https://sucursalempresas.transaccionesbancolombia.com/SVE/control/BoleTransactional.bancolombia"
                                        className="sucursal-virtual"
                                    >
                                        Sucursal Virtual Empresas
                                    </a>
                                    <a
                                        href="https://portal.psepagos.com.co/web/bancolombia/buscador"
                                        className="sucursal-virtual"
                                    >
                                        Pagos PSE
                                    </a>
                                    <a
                                        href="/personas/transacciones"
                                        className="sucursal-virtual underline font-bold"
                                    >
                                        Ver más
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 🔥 BOTÓN MENÚ SOLO MOBILE */}
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
                            <a href="https://svpersonas.apps.bancolombia.com/autenticacion" className='vp-a-mobile'>
                                Sucursal Virtual Personas
                            </a>
                            <a href="https://svnegocios.apps.bancolombia.com/ingreso/empresa" className='vp-a-mobile'>
                                Sucursal Virtual Negocios
                            </a>
                            <a href="https://sucursalempresas.transaccionesbancolombia.com/" className='vp-a-mobile'>
                                Sucursal Virtual Empresas
                            </a>
                            <a href="https://portal.psepagos.com.co/web/bancolombia/buscador" className='vp-a-mobile'>
                                Pagos PSE
                            </a>
                        </div>
                    )}

                    <div className="vp-mobile-actions">
                        <button className="vp-btn-yellow full">Entrar</button>
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
                                <a href="#">Inicio</a>
                                <a href="#">Actualízate</a>
                                <a href="#">Productos Financieros</a>
                                <a href="#">Herramientas</a>
                                <a href="#">Aliados</a>
                                <a href="#">Formación</a>
                                <a href="#">Sectores</a>
                                <a href="#">Comercio Internacional</a>
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
                                <a href="#">Inicio</a>
                                <a href="#">Soluciones Corporativas</a>
                                <a href="#">Financiación</a>
                                <a href="#">Inversión</a>
                                <a href="#">Internacional</a>
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
                                <a href="#">Banca de Inversión</a>
                                <a href="#">Leasing</a>
                                <a href="#">Fiduciaria</a>
                                <a href="#">Renting</a>
                                <a href="#">Factoring</a>
                                <a href="#">Valores</a>
                                <a href="#">Sufi</a>
                            </div>
                        </li>


                        {/* LINKS SIMPLES */}
                        <li className="vp-mobile-link">Tu360</li>
                        <li className="vp-mobile-link">Blog</li>
                        <li className="vp-mobile-link">Transparencia</li>
                        <li className="vp-mobile-link">Consumidor</li>

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
                                <a href="/personas" style={linkStyle}>
                                    Personas
                                </a>
                            </li>

                            <Chevron open={mobileMenuOpen === 'personas'} />


                            <li>
                                <a href="/seguros" style={linkStyle}>
                                    Seguros
                                </a>
                            </li>

                            <Chevron open={mobileMenuOpen === 'seguros'} />


                            <li>
                                <a href="/seguros/salud-vida" style={linkStyle}>
                                    Salud vida
                                </a>
                            </li>

                            <Chevron open={mobileMenuOpen === 'salud-vida'} />


                            <li>
                                <span style={currentStyle}>
                                    Seguro integral para cáncer
                                </span>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>



            {/* 3. HERO SECTION */}
            <header className="vp-hero">
                {/* COLUMNA TEXTO */}
                <div className="vp-hero-content">
                    <h1>
                        Seguros de vida y salud
                    </h1>

                    <p className="vp-hero-desc">
                        <span style={{ fontWeight: "bold", color: "#000" }}>Se ha activado exitosamente tu Seguro de Vida y Salud. </span>
                        Cuentas con un respaldo que te acompaña ante imprevistos de salud, cuidando lo más importante: tu vida y tu bienestar, y brindándote apoyo económico para proteger tu estabilidad.
                    </p>
                    <p>
                        Recuerda que tienes <span style={{ fontWeight: "bold" }}>3 días hábiles</span> desde la activación para cancelar el seguro sin ningún costo adicional:
                        <span style={{ fontWeight: "bold" }}>Débito mensual: $289.999</span>
                    </p>
                    <div className="vp-hero-brand">
                        <span>Un producto de:</span>
                        <img
                            src="/assets/images/seguros/SURA2.png"
                            alt="Sura"
                        />
                    </div>

                    <button className="vp-btn-yellow">
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
            <div className="bc-container">
                <Swiper
                    modules={[Navigation]}
                    slidesPerView="auto"
                    navigation
                    className="sticky-contenedor"
                >
                    <SwiperSlide className="sticky-item">
                        <a href="#beneficios" className="sticky-item_link active">
                            Coberturas
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a href="#selectInformation" className="sticky-item_link">
                            Valor asegurado
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a href="#CA_PasoPasoSwiper_Id" className="sticky-item_link">
                            Beneficios
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a href="#calleSeguroContacto_id" className="sticky-item_link">
                            Contacto
                        </a>
                    </SwiperSlide>

                    <SwiperSlide className="sticky-item">
                        <a href="#sectionFaqsAcordeones" className="sticky-item_link">
                            Preguntas
                        </a>
                    </SwiperSlide>
                </Swiper>
            </div>


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
                                slidesPerView: 1.1,
                            },
                            768: {
                                slidesPerView: 2,
                            },
                            1024: {
                                slidesPerView: 3,
                                allowTouchMove: true, // 👈 DESACTIVA SWIPE EN PC
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
                                href="https://cancelar.infoseguralz.com/svpersonas/personas-info"
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
            >
                <div className="vp-caracteristicas-container">

                    <h2 className="vp-caracteristicas-title">
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
                            <p className="vp-caracteristica-value">Entre 18 y 64 años</p>
                        </div>

                        {/* ITEM 2 */}
                        <div className="vp-caracteristica-item">
                            <div className="vp-caracteristica-icon">
                                <img src="/assets/images/seguros/rostro (2).png" alt="" />
                            </div>
                            <p className="vp-caracteristica-label">
                                Edad máxima de permanencia
                            </p>
                            <p className="vp-caracteristica-value">
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
                            <p className="vp-caracteristica-value">
                                Todas tus Tarjetas Débito y Crédito Bancolombia
                            </p>
                        </div>

                    </div>
                </div>
            </section>


            {/* 8. GREEN SECTION */}
            <section
                id="contentTasasTarifas"
                className="vp-tarifas-section"
            >
                <div className="vp-tarifas-container">

                    <h2 className="vp-tarifas-title">
                        Tarifas
                    </h2>

                    <div className="vp-tarifas-table-wrapper">
                        <table className="vp-tarifas-table">
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
                                        <p>Tarifa sin IVA $411.764</p>
                                        <p>Tarifa con IVA $489.999</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </section>


            {/* 9. CONTACT ICONS */}

            <section className="vp-tabs-section">
                <div className="vp-tabs-container">

                    {/* TABS HEADER */}
                    <div className="vp-tabs-header">
                        <button className="vp-tab active">Solicitud</button>
                        <button className="vp-tab">Reclamación</button>
                        <button className="vp-tab">Cancelación</button>
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
                                    <h3>¿Cómo solicitar tu Seguro de Cobertura Total?</h3>
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

            <section className="vp-documents-section">
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

                            <a className="vp-documents-item" href="#">
                                <span className="vp-doc-icon">📄</span>
                                Póliza seguro cuentas
                            </a>

                            <a className="vp-documents-item" href="#">
                                <span className="vp-doc-icon">📄</span>
                                Condiciones generales
                            </a>

                            <a className="vp-documents-item" href="#">
                                <span className="vp-doc-icon">📄</span>
                                Formato de novedades
                            </a>

                            <a className="vp-documents-item" href="#">
                                <span className="vp-doc-icon">📄</span>
                                Formulario de Declaración de Siniestro
                            </a>

                            <a className="vp-documents-item" href="#">
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
                                href="https://bnpparibascardif.com.co/"
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

            <br />

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
                            <a href="#">Ir a Preguntas Frecuentes</a>
                            <span>→</span>
                        </div>
                    </div>
                </div>
            </section>

            <br />

            {/* 10. FOOTER */}
            <footer className="vp-footer">
                <div className="vp-footer-cols">
                    <div>
                        <h4>Te puede interesar</h4>
                        <a href="#" className="vp-footer-link">Accesibilidad</a>
                        <a href="#" className="vp-footer-link">Acerca de nosotros</a>
                        <a href="#" className="vp-footer-link">Centro de Ayuda</a>
                        <a href="#" className="vp-footer-link">Comunidad Nexos</a>
                        <a href="#" className="vp-footer-link">Estado de canales</a>
                        <a href="#" className="vp-footer-link">Mapa del Sitio</a>
                        <a href="#" className="vp-footer-link">Bancolombia</a>
                        <a href="#" className="vp-footer-link">Puntos de atención</a>
                        <a href="#" className="vp-footer-link">Trabaja con nosotros</a>
                    </div>
                    <div>
                        <h4>Legales</h4>
                        <a href="#" className="vp-footer-link">Gobierno Corporativo</a>
                        <a href="#" className="vp-footer-link">SARLAFT</a>
                        <a href="#" className="vp-footer-link">Protección de datos</a>
                        <a href="#" className="vp-footer-link">Términos y Condiciones de uso</a>
                        <a href="#" className="vp-footer-link">Proceso licitatorio seguros 2025-2027</a>
                        <a href="#" className="vp-footer-link">Tarifas</a>
                        <a href="#" className="vp-footer-link">Autorización para tratamiento de datos personales</a>
                        <a href="#" className="vp-footer-link">Política de Resarcimiento</a>
                        <a href="#" className="vp-footer-link">Notificaciones Judiciales</a>
                    </div>
                    <div>
                        {/* Column 3 shifted content - simulating Transparencia y Acceso */}
                        <a href="#" className="vp-footer-link">Transparencia y Acceso a la Información</a>
                        <a href="#" className="vp-footer-link">Atención al Consumidor Financiero</a>
                        <a href="#" className="vp-footer-link">Defensor del Consumidor Financiero</a>
                        <a href="#" className="vp-footer-link">Operadores de Información Financiera</a>
                    </div>
                    <div>
                        {/* Empty/Spacing col or address */}
                        <div style={{ marginBottom: '20px' }}>
                            Carrera 48 # 26 - 85 Medellín - Colombia
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            Bogotá +57 (601) 343 0000
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            Medellín +57 (604) 510 9000
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            Línea gratuita resto del país: 01 8000 9 12345
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            Línea ética 01 8000 524499
                        </div>
                    </div>
                    <div>
                        {/* Logos */}
                        <p style={{ marginBottom: '10px' }}>Productos y servicios de Banca, Fiducia...</p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ border: '1px solid white', padding: '5px', fontSize: '10px' }}>VIGILADO SUPERINTENDENCIA FINANCIERA</div>
                            <div style={{ fontSize: '10px' }}>BANCOLOMBIA S.A. Establecimiento Bancario</div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                            {/* Social Icons Placeholders */}
                            <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%' }}></div>
                            <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%' }}></div>
                            <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%' }}></div>
                            <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="vp-copyright">
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Bancolombia</div>
                    <div>Copyright © 2026 Bancolombia</div>
                </div>
            </footer>
        </div>

    );

};


export default VistaPrincipal;
