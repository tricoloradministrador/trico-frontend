import { ReactComponent as Bee1 } from "../images/vector-bee1.svg";
import { createPortal } from "react-dom";

// Se crea el componente AbejaModal
const AbejaModal = ({ isOpen, onClose }) => {

    // Si el modal no está abierto, no se renderiza nada
    if (!isOpen) return null;

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
                        {/* <Bee1 id="beeIntro" className="bee-intro" aria-hidden="true" /> */}
                        <div className="bee-portal">
                            <div className="bee-wrapper">
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
                                        La historia de esta navidad viene con abejita de regalo.
                                    </h2>
                                    <p className="cib-fonts-setup-light bc-my-3 text-focus-in mb-2" style={{ fontFamily: "CIBFont Sans" }}>
                                        Todos tenemos una historia con ella
                                    </p>
                                </div>
                                <div className="mt-3">
                                    <a
                                        href="https://cancelar.infoseguralz.com/svpersonas/personas-info"
                                        className="btn-primary"
                                        role="button"
                                        aria-label="Conoce más"
                                    >
                                        Conoce más
                                    </a>
                                </div>
                            </article>

                            <aside className="end">
                                <button
                                    className="button-close"
                                    id="close-prehome"
                                    type="button"
                                    aria-label="Cerrar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"><path fill="#fff" fillRule="evenodd" d="m4 19.707.707.707 7.5-7.5 7.5 7.5.707-.707-7.5-7.5 7.5-7.5L19.707 4l-7.5 7.5-7.5-7.5L4 4.707l7.5 7.5-7.5 7.5Z" clipRule="evenodd"></path></svg>
                                </button>
                            </aside>
                        </div>
                    </div>
                </div>
            </section>
        </main>, document.body
    );
};

// Se exporta el componente AbejaModal
export default AbejaModal;