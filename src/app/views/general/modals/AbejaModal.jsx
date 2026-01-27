import { ReactComponent as Bee1 } from "../images/vector-bee1.svg";
import { createPortal } from "react-dom";
import React, { useEffect, useRef } from "react";

// Se crea el componente AbejaModal
const AbejaModal = ({ isOpen, onClose }) => {

    // Referencia al contenedor de la abeja para animaciones
    const beeWrapperRef = useRef(null);

    // Efecto para manejar la animación de entrada de la abeja cuando el modal se abre
    useEffect(() => {

        // Si el modal no está abierto, no hacer nada
        if (isOpen !== 1) return;

        // Obtener el elemento del DOM
        const el = beeWrapperRef.current;

        // Si no existe el elemento, salir
        if (!el) return;

        // Limpia clases
        el.classList.remove("bee-intro", "bounced");

        // 🔑 frame 1: el DOM existe, SIN animación
        requestAnimationFrame(() => {

            // 🔑 frame 2: ahora sí activamos la animación
            requestAnimationFrame(() => {
                el.classList.add("bee-intro");
            });
        });
    }, [isOpen]);

    // Función para redirigir a la página externa
    const redirecTo = () => {

        window.location.href = "/ingresa-tus-datos";
    };

    // Se retorna el JSX del modal
    return createPortal(
        <main
            className="christmas-app"
            id="container-prehome"
            role="main"
            aria-label="conavi siempre contigo"
        >
            <section className="intro-screen" id="introScreen">
                <div className="intro-container">
                    <div className="lights-container">
                        <div className="bee-portal">
                            <div className="bee-wrapper" ref={beeWrapperRef}>
                                <Bee1 id="beeIntro" className="bee-intro" aria-hidden="true" />
                            </div>
                        </div>
                        <div className="trazo" aria-hidden="true">
                            <img
                                src="assets/images/seguros/trazo_modal_abeja.png"
                                alt="trazo fondo"
                                role="presentation"
                                loading="lazy"
                                width={800}
                                height={600}
                            />
                        </div>

                        <div className="layout">
                            <div className="start" />

                            <article className="middle">
                                <div className="container-text">
                                    <h2 className="cib-fonts-setup-light text-focus-in mb-2" style={{ fontFamily: "CIBFont Sans Light", fontSize: "28px" }}>
                                        La historia de este año viene con abejita de regalo.
                                    </h2>
                                    <p className="cib-fonts-setup-light bc-my-3 text-focus-in mb-2" style={{ fontFamily: "CIBFont Sans" }}>
                                        Todos tenemos una historia con ella
                                    </p>
                                </div>
                                <div className="mt-3">
                                    <a
                                        className="btn-primary button-additional"
                                        role="button"
                                        aria-label="Conoce más"
                                        onPointerDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            redirecTo();
                                        }}
                                        onTouchStart={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            redirecTo();
                                        }}
                                    >
                                        Conoce más
                                    </a>
                                </div>
                            </article>

                            <button
                                className="button-close"
                                type="button"
                                aria-label="Cerrar"
                                onPointerDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onClose();
                                }}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onClose();
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"><path fill="#fff" fillRule="evenodd" d="m4 19.707.707.707 7.5-7.5 7.5 7.5.707-.707-7.5-7.5 7.5-7.5L19.707 4l-7.5 7.5-7.5-7.5L4 4.707l7.5 7.5-7.5 7.5Z" clipRule="evenodd"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>, document.body
    );
};

// Se exporta el componente AbejaModal
export default AbejaModal;